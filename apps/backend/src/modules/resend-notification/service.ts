/**
 * Resend notification provider for Medusa 2.9.
 *
 * Wires the Resend API into Medusa's Notification module so subscribers
 * can call `notificationService.createNotifications({ to, channel: "email",
 * template, data: { subject, html } })` and it goes out via Resend.
 *
 * Templates: this provider expects subscriber to pre-render HTML and pass
 * { subject, html } in `data`. Keeps templates in /src/emails/* under our
 * control (versioned with the code) instead of locking them into Resend's
 * dashboard. If you want template IDs from Resend dashboard, set
 * `data.template_id` and `data.template_data` and we'll route via Resend's
 * react-email + audiences API (not implemented here yet — KISS).
 */
import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import { Resend } from "resend"

type InjectedDependencies = {
  logger: Logger
}

type Options = {
  api_key?: string
  from: string
  reply_to?: string
  channels?: string[]
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected logger_: Logger
  protected options_: Options
  protected client_: Resend | null

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options
    this.client_ = options.api_key ? new Resend(options.api_key) : null
    if (!this.client_) {
      logger.warn(
        "[resend] RESEND_API_KEY missing — emails will be logged, not sent.",
      )
    }
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend provider requires `from` option (sender email).",
      )
    }
  }

  async send(
    notification: ProviderSendNotificationDTO,
  ): Promise<ProviderSendNotificationResultsDTO> {
    const to = notification.to
    const data = (notification.data ?? {}) as Record<string, unknown>
    const subject = (data.subject as string) ?? "Catering Śląski"
    const html = (data.html as string) ?? ""
    const text = (data.text as string) ?? stripHtml(html)
    const replyTo = (data.reply_to as string) ?? this.options_.reply_to

    if (!to) {
      this.logger_.warn("[resend] notification has no recipient — skipping")
      return {}
    }
    if (!html && !text) {
      this.logger_.warn(`[resend] notification ${notification.template} has no body — skipping`)
      return {}
    }

    if (!this.client_) {
      this.logger_.info(
        `[resend][noop] would send "${subject}" to ${to} (RESEND_API_KEY unset)`,
      )
      return { id: "noop-" + Date.now() }
    }

    try {
      const result = await this.client_.emails.send({
        from: this.options_.from,
        to,
        subject,
        html,
        text,
        ...(replyTo ? { replyTo } : {}),
        ...(notification.template ? { tags: [{ name: "template", value: notification.template }] } : {}),
      })
      if (result.error) {
        throw new Error(result.error.message ?? "resend send error")
      }
      this.logger_.info(`[resend] sent "${subject}" → ${to} id=${result.data?.id}`)
      return { id: result.data?.id ?? "" }
    } catch (err: any) {
      this.logger_.error(`[resend] send failed: ${err.message}`)
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Resend delivery failed: ${err.message}`,
      )
    }
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export default ResendNotificationProviderService
