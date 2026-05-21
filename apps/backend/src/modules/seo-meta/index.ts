import { Module } from "@medusajs/framework/utils"
import SeoMetaModuleService from "./service"

export const SEO_META_MODULE = "seo_meta"
export default Module(SEO_META_MODULE, { service: SeoMetaModuleService })
