import { Module } from "@medusajs/framework/utils"
import TimeSlotsService from "./service"

export const TIME_SLOTS_MODULE = "time_slots"

export default Module(TIME_SLOTS_MODULE, {
  service: TimeSlotsService,
})

export * from "./service"
export * from "./models/time-slot"
