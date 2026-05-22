// @ts-nocheck
import { MedusaService } from "@medusajs/framework/utils"
import {
  ProductionRun,
  DeliveryRoute,
  KitchenLabel,
  QualityCheck,
} from "./models/production"

class ProductionModuleService extends MedusaService({
  ProductionRun,
  DeliveryRoute,
  KitchenLabel,
  QualityCheck,
}) {}
export default ProductionModuleService
