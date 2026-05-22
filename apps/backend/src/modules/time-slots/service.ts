// @ts-nocheck
import { MedusaService } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { TimeSlot, SlotReservation, TimeSlotWithAvailability } from "./models/time-slot"

const RESERVATION_TTL_MINUTES = 15

export type ReserveSlotResult =
  | { success: true; reservation_id: string; expires_at: Date; slot: TimeSlotWithAvailability }
  | { success: false; error: "slot_full" | "slot_not_found" | "slot_blocked" }

/**
 * Time Slots Service
 *
 * Krytyczne API:
 *  - generateSlotsForZone(zoneId, fromDate, daysAhead, template) — cron-callable
 *  - getAvailableSlots(zoneId, date) — dla storefront
 *  - reserveSlot(slotId, cartId) — PESSIMISTIC LOCK + TTL
 *  - confirmReservation(reservationId, orderId) — po placeOrder
 *  - releaseExpiredReservations() — cron, co minutę
 *
 * Pessimistic locking implementacja:
 *   BEGIN
 *   SELECT ... FOR UPDATE
 *   IF booked_count < capacity:
 *     UPDATE booked_count + 1
 *     INSERT reservation
 *   ELSE: ROLLBACK
 *   COMMIT
 */
export default class TimeSlotsService extends MedusaService({
  TimeSlot,
  SlotReservation,
}) {
  constructor(container: MedusaContainer) {
    super(...arguments)
  }

  /**
   * Generate time slots for a zone, given a template.
   * Idempotent — ON CONFLICT DO NOTHING.
   */
  async generateSlotsForZone(
    zoneId: string,
    fromDate: Date,
    daysAhead: number,
    template: Array<{ time_from: string; time_to: string; capacity: number; day_of_week?: number[] }>
  ): Promise<number> {
    const knex = this.getKnex_()
    let inserted = 0

    for (let i = 0; i < daysAhead; i++) {
      const date = new Date(fromDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()  // 1=Mon..7=Sun

      for (const slot of template) {
        if (slot.day_of_week && !slot.day_of_week.includes(dayOfWeek)) {
          continue
        }
        const result = await knex.raw(
          `
          INSERT INTO delivery_time_slots
            (delivery_zone_id, slot_date, time_from, time_to, capacity)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT (delivery_zone_id, slot_date, time_from) DO NOTHING
          RETURNING id
          `,
          [zoneId, dateStr, slot.time_from, slot.time_to, slot.capacity]
        )
        if (result.rows.length) inserted++
      }
    }

    return inserted
  }

  /**
   * Get all available slots for zone + date, with capacity info.
   */
  async getAvailableSlots(
    zoneId: string,
    date: string
  ): Promise<TimeSlotWithAvailability[]> {
    const knex = this.getKnex_()
    const result = await knex.raw(
      `
      SELECT
        id, slot_date::text AS slot_date,
        time_from::text AS time_from,
        time_to::text AS time_to,
        capacity, booked_count, status,
        (capacity - booked_count) AS available
      FROM delivery_time_slots
      WHERE delivery_zone_id = ?
        AND slot_date = ?
        AND status IN ('open', 'full')
      ORDER BY time_from ASC
      `,
      [zoneId, date]
    )
    return result.rows
  }

  /**
   * Reserve slot with pessimistic locking.
   * Returns reservation_id + expires_at if successful.
   *
   * IMPORTANT: this MUST run in a transaction.
   */
  async reserveSlot(slotId: string, cartId: string): Promise<ReserveSlotResult> {
    const knex = this.getKnex_()

    return await knex.transaction(async (trx: any) => {
      // 1. Lock the slot row for update
      const slotResult = await trx.raw(
        `
        SELECT id, capacity, booked_count, status
        FROM delivery_time_slots
        WHERE id = ?
        FOR UPDATE
        `,
        [slotId]
      )
      const slot = slotResult.rows[0]

      if (!slot) {
        return { success: false, error: "slot_not_found" } as const
      }
      if (slot.status === "blocked" || slot.status === "closed") {
        return { success: false, error: "slot_blocked" } as const
      }
      if (slot.booked_count >= slot.capacity) {
        // Mark as full (defensive)
        await trx.raw(
          `UPDATE delivery_time_slots SET status = 'full' WHERE id = ?`,
          [slotId]
        )
        return { success: false, error: "slot_full" } as const
      }

      // 2. Increment booked_count
      const newCount = slot.booked_count + 1
      const newStatus = newCount >= slot.capacity ? "full" : "open"
      await trx.raw(
        `UPDATE delivery_time_slots
         SET booked_count = ?, status = ?, updated_at = now()
         WHERE id = ?`,
        [newCount, newStatus, slotId]
      )

      // 3. Insert reservation
      const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000)
      const reservationId = `rs_${crypto.randomUUID()}`

      // Upsert in case cart already has reservation for this slot
      await trx.raw(
        `
        INSERT INTO slot_reservations
          (id, time_slot_id, cart_id, status, expires_at)
        VALUES (?, ?, ?, 'pending', ?)
        ON CONFLICT (cart_id, time_slot_id) DO UPDATE
          SET expires_at = EXCLUDED.expires_at,
              status = 'pending',
              reserved_at = now()
        `,
        [reservationId, slotId, cartId, expiresAt.toISOString()]
      )

      // 4. Fetch updated slot
      const updated = await trx.raw(
        `SELECT id, slot_date::text AS slot_date, time_from::text AS time_from,
                time_to::text AS time_to, capacity, booked_count, status,
                (capacity - booked_count) AS available
         FROM delivery_time_slots WHERE id = ?`,
        [slotId]
      )

      return {
        success: true,
        reservation_id: reservationId,
        expires_at: expiresAt,
        slot: updated.rows[0],
      } as const
    })
  }

  /**
   * Confirm reservation after order placed.
   */
  async confirmReservation(cartId: string, orderId: string): Promise<void> {
    const knex = this.getKnex_()
    await knex.raw(
      `UPDATE slot_reservations
       SET status = 'confirmed', order_id = ?, confirmed_at = now()
       WHERE cart_id = ? AND status = 'pending'`,
      [orderId, cartId]
    )
  }

  /**
   * Release expired pending reservations. Returns count released.
   * Should run as cron every minute.
   */
  async releaseExpiredReservations(): Promise<number> {
    const knex = this.getKnex_()
    return await knex.transaction(async (trx: any) => {
      const expired = await trx.raw(
        `
        UPDATE slot_reservations
        SET status = 'expired', released_at = now()
        WHERE status = 'pending' AND expires_at < now()
        RETURNING time_slot_id
        `
      )

      const slotIds: string[] = expired.rows.map((r: any) => r.time_slot_id)
      if (slotIds.length === 0) return 0

      // Decrement booked_count for each affected slot
      // GROUP BY in case multiple reservations expired for same slot
      const counts: Record<string, number> = {}
      slotIds.forEach((id) => (counts[id] = (counts[id] || 0) + 1))

      for (const [slotId, count] of Object.entries(counts)) {
        await trx.raw(
          `UPDATE delivery_time_slots
           SET booked_count = GREATEST(0, booked_count - ?),
               status = CASE WHEN booked_count - ? < capacity THEN 'open' ELSE status END,
               updated_at = now()
           WHERE id = ?`,
          [count, count, slotId]
        )
      }

      return slotIds.length
    })
  }

  /**
   * Manually cancel reservation (e.g., customer abandoned cart).
   */
  async releaseReservation(cartId: string): Promise<void> {
    const knex = this.getKnex_()
    await knex.transaction(async (trx: any) => {
      const released = await trx.raw(
        `
        UPDATE slot_reservations
        SET status = 'released', released_at = now()
        WHERE cart_id = ? AND status = 'pending'
        RETURNING time_slot_id
        `,
        [cartId]
      )
      for (const row of released.rows) {
        await trx.raw(
          `UPDATE delivery_time_slots
           SET booked_count = GREATEST(0, booked_count - 1),
               status = CASE WHEN booked_count - 1 < capacity THEN 'open' ELSE status END
           WHERE id = ?`,
          [row.time_slot_id]
        )
      }
    })
  }

  private getKnex_(): any {
    const manager = (this as any).baseRepository_?.activeManager_ ||
                    (this as any).manager_
    return manager.getConnection().getKnex()
  }
}
