export interface EmailTemplateData {
  customerName: string;
  inquiryCode: string | null;
  inquiryId: string;
  step?: number;
  productName?: string;
  tradeTerm?: string;
  quantity?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  companyName?: string;
  [key: string]: unknown;
}

// ── Brand tokens (matching Phucuong Export logo) ─────────────────────────────
export const BRAND = {
  green: "#3E8E3E",       // primary green from logo circle
  greenDark: "#2E6B2E",   // darker green for footer/borders
  greenSoft: "#E8F5E8",   // card background
  greenBorder: "#C5E0C5", // soft border
  yellow: "#F5C518",      // accent yellow from logo
  yellowDark: "#D9A913",
  text: "#1A1A2E",
  textMuted: "#666666",
  textLight: "#888888",
  bg: "#F4F6F8",
  cardBg: "#FFFFFF",
  footerBg: "#FAFAFA",
  divider: "#E8EDF2",
  logoUrl:
    (process.env.PUBLIC_BASE_URL ?? "http://localhost:3000") +
    "/mail/logo.png",
};

// ─────────────────────────────────────────────────────────────────────────────
// Base layout
// ─────────────────────────────────────────────────────────────────────────────

function baseLayout(content: string, _accentColor = BRAND.green): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Phucuong Export</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};
             font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:40px 16px 40px 16px;">

        <!-- Outer card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:600px;background-color:${BRAND.cardBg};border-radius:12px;
                      box-shadow:0 2px 8px rgba(0,0,0,0.08);overflow:hidden;">

          <!-- Header banner (white background, logo + brand text) -->
          <tr>
            <td style="background-color:#ffffff;padding:28px 40px 24px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle" style="width:72px;">
                    <img src="${BRAND.logoUrl}"
                         alt="Phucuong Export"
                         width="64" height="64"
                         style="display:block;border:0;" />
                  </td>
                  <td valign="middle" style="padding-left:16px;">
                    <p style="margin:0;font-size:22px;font-weight:700;color:${BRAND.green};
                               letter-spacing:0.3px;line-height:1.1;">
                      PHUCUONG EXPORT
                    </p>
                    <p style="margin:4px 0 0 0;font-size:12px;color:${BRAND.textMuted};
                              letter-spacing:0.2px;">
                      Premium Vietnamese Agricultural Products
                    </p>
                  </td>
                  <td align="right" valign="middle" style="padding-left:12px;">
                    <div style="display:inline-block;background-color:${BRAND.greenSoft};
                                border:1px solid ${BRAND.greenBorder};border-radius:6px;
                                padding:6px 12px;">
                      <p style="margin:0;font-size:10px;font-weight:700;color:${BRAND.greenDark};
                                 letter-spacing:1px;">REF</p>
                      <p style="margin:2px 0 0 0;font-size:13px;font-weight:700;
                                 color:${BRAND.green};">${`{{ inquiryCode }}`}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thin yellow accent strip -->
          <tr>
            <td style="background-color:${BRAND.yellow};height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:36px 40px 32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid ${BRAND.divider};margin:0;" />
            </td>
          </tr>

          <!-- Footer with mini logo -->
          <tr>
            <td style="padding:24px 40px 32px 40px;background-color:${BRAND.footerBg};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="middle" style="width:36px;">
                    <img src="${BRAND.logoUrl}"
                         alt="Phucuong Export"
                         width="32" height="32"
                         style="display:block;border:0;border-radius:50%;
                                background-color:#ffffff;padding:2px;" />
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <p style="margin:0 0 2px 0;font-size:13px;font-weight:700;color:${BRAND.greenDark};">
                      Phucuong Export Co., Ltd.
                    </p>
                    <p style="margin:0;font-size:11px;color:${BRAND.textLight};line-height:1.6;">
                      contact@phucuong.com &nbsp;|&nbsp; +84 28 1234 5678 &nbsp;|&nbsp; www.phucuong.com
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0 0;font-size:10px;color:#BBBBBB;line-height:1.5;">
                This email was sent automatically from our inquiry system.
                Please do not reply directly to this message.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Outer card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper blocks
// ─────────────────────────────────────────────────────────────────────────────

function greetingBlock(name: string): string {
  return `<p style="margin:0 0 20px 0;font-size:15px;color:${BRAND.text};line-height:1.7;">
    Dear <strong style="color:${BRAND.green};">${escapeHtml(name)}</strong>,
  </p>`;
}

function sectionHeading(text: string, color = BRAND.greenDark): string {
  return `<p style="margin:0 0 12px 0;font-size:13px;font-weight:700;color:${color};
                  text-transform:uppercase;letter-spacing:0.8px;
                  border-left:3px solid ${BRAND.yellow};padding-left:10px;">
    ${text}
  </p>`;
}

function infoRow(label: string, value: string | null | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  return `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #F0F3F7;width:40%;">
      <span style="font-size:13px;color:${BRAND.textLight};">${escapeHtml(label)}</span>
    </td>
    <td style="padding:8px 0 8px 16px;border-bottom:1px solid #F0F3F7;">
      <span style="font-size:13px;color:${BRAND.text};font-weight:500;">${escapeHtml(value)}</span>
    </td>
  </tr>`;
}

function bulletItem(text: string): string {
  return `<tr>
    <td style="padding:5px 0 5px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td valign="top" style="padding-top:7px;width:14px;">
            <span style="display:inline-block;width:6px;height:6px;
                         background-color:${BRAND.yellow};border-radius:50%;"></span>
          </td>
          <td valign="top" style="padding-left:8px;">
            <span style="font-size:13px;color:#333333;line-height:1.6;">${text}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function ctaButton(text: string, href: string, bgColor = BRAND.green): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;">
    <tr>
      <td style="border-radius:8px;background-color:${bgColor};padding:14px 32px;" align="center">
        <a href="${escapeHtml(href)}" target="_blank"
           style="font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;
                  display:block;">
          ${escapeHtml(text)}
        </a>
      </td>
    </tr>
  </table>`;
}

function escapeHtml(value: string | undefined | null): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 1 — Customer acknowledgement (Step 1 complete)
// ─────────────────────────────────────────────────────────────────────────────

export function customerAckTemplate(data: EmailTemplateData): { subject: string; html: string } {
  const { customerName, inquiryCode, inquiryId } = data;
  const ref = escapeHtml(inquiryCode ?? inquiryId);

  const content = `
    ${greetingBlock(customerName)}

    <p style="margin:0 0 20px 0;font-size:14px;color:#444444;line-height:1.7;">
      Thank you for reaching out to us! We have successfully received your inquiry
      and our team is already reviewing the details.
    </p>

    ${sectionHeading("What happens next?")}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      ${bulletItem("Our sales team will review your requirements within <strong>24 hours</strong>.")}
      ${bulletItem("You will receive a <strong>formal quotation</strong> tailored to your needs.")}
      ${bulletItem("We may contact you via email or WhatsApp for any clarifications.")}
      ${bulletItem(`Your inquiry reference: <strong style="color:${BRAND.green};">${ref}</strong>`)}
    </table>

    <p style="margin:0 0 24px 0;font-size:13px;color:${BRAND.textMuted};line-height:1.7;">
      In the meantime, feel free to browse our
      <a href="https://www.phucuong.com/products" style="color:${BRAND.green};font-weight:600;text-decoration:none;">product catalog</a>
      or learn more about our
      <a href="https://www.phucuong.com" style="color:${BRAND.green};font-weight:600;text-decoration:none;">export capabilities</a>.
    </p>

    <p style="margin:0;font-size:13px;color:#555555;line-height:1.7;">
      We look forward to serving you.
    </p>
  `;

  return {
    subject: `We've received your inquiry — ${ref}`,
    html: baseLayout(content),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 2 — Customer final confirmation (Step 4 submit complete)
// ─────────────────────────────────────────────────────────────────────────────

export function customerConfirmTemplate(data: EmailTemplateData): { subject: string; html: string } {
  const { customerName, inquiryCode, inquiryId, productName, tradeTerm, quantity } = data;

  const content = `
    ${greetingBlock(customerName)}

    <p style="margin:0 0 20px 0;font-size:14px;color:#444444;line-height:1.7;">
      Your inquiry has been <strong style="color:${BRAND.green};">submitted successfully</strong>.
      Here is a summary of what we received:
    </p>

    <!-- Summary card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:${BRAND.greenSoft};border:1px solid ${BRAND.greenBorder};
                  border-radius:8px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <p style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:${BRAND.greenDark};
                     text-transform:uppercase;letter-spacing:0.6px;">
            Inquiry Summary
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${infoRow("Reference No.", inquiryCode)}
            ${infoRow("Product", productName)}
            ${infoRow("Quantity", quantity)}
            ${infoRow("Trade Term", tradeTerm)}
            ${infoRow("Status", "Submitted — Pending Review")}
          </table>
        </td>
      </tr>
    </table>

    ${sectionHeading("What to expect next")}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      ${bulletItem("Our sales team will review your inquiry and prepare a detailed quotation.")}
      ${bulletItem("Expected response time: <strong>24–48 business hours</strong>.")}
      ${bulletItem("A dedicated sales representative will contact you via email or phone.")}
      ${bulletItem(`All communications will reference your inquiry code: <strong style="color:${BRAND.green};">${escapeHtml(inquiryCode ?? inquiryId)}</strong>`)}
    </table>

    <p style="margin:0 0 24px 0;font-size:13px;color:${BRAND.textMuted};line-height:1.7;">
      Thank you for your interest in Phucuong Export. We are committed to providing
      you with the highest quality Vietnamese agricultural products and exceptional service.
    </p>
  `;

  return {
    subject: `Your inquiry has been submitted — ${escapeHtml(inquiryCode ?? "")}`,
    html: baseLayout(content),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 3 — Internal notification (sales/admin)
// ─────────────────────────────────────────────────────────────────────────────

export function internalNotificationTemplate(
  data: EmailTemplateData,
): { subject: string; html: string } {
  const {
    customerName, inquiryCode, inquiryId, step,
    productName, tradeTerm, quantity,
    email, phone, whatsapp, companyName,
  } = data;

  const stepLabel =
    ["", "Customer Info", "Product Selection", "Commercial Terms", "Final Submit"][Number(step)] ?? "Unknown";
  const isFinal = Number(step) === 4;
  const ref = escapeHtml(inquiryCode ?? inquiryId);
  const submittedAt = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const content = `
    <p style="margin:0 0 20px 0;font-size:15px;color:${BRAND.text};line-height:1.7;">
      A new inquiry has been ${isFinal ? `<strong style="color:${BRAND.green};">submitted</strong>` : "updated"} in the system.
    </p>

    <!-- Status badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="border-radius:20px;background-color:${isFinal ? BRAND.greenSoft : "#FFF8E1"};
                    border:1px solid ${isFinal ? BRAND.greenBorder : "#FFE082"};
                    padding:6px 16px;">
          <span style="font-size:12px;font-weight:700;color:${isFinal ? BRAND.greenDark : "#F57F17"};
                       letter-spacing:0.4px;">
            ${isFinal ? "✓ FINAL SUBMISSION" : `STEP ${step} — ${stepLabel.toUpperCase()}`}
          </span>
        </td>
      </tr>
    </table>

    ${sectionHeading("Inquiry Details")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:${BRAND.greenSoft};border:1px solid ${BRAND.greenBorder};
                  border-radius:8px;margin-bottom:20px;">
      <tr><td style="padding:20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Reference", inquiryCode)}
          ${infoRow("Inquiry ID", inquiryId)}
          ${infoRow("Current Step", `${step} / 4 — ${stepLabel}`)}
          ${infoRow("Submitted At", submittedAt)}
          ${infoRow("Product", productName)}
          ${infoRow("Quantity", quantity)}
          ${infoRow("Trade Term", tradeTerm)}
        </table>
      </td></tr>
    </table>

    ${sectionHeading("Customer Information")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:${BRAND.greenSoft};border:1px solid ${BRAND.greenBorder};
                  border-radius:8px;margin-bottom:20px;">
      <tr><td style="padding:20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Name", customerName)}
          ${infoRow("Company", companyName)}
          ${infoRow("Email", email)}
          ${infoRow("Phone", phone)}
          ${infoRow("WhatsApp", whatsapp)}
        </table>
      </td></tr>
    </table>

    ${ctaButton(
      "View Inquiry in Admin Dashboard",
      `${process.env.ADMIN_APP_URL ?? "https://admin.phucuong.com"}/inquiries/${inquiryId}`,
      BRAND.green,
    )}

    <p style="margin:24px 0 0 0;font-size:12px;color:${BRAND.textLight};line-height:1.6;">
      This is an automated notification. Please follow up with the customer promptly.
    </p>
  `;

  return {
    subject: `[${ref}] Inquiry ${isFinal ? "SUBMITTED" : `— Step ${step} ${stepLabel}`}`,
    html: baseLayout(content, isFinal ? BRAND.greenDark : BRAND.green),
  };
}
