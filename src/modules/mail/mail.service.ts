import { Injectable } from "@nestjs/common";
import { MailService as SendGridMailService } from "@sendgrid/mail";
import {
  customerAckTemplate,
  customerConfirmTemplate,
  internalNotificationTemplate,
  EmailTemplateData,
} from "./mail.templates";

export enum EmailType {
  CUSTOMER_ACK = "customer_ack",
  CUSTOMER_CONFIRM = "customer_confirm",
  INTERNAL_NOTIFY = "internal_notify",
}

@Injectable()
export class MailService {
  private readonly client: SendGridMailService;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly internalEmail: string;
  private readonly isEnabled: boolean;

  constructor() {
    this.client = new SendGridMailService();
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL ?? "noreply@phucuong.com";
    this.fromName = process.env.SENDGRID_FROM_NAME ?? "Phucuong Export";
    this.internalEmail = process.env.INTERNAL_EMAIL_TO ?? "sales@phucuong.com";
    const apiKey = process.env.SENDGRID_API_KEY;
    this.isEnabled = !!apiKey;

    if (this.isEnabled) {
      this.client.setApiKey(apiKey!);
    }
  }

  async send(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
  }): Promise<boolean> {
    if (!this.isEnabled) {
      console.log(`[MailService] DISABLED — would send to ${options.to}: ${options.subject}`);
      return false;
    }

    try {
      await this.client.send({
        to: options.to,
        from: { email: this.fromEmail, name: this.fromName },
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      return true;
    } catch (err: any) {
      console.error("[MailService] SendGrid error:", err?.response?.body ?? err?.message ?? err);
      return false;
    }
  }

  async sendFromTemplate(
    type: EmailType,
    data: EmailTemplateData,
    overrideTo?: string,
  ): Promise<boolean> {
    let subject: string;
    let html: string;
    let text: string;

    switch (type) {
      case EmailType.CUSTOMER_ACK: {
        const tpl = customerAckTemplate(data);
        subject = tpl.subject;
        html = tpl.html;
        text = this.htmlToText(html);
        break;
      }
      case EmailType.CUSTOMER_CONFIRM: {
        const tpl = customerConfirmTemplate(data);
        subject = tpl.subject;
        html = tpl.html;
        text = this.htmlToText(html);
        break;
      }
      case EmailType.INTERNAL_NOTIFY: {
        const tpl = internalNotificationTemplate(data);
        subject = tpl.subject;
        html = tpl.html;
        text = this.htmlToText(html);
        break;
      }
    }

    const to = overrideTo ?? (
      type === EmailType.INTERNAL_NOTIFY
        ? this.internalEmail
        : (data["email"] as string) ?? ""
    );

    return this.send({ to, subject, text, html });
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  }
}
