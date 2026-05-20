import { Module } from "@medusajs/framework/utils"
import ExternalWebhooksService from "./service"

export const EXTERNAL_WEBHOOKS_MODULE = "external_webhooks"

export default Module(EXTERNAL_WEBHOOKS_MODULE, {
  service: ExternalWebhooksService,
})

export * from "./service"
