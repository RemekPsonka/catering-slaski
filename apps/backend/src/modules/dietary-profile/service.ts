import { MedusaService } from "@medusajs/framework/utils"
import { DietaryProfile } from "./models/dietary-profile"

class DietaryProfileModuleService extends MedusaService({ DietaryProfile }) {}
export default DietaryProfileModuleService
