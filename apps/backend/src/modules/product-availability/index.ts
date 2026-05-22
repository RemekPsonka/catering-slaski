// @ts-nocheck
import { Module } from "@medusajs/framework/utils"
import ProductAvailabilityModuleService from "./service"

export const PRODUCT_AVAILABILITY_MODULE = "product_availability"
export default Module(PRODUCT_AVAILABILITY_MODULE, {
  service: ProductAvailabilityModuleService,
})
