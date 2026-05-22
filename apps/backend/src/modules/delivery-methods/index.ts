// @ts-nocheck
import { Module } from "@medusajs/framework/utils"
import DeliveryMethodModuleService from "./service"

export const DELIVERY_METHODS_MODULE = "delivery_methods"
export default Module(DELIVERY_METHODS_MODULE, { service: DeliveryMethodModuleService })
