import { MedusaService } from "@medusajs/framework/utils"
import { DeliveryMethod } from "./models/delivery-method"

class DeliveryMethodModuleService extends MedusaService({ DeliveryMethod }) {}
export default DeliveryMethodModuleService
