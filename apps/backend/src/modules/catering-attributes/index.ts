// @ts-nocheck
import { Module } from "@medusajs/framework/utils"
import CateringAttributesService from "./service"

export const CATERING_ATTRIBUTES_MODULE = "cateringAttributesService"

export default Module(CATERING_ATTRIBUTES_MODULE, {
  service: CateringAttributesService,
})
