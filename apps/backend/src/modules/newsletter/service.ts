import { MedusaService } from "@medusajs/framework/utils"
import { NewsletterSubscriber } from "./models/subscriber"
import crypto from "crypto"

class NewsletterModuleService extends MedusaService({ NewsletterSubscriber }) {
  generateToken(): string {
    return crypto.randomBytes(24).toString("hex")
  }
  hashConsent(text: string): string {
    return crypto.createHash("sha256").update(text).digest("hex")
  }
}
export default NewsletterModuleService
