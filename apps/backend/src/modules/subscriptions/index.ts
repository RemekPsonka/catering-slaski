// @ts-nocheck
import { Module } from "@medusajs/framework/utils"
import SubscriptionsService from "./service"

export const SUBSCRIPTIONS_MODULE = "subscriptionsService"

export default Module(SUBSCRIPTIONS_MODULE, {
  service: SubscriptionsService,
})
