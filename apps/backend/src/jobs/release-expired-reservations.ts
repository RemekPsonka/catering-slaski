import type { MedusaContainer } from "@medusajs/framework/types"

/**
 * Co minutę: zwolnij wygasłe rezerwacje slotów (TTL minął bez confirmReservation).
 *
 * Bez tego cron jobu sloty zaklikane przez porzucone koszyki pozostają zablokowane
 * do czasu wygaśnięcia daty dostawy. Customers widzą "brak miejsc" mimo że są.
 */
export default async function releaseExpiredReservationsJob(container: MedusaContainer) {
  const logger = container.resolve("logger") as any

  // Time-slots service is resolved by module name registered in medusa-config.
  // If not registered, this is a no-op (defensive).
  let timeSlotsService: any
  try {
    timeSlotsService = container.resolve("timeSlotsService")
  } catch {
    return
  }
  if (!timeSlotsService?.releaseExpiredReservations) return

  try {
    const released = await timeSlotsService.releaseExpiredReservations()
    if (released > 0) {
      logger.info(`[cron] Released ${released} expired slot reservations`)
    }
  } catch (err) {
    logger.error(`[cron] release-expired-reservations failed: ${(err as Error).message}`)
  }
}

export const config = {
  name: "release-expired-reservations",
  schedule: "* * * * *", // every minute
}
