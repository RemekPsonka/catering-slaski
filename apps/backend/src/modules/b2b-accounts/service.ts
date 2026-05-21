import { MedusaService } from "@medusajs/framework/utils"
import { B2BAccount, B2BMember, B2BInvoiceCycle } from "./models/b2b"

class B2BAccountsModuleService extends MedusaService({
  B2BAccount,
  B2BMember,
  B2BInvoiceCycle,
}) {}
export default B2BAccountsModuleService
