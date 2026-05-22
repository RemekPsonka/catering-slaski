// @ts-nocheck
import { Module } from "@medusajs/framework/utils"
import DeliveryZonesService from "./service"

export const DELIVERY_ZONES_MODULE = "delivery_zones"

export default Module(DELIVERY_ZONES_MODULE, {
  service: DeliveryZonesService,
})

export * from "./service"
export * from "./models/delivery-zone"
