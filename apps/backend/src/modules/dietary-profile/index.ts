import { Module } from "@medusajs/framework/utils"
import DietaryProfileModuleService from "./service"
export const DIETARY_PROFILE_MODULE = "dietary_profile"
export default Module(DIETARY_PROFILE_MODULE, { service: DietaryProfileModuleService })
