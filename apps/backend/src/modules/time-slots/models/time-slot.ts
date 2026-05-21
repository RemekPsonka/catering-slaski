import { model } from "@medusajs/framework/utils"

export const TimeSlot = model.define("DeliveryTimeSlot", {
  id: model.id().primaryKey(),
  delivery_zone_id: model.text(),
  slot_date: model.dateTime(),
  time_from: model.text(),  // "HH:MM"
  time_to: model.text(),
  capacity: model.number(),
  booked_count: model.number().default(0),
  status: model.enum(["open", "full", "blocked", "closed"]).default("open"),
  admin_note: model.text().nullable(),
})

export const SlotReservation = model.define("SlotReservation", {
  id: model.id().primaryKey(),
  time_slot_id: model.text(),
  cart_id: model.text(),
  order_id: model.text().nullable(),
  status: model
    .enum(["pending", "confirmed", "expired", "released"])
    .default("pending"),
  reserved_at: model.dateTime(),
  expires_at: model.dateTime(),
  confirmed_at: model.dateTime().nullable(),
  released_at: model.dateTime().nullable(),
})

export type TimeSlotWithAvailability = {
  id: string
  slot_date: string
  time_from: string
  time_to: string
  capacity: number
  booked_count: number
  available: number
  status: "open" | "full" | "blocked" | "closed"
}
