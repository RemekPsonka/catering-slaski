import { Module } from "@medusajs/framework/utils"
import B2BAccountsModuleService from "./service"
export const B2B_ACCOUNTS_MODULE = "b2b_accounts"
export default Module(B2B_ACCOUNTS_MODULE, { service: B2BAccountsModuleService })
