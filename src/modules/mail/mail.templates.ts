export interface InquiryCalculationEmailData {
  estimatedContainers?: number | null;
  containerCode?: string | null;
  containerName?: string | null;
  containerCapacityMt?: number | null;
  moqMt?: number | null;
  moqLabel?: string | null;
  moqStatus?: "ok" | "below_moq" | "no_moq_config";
  isValid?: boolean;
}

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
  productAttributes?: Array<{ label: string; value: string }>;
  calculation?: InquiryCalculationEmailData;
  certificates?: string[];
  otherDocuments?: string[];
  [key: string]: unknown;
}

// ── Brand tokens (mirrored from web CSS variables) ───────────────────────
//
// Tokens mirror the web app's :root CSS variables so customer-facing mail
// and admin UI share the same identity. Derive soft/border/shadow from the
// primary so the palette stays in lockstep if the brand color is tweaked.
//
//   --brand         #d71920   primary actions, header, links
//   --brand-hover   #b9141b   hover, gradient end, pressed state
//   --brand-soft    #fff1f2   info-card / status-badge background
//   --brand-muted   #fff7f7   page / outer-wrapper background
//   --ink           #111827   body text, headings
//   --ink-soft      #374151   muted labels
//   --surface       #f8f9fb   (reserved for subtle panels)
//   --surface-raised #ffffff  card background
//   --line          #e5e7eb   dividers, borders
export const BRAND = {
  brand: "#d71920", // primary — buttons, header gradient, links, accents
  brandDark: "#b9141b", // gradient end / pressed
  brandSoft: "#fff1f2", // info-card bg, status-badge bg
  brandBorder: "#fbd0d3", // soft border derived from brand
  accent: "#d71920", // accent strip & section-rule (was yellow, now brand)
  text: "#111827", // --ink — primary text
  textMuted: "#374151", // --ink-soft — labels
  textLight: "#6b7280", // tertiary (between ink-soft and line) for footer links
  bg: "#fff7f7", // --brand-muted — outer wrapper bg
  surface: "#f8f9fb", // --surface — reserved for subtle panels
  cardBg: "#ffffff", // --surface-raised
  footerBg: "#fff7f7", // footer bg = page bg for cohesion
  divider: "#e5e7eb", // --line
  white: "#ffffff",
  shadow: "rgba(215, 25, 32, 0.10)", // red-tinted shadow to match brand
  // amber + red reserved for status semantics (MOQ), not branding
  statusWarn: "#FF8F00", // no-config / pending
  statusWarnBg: "#FFF8E1",
  statusWarnBorder: "#FFE082",
  statusError: "#D32F2F", // below-MOQ
  statusErrorBg: "#FFEBEE",
};

// ─────────────────────────────────────────────────────────────────────────────
// Base layout
// ─────────────────────────────────────────────────────────────────────────────

// Centralised contact details so brand voice stays consistent and easy to
// update — every footer + every in-body link reads from the same source.
const CONTACT = {
  companyName: "Phucuong Logistic Co., Ltd.",
  wordmark: "PHUCUONG LOGISTIC",
  tagline: "Reliable Logistics & Premium Vietnamese Exports",
  phoneDisplay: "+84 368 250 453",
  phoneHref: "+84368250453", // tel: scheme — digits only with country code
  email: "sales@phucuonglogistic.com",
  website: "https://phucuonglogistic.com/",
  websiteDisplay: "phucuonglogistic.com",
  adminDashboard: "https://phucuonglogistic.com/admin",
};

function baseLayout(content: string, _accentColor = BRAND.brand): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${CONTACT.companyName}</title>
  <!--[if mso]>
  <style type="text/css">
    table,td,div,h1,h2,h3,p,a {font-family: Arial, sans-serif !important;}
    table {border-collapse: collapse;}
  </style>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style type="text/css">
    /* Mobile tweaks — supported by most major clients */
    @media screen and (max-width: 620px) {
      .pc-container { width: 100% !important; }
      .pc-pad       { padding-left: 20px !important; padding-right: 20px !important; }
      .pc-h1        { font-size: 20px !important; }
      .pc-stack     { display: block !important; width: 100% !important; }
      .pc-hide      { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};
             font-family:'Segoe UI',Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 12px;">

        <!-- Preheader (hidden) -->
        <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:${BRAND.bg};line-height:1px;">
          ${CONTACT.tagline}.
        </div>

        <!-- Outer card -->
        <table role="presentation" class="pc-container" width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;background-color:${BRAND.cardBg};border-radius:14px;
                      box-shadow:0 6px 24px ${BRAND.shadow};overflow:hidden;border:1px solid ${BRAND.divider};">

          <!-- Header banner: gradient brand + wordmark -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.brand} 0%,${BRAND.brandDark} 100%);
                       background-color:${BRAND.brand};padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="pc-pad" style="padding:32px 32px;">
                    <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;
                               letter-spacing:0.6px;line-height:1.1;">
                      ${CONTACT.wordmark}
                    </p>
                    <p style="margin:8px 0 0 0;font-size:11px;color:rgba(255,255,255,0.9);
                              letter-spacing:0.8px;text-transform:uppercase;font-weight:500;">
                      ${CONTACT.tagline}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Brand accent strip (echoes the divider rules used on the web app) -->
          <tr>
            <td style="background-color:${BRAND.accent};height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body content -->
          <tr>
            <td class="pc-pad" style="padding:36px 40px 28px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td class="pc-pad" style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid ${BRAND.divider};margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 28px 40px;background-color:${BRAND.footerBg};">
              <p style="margin:0 0 10px 0;font-size:14px;font-weight:700;color:${BRAND.brandDark};
                        letter-spacing:0.3px;">
                ${CONTACT.companyName}
              </p>
              <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.7;">
                <a href="mailto:${CONTACT.email}"
                   style="color:${BRAND.textMuted};text-decoration:none;">${CONTACT.email}</a>
                &nbsp;·&nbsp;
                <a href="tel:${CONTACT.phoneHref}"
                   style="color:${BRAND.textMuted};text-decoration:none;">${CONTACT.phoneDisplay}</a>
                &nbsp;·&nbsp;
                <a href="${CONTACT.website}"
                   style="color:${BRAND.brand};font-weight:600;text-decoration:none;">${CONTACT.websiteDisplay}</a>
              </p>
              <p style="margin:16px 0 0 0;font-size:10px;color:#BBBBBB;line-height:1.5;
                        text-align:center;">
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
  return `<p style="margin:0 0 18px 0;font-size:16px;color:${BRAND.text};line-height:1.6;">
    Dear <strong style="color:${BRAND.brand};">${escapeHtml(name)}</strong>,
  </p>`;
}

function sectionHeading(text: string, color = BRAND.brandDark): string {
  return `<p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:${color};
                  text-transform:uppercase;letter-spacing:1.2px;
                  border-left:3px solid ${BRAND.accent};padding-left:10px;">
    ${text}
  </p>`;
}

function infoRow(label: string, value: string | null | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  return `<tr>
    <td align="left" valign="top" style="padding:9px 0;border-bottom:1px solid ${BRAND.divider};width:38%;">
      <span style="font-size:12px;color:${BRAND.textLight};text-transform:uppercase;letter-spacing:0.4px;">${escapeHtml(label)}</span>
    </td>
    <td align="left" valign="top" style="padding:9px 0 9px 14px;border-bottom:1px solid ${BRAND.divider};">
      <span style="font-size:13px;color:${BRAND.text};font-weight:500;">${escapeHtml(value)}</span>
    </td>
  </tr>`;
}

function bulletItem(text: string): string {
  return `<tr>
    <td style="padding:6px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="top" style="padding-top:8px;width:14px;">
            <span style="display:inline-block;width:6px;height:6px;
                         background-color:${BRAND.brand};border-radius:50%;"></span>
          </td>
          <td valign="top" style="padding-left:10px;">
            <span style="font-size:13px;color:${BRAND.textMuted};line-height:1.7;">${text}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function ctaButton(text: string, href: string, bgColor = BRAND.brand): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"
         style="margin:24px 0 0 0;">
    <tr>
      <td style="border-radius:8px;background-color:${bgColor};
                 background:linear-gradient(135deg,${bgColor} 0%,${BRAND.brandDark} 100%);
                 box-shadow:0 4px 12px ${BRAND.shadow};
                 padding:14px 32px;" align="center">
        <a href="${escapeHtml(href)}" target="_blank"
           style="font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;
                  display:block;letter-spacing:0.4px;">
          ${escapeHtml(text)} &nbsp;→
        </a>
      </td>
    </tr>
  </table>`;
}

function infoCard(content: string, padding = "20px"): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:${BRAND.brandSoft};border:1px solid ${BRAND.brandBorder};
                border-radius:10px;margin-bottom:22px;">
    <tr><td style="padding:${padding};">
      ${content}
    </td></tr>
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
  const { customerName } = data;

  const content = `
    ${greetingBlock(customerName)}

    <p style="margin:0 0 24px 0;font-size:15px;color:${BRAND.textMuted};line-height:1.7;">
      Thank you for reaching out to us! We have successfully received your inquiry
      and our team is already reviewing the details.
    </p>

    <!-- Success badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:24px;">
      <tr>
        <td style="border-radius:24px;background-color:${BRAND.brandSoft};
                    border:1px solid ${BRAND.brandBorder};
                    padding:8px 18px;">
          <span style="font-size:12px;font-weight:700;color:${BRAND.brandDark};
                       letter-spacing:0.6px;">
            ✓ &nbsp;INQUIRY RECEIVED
          </span>
        </td>
      </tr>
    </table>

    ${sectionHeading("What happens next?")}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           width="100%" style="margin-bottom:24px;">
      ${bulletItem("Our sales team will review your requirements within <strong>24 hours</strong>.")}
      ${bulletItem("You will receive a <strong>formal quotation</strong> tailored to your needs.")}
      ${bulletItem("We may contact you via email or WhatsApp for any clarifications.")}
    </table>

    <p style="margin:0 0 24px 0;font-size:13px;color:${BRAND.textMuted};line-height:1.7;">
      In the meantime, feel free to browse our
      <a href="${CONTACT.website}products"
         style="color:${BRAND.brand};font-weight:600;text-decoration:none;">product catalog</a>
      or learn more about our
      <a href="${CONTACT.website}"
         style="color:${BRAND.brand};font-weight:600;text-decoration:none;">export capabilities</a>.
    </p>

    <p style="margin:0;font-size:13px;color:${BRAND.textMuted};line-height:1.7;">
      We look forward to serving you.
    </p>
  `;

  return {
    subject: `We've received your inquiry — ${CONTACT.companyName}`,
    html: baseLayout(content),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 2 — Customer final confirmation (Step 4 submit complete)
// ─────────────────────────────────────────────────────────────────────────────

export function customerConfirmTemplate(data: EmailTemplateData): { subject: string; html: string } {
  const { customerName, productName, tradeTerm, quantity } = data;

  const summaryBody = `
    <p style="margin:0 0 14px 0;font-size:12px;font-weight:700;color:${BRAND.brandDark};
               text-transform:uppercase;letter-spacing:1.2px;">
      Inquiry Summary
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${infoRow("Product", productName)}
      ${infoRow("Quantity", quantity)}
      ${infoRow("Trade Term", tradeTerm)}
      ${infoRow("Status", "Submitted — Pending Review")}
    </table>
  `;

  const content = `
    ${greetingBlock(customerName)}

    <p style="margin:0 0 24px 0;font-size:15px;color:${BRAND.textMuted};line-height:1.7;">
      Your inquiry has been <strong style="color:${BRAND.brand};">submitted successfully</strong>.
      Here is a summary of what we received:
    </p>

    <!-- Hero success badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:24px;">
      <tr>
        <td style="border-radius:24px;background-color:${BRAND.brandSoft};
                    border:1px solid ${BRAND.brandBorder};
                    padding:8px 18px;">
          <span style="font-size:12px;font-weight:700;color:${BRAND.brandDark};
                       letter-spacing:0.6px;">
            ✓ &nbsp;SUBMITTED SUCCESSFULLY
          </span>
        </td>
      </tr>
    </table>

    ${infoCard(summaryBody)}

    ${sectionHeading("What to expect next")}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           width="100%" style="margin-bottom:24px;">
      ${bulletItem("Our sales team will review your inquiry and prepare a detailed quotation.")}
      ${bulletItem("Expected response time: <strong>24–48 business hours</strong>.")}
      ${bulletItem("A dedicated sales representative will contact you via email or phone.")}
    </table>

    <p style="margin:0 0 8px 0;font-size:13px;color:${BRAND.textMuted};line-height:1.7;">
      Thank you for your interest in ${CONTACT.companyName}. We are committed to providing
      you with the highest quality Vietnamese agricultural products and exceptional service.
    </p>
  `;

  return {
    subject: `Your inquiry has been submitted — ${CONTACT.companyName}`,
    html: baseLayout(content),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 3 — Internal notification (sales/admin)
// ─────────────────────────────────────────────────────────────────────────────

function productAttributesSection(
  attrs: Array<{ label: string; value: string }> | undefined,
): string {
  if (!attrs?.length) return "";
  return `
    ${sectionHeading("Product Requirements")}
    ${infoCard(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${attrs.map((a) => infoRow(a.label, a.value)).join("")}
      </table>
    `)}
  `;
}

function calculationSection(calc: InquiryCalculationEmailData | undefined): string {
  if (!calc) return "";

  const statusColor =
    calc.moqStatus === "ok"
      ? BRAND.brand
      : calc.moqStatus === "below_moq"
        ? BRAND.statusError
        : BRAND.statusWarn;
  const statusText =
    calc.moqStatus === "ok"
      ? "✓ Meets MOQ"
      : calc.moqStatus === "below_moq"
        ? "⚠ Below MOQ"
        : "— No MOQ Config";
  const statusBg =
    calc.moqStatus === "ok"
      ? BRAND.brandSoft
      : calc.moqStatus === "below_moq"
        ? BRAND.statusErrorBg
        : BRAND.statusWarnBg;

  return `
    ${sectionHeading("Container & MOQ Calculation")}
    ${infoCard(`
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${infoRow("Container Type", calc.containerName ? `${calc.containerCode} — ${calc.containerName}` : calc.containerCode)}
        ${infoRow("Container Capacity", calc.containerCapacityMt ? `${calc.containerCapacityMt} MT` : null)}
        ${infoRow("Estimated Containers", calc.estimatedContainers ? `~${calc.estimatedContainers} container(s)` : null)}
        ${infoRow("MOQ", calc.moqLabel ?? (calc.moqMt ? `${calc.moqMt} MT` : null))}
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
        <tr>
          <td style="padding:8px 14px;border-radius:6px;background-color:${statusBg};border:1px solid ${statusColor};">
            <span style="font-size:13px;font-weight:600;color:${statusColor};">
              ${statusText}
            </span>
          </td>
        </tr>
      </table>
    `)}
  `;
}

export function internalNotificationTemplate(
  data: EmailTemplateData,
): { subject: string; html: string } {
  const {
    customerName, inquiryCode, inquiryId, step,
    productName, tradeTerm, quantity,
    email, phone, whatsapp, companyName,
    productAttributes, calculation,
    certificates, otherDocuments,
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

  const certSection = certificates?.length
    ? `<tr><td style="padding:6px 0;font-size:13px;"><strong style="color:${BRAND.brandDark};">Certificates:</strong> ${escapeHtml(certificates.join(", "))}</td></tr>`
    : "";
  const otherDocSection = otherDocuments?.length
    ? `<tr><td style="padding:6px 0;font-size:13px;"><strong style="color:${BRAND.brandDark};">Other Documents:</strong> ${escapeHtml(otherDocuments.join(", "))}</td></tr>`
    : "";

  const requirementsSection = certSection || otherDocSection
    ? `
      ${sectionHeading("Requirements")}
      ${infoCard(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${certSection}
          ${otherDocSection}
        </table>
      `)}
    `
    : "";

  const customerInfoBody = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${infoRow("Name", customerName)}
      ${infoRow("Company", companyName)}
      ${infoRow("Email", email)}
      ${infoRow("Phone", phone)}
      ${infoRow("WhatsApp", whatsapp)}
    </table>
  `;

  const inquiryDetailsBody = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${infoRow("Reference", inquiryCode)}
      ${infoRow("Inquiry ID", inquiryId)}
      ${infoRow("Current Step", `${step} / 4 — ${stepLabel}`)}
      ${infoRow("Submitted At", submittedAt)}
      ${infoRow("Product", productName)}
      ${infoRow("Quantity", quantity)}
      ${infoRow("Trade Term", tradeTerm)}
    </table>
  `;

  const content = `
    <p style="margin:0 0 20px 0;font-size:16px;color:${BRAND.text};line-height:1.6;">
      A new inquiry has been ${isFinal ? `<strong style="color:${BRAND.brand};">submitted</strong>` : "updated"} in the system.
    </p>

    <!-- Status badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:24px;">
      <tr>
        <td style="border-radius:24px;background-color:${isFinal ? BRAND.brandSoft : BRAND.statusWarnBg};
                    border:1px solid ${isFinal ? BRAND.brandBorder : BRAND.statusWarnBorder};
                    padding:8px 18px;">
          <span style="font-size:12px;font-weight:700;color:${isFinal ? BRAND.brandDark : "#B45309"};
                       letter-spacing:0.6px;">
            ${isFinal ? "✓ FINAL SUBMISSION" : `STEP ${step} — ${stepLabel.toUpperCase()}`}
          </span>
        </td>
      </tr>
    </table>

    ${sectionHeading("Inquiry Details")}
    ${infoCard(inquiryDetailsBody)}

    ${productAttributesSection(productAttributes)}

    ${calculationSection(calculation)}

    ${requirementsSection}

    ${sectionHeading("Customer Information")}
    ${infoCard(customerInfoBody)}

    ${ctaButton(
      "View Inquiry in Admin Dashboard",
      `${CONTACT.adminDashboard}/inquiries/${inquiryId}`,
      BRAND.brand,
    )}

    <p style="margin:24px 0 0 0;font-size:12px;color:${BRAND.textLight};line-height:1.6;">
      This is an automated notification. Please follow up with the customer promptly.
    </p>
  `;

  return {
    subject: `[${ref}] Inquiry ${isFinal ? "SUBMITTED" : `— Step ${step} ${stepLabel}`}`,
    html: baseLayout(content, isFinal ? BRAND.brandDark : BRAND.brand),
  };
}
