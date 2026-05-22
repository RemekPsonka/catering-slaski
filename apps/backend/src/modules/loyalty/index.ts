import { Module } from "@medusajs/framework/utils"
import LoyaltyService from "./service"

export const LOYALTY_MODULE = "loyaltyService"

export default Module(LOYALTY_MODULE, {
  service: LoyaltyService,
})
