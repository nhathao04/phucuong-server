import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

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

// ── Brand tokens (matching Phucuong Export logo) ─────────────────────────────
export const BRAND = {
  green: "#3E8E3E", // primary green from logo circle
  greenDark: "#2E6B2E", // darker green for footer/borders
  greenSoft: "#E8F5E8", // card background
  greenBorder: "#C5E0C5", // soft border
  yellow: "#F5C518", // accent yellow from logo
  yellowDark: "#D9A913",
  text: "#1A1A2E",
  textMuted: "#666666",
  textLight: "#888888",
  bg: "#F4F6F8",
  cardBg: "#FFFFFF",
  footerBg: "#FAFAFA",
  divider: "#E8EDF2",
  white: "#FFFFFF",
  shadow: "rgba(46, 107, 46, 0.08)",
  logoUrl:
    (process.env.PUBLIC_BASE_URL ?? "http://localhost:3000") +
    "/mail/logo.png",
};

// ─────────────────────────────────────────────────────────────────────────────
// Logo embedding — preferred method is base64 (always loads inside email
// clients, no remote blocking). Falls back to remote URL if env not provided.
// ─────────────────────────────────────────────────────────────────────────────

let cachedLogoDataUri: string | null = null;

function loadLogoDataUri(): string | null {
  if (cachedLogoDataUri !== null) return cachedLogoDataUri;

  // 1. Allow override via env (full data URI including the data:image/png;base64, prefix).
  const envLogo = process.env.MAIL_LOGO_BASE64;
  if (envLogo && envLogo.trim().length > 0) {
    cachedLogoDataUri = envLogo.startsWith("data:")
      ? envLogo
      : `data:image/png;base64,${envLogo}`;
    return cachedLogoDataUri;
  }

  // 2. Otherwise read logo.png from disk. Try several locations so we work
  //    both in dev (cwd=project root), in production (cwd=dist/src), and
  //    when running under PM2/systemd where cwd can be anything.
  //    __dirname-based candidates are the most reliable because they anchor
  //    to the compiled module's location rather than the process cwd.
  const candidates = [
    join(process.cwd(), "public", "mail", "logo.png"),
    join(process.cwd(), "..", "public", "mail", "logo.png"),
    join(process.cwd(), "..", "..", "public", "mail", "logo.png"),
    // Anchored to this module's compiled location (dist/src/modules/mail)
    // → dist/src/modules/mail/../../../../public/mail/logo.png = public/mail/logo.png
    join(__dirname, "..", "..", "..", "..", "public", "mail", "logo.png"),
    join(__dirname, "..", "..", "..", "public", "mail", "logo.png"),
    join(__dirname, "..", "..", "public", "mail", "logo.png"),
    // Source-tree fallback (when running via ts-node from src/)
    join(__dirname, "..", "..", "..", "..", "public", "mail", "logo.png"),
  ];
  for (const logoPath of candidates) {
    try {
      if (!existsSync(logoPath)) continue;
      const buf = readFileSync(logoPath);
      cachedLogoDataUri = `data:image/png;base64,${buf.toString("base64")}`;
      return cachedLogoDataUri;
    } catch {
      // try next
    }
  }

  console.warn(
    "[mail.templates] Could not embed logo.png as data URI from any known path.",
  );
  cachedLogoDataUri = "";
  return null;
}

// Returns a `<img>` tag for the logo. Width: 72px header / 40px footer.
// If embedding fails completely we fall back to a styled text wordmark so
// the brand is still recognizable even without an image.
function brandLogo(size: 72 | 64 | 40 | 32 = 64): string {
  const logoSrc = loadLogoDataUri();
  if (logoSrc) {
    return `<img src="${logoSrc}" alt="Phucuong Export" width="${size}" height="${size}"
                style="display:block;border:0;outline:none;text-decoration:none;
                       border-radius:${size >= 48 ? "50%" : "6px"};
                       ${size >= 48 ? "background-color:#ffffff;padding:4px;" : ""}" />`;
  }
  // Text-only fallback
  return `<span style="display:inline-block;width:${size}px;height:${size}px;
                         line-height:${size}px;text-align:center;
                         background-color:${BRAND.green};color:${BRAND.white};
                         border-radius:50%;font-size:${Math.round(size / 2.4)}px;
                         font-weight:800;font-family:Arial,sans-serif;">PC</span>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Base layout
// ─────────────────────────────────────────────────────────────────────────────

function baseLayout(content: string, _accentColor = BRAND.green): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Phucuong Export</title>
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
          Phucuong Export — Premium Vietnamese agricultural products for the global market.
        </div>

        <!-- Outer card -->
        <table role="presentation" class="pc-container" width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;width:100%;background-color:${BRAND.cardBg};border-radius:14px;
                      box-shadow:0 6px 24px ${BRAND.shadow};overflow:hidden;border:1px solid ${BRAND.divider};">

          <!-- Header banner: gradient green + logo -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.green} 0%,${BRAND.greenDark} 100%);
                       background-color:${BRAND.green};padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="pc-pad" style="padding:28px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="width:72px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                                 style="background-color:#ffffff;border-radius:50%;
                                        box-shadow:0 4px 14px rgba(0,0,0,0.22);">
                            <tr><td style="padding:6px;">
                              ${brandLogo(72)}
                            </td></tr>
                          </table>
                        </td>
                        <td valign="middle" style="padding-left:16px;">
                          <p style="margin:0;font-size:21px;font-weight:800;color:#ffffff;
                                     letter-spacing:0.6px;line-height:1.1;">
                            PHUCUONG EXPORT
                          </p>
                          <p style="margin:5px 0 0 0;font-size:11px;color:rgba(255,255,255,0.9);
                                    letter-spacing:0.8px;text-transform:uppercase;font-weight:500;">
                            Premium Vietnamese Agricultural Products
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Yellow accent strip -->
          <tr>
            <td style="background-color:${BRAND.yellow};height:4px;font-size:0;line-height:0;">&nbsp;</td>
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
            <td style="padding:20px 40px 28px 40px;background-color:${BRAND.footerBg};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="width:40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
                           style="background-color:${BRAND.white};border-radius:50%;
                                  box-shadow:0 1px 3px rgba(0,0,0,0.12);">
                      <tr><td style="padding:4px;">
                        ${brandLogo(40)}
                      </td></tr>
                    </table>
                  </td>
                  <td valign="middle" style="padding-left:12px;">
                    <p style="margin:0 0 3px 0;font-size:13px;font-weight:700;color:${BRAND.greenDark};
                              letter-spacing:0.3px;">
                      Phucuong Export Co., Ltd.
                    </p>
                    <p style="margin:0;font-size:11px;color:${BRAND.textLight};line-height:1.6;">
                      <a href="mailto:contact@phucuong.com"
                         style="color:${BRAND.textLight};text-decoration:none;">contact@phucuong.com</a>
                      &nbsp;·&nbsp;
                      <a href="tel:+842812345678"
                         style="color:${BRAND.textLight};text-decoration:none;">+84 28 1234 5678</a>
                      &nbsp;·&nbsp;
                      <a href="https://www.phucuong.com"
                         style="color:${BRAND.green};font-weight:600;text-decoration:none;">www.phucuong.com</a>
                    </p>
                  </td>
                </tr>
              </table>
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
    Dear <strong style="color:${BRAND.green};">${escapeHtml(name)}</strong>,
  </p>`;
}

function sectionHeading(text: string, color = BRAND.greenDark): string {
  return `<p style="margin:0 0 12px 0;font-size:12px;font-weight:700;color:${color};
                  text-transform:uppercase;letter-spacing:1.2px;
                  border-left:3px solid ${BRAND.yellow};padding-left:10px;">
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
                         background-color:${BRAND.green};border-radius:50%;"></span>
          </td>
          <td valign="top" style="padding-left:10px;">
            <span style="font-size:13px;color:#333333;line-height:1.7;">${text}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function ctaButton(text: string, href: string, bgColor = BRAND.green): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"
         style="margin:24px 0 0 0;">
    <tr>
      <td style="border-radius:8px;background-color:${bgColor};
                 background:linear-gradient(135deg,${bgColor} 0%,${BRAND.greenDark} 100%);
                 box-shadow:0 4px 12px rgba(62,142,62,0.25);
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
         style="background-color:${BRAND.greenSoft};border:1px solid ${BRAND.greenBorder};
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

    <p style="margin:0 0 24px 0;font-size:15px;color:#444444;line-height:1.7;">
      Thank you for reaching out to us! We have successfully received your inquiry
      and our team is already reviewing the details.
    </p>

    <!-- Success badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:24px;">
      <tr>
        <td style="border-radius:24px;background-color:${BRAND.greenSoft};
                    border:1px solid ${BRAND.greenBorder};
                    padding:8px 18px;">
          <span style="font-size:12px;font-weight:700;color:${BRAND.greenDark};
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
      <a href="https://www.phucuong.com/products"
         style="color:${BRAND.green};font-weight:600;text-decoration:none;">product catalog</a>
      or learn more about our
      <a href="https://www.phucuong.com"
         style="color:${BRAND.green};font-weight:600;text-decoration:none;">export capabilities</a>.
    </p>

    <p style="margin:0;font-size:13px;color:#555555;line-height:1.7;">
      We look forward to serving you.
    </p>
  `;

  return {
    subject: `We've received your inquiry — Phucuong Export`,
    html: baseLayout(content),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Template 2 — Customer final confirmation (Step 4 submit complete)
// ─────────────────────────────────────────────────────────────────────────────

export function customerConfirmTemplate(data: EmailTemplateData): { subject: string; html: string } {
  const { customerName, productName, tradeTerm, quantity } = data;

  const summaryBody = `
    <p style="margin:0 0 14px 0;font-size:12px;font-weight:700;color:${BRAND.greenDark};
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

    <p style="margin:0 0 24px 0;font-size:15px;color:#444444;line-height:1.7;">
      Your inquiry has been <strong style="color:${BRAND.green};">submitted successfully</strong>.
      Here is a summary of what we received:
    </p>

    <!-- Hero success badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:24px;">
      <tr>
        <td style="border-radius:24px;background-color:${BRAND.greenSoft};
                    border:1px solid ${BRAND.greenBorder};
                    padding:8px 18px;">
          <span style="font-size:12px;font-weight:700;color:${BRAND.greenDark};
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
      Thank you for your interest in Phucuong Export. We are committed to providing
      you with the highest quality Vietnamese agricultural products and exceptional service.
    </p>
  `;

  return {
    subject: `Your inquiry has been submitted — Phucuong Export`,
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
      ? BRAND.green
      : calc.moqStatus === "below_moq"
        ? "#D32F2F"
        : "#FF8F00";
  const statusText =
    calc.moqStatus === "ok"
      ? "✓ Meets MOQ"
      : calc.moqStatus === "below_moq"
        ? "⚠ Below MOQ"
        : "— No MOQ Config";
  const statusBg =
    calc.moqStatus === "ok"
      ? BRAND.greenSoft
      : calc.moqStatus === "below_moq"
        ? "#FFEBEE"
        : "#FFF8E1";

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
    ? `<tr><td style="padding:6px 0;font-size:13px;"><strong style="color:${BRAND.greenDark};">Certificates:</strong> ${escapeHtml(certificates.join(", "))}</td></tr>`
    : "";
  const otherDocSection = otherDocuments?.length
    ? `<tr><td style="padding:6px 0;font-size:13px;"><strong style="color:${BRAND.greenDark};">Other Documents:</strong> ${escapeHtml(otherDocuments.join(", "))}</td></tr>`
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
      A new inquiry has been ${isFinal ? `<strong style="color:${BRAND.green};">submitted</strong>` : "updated"} in the system.
    </p>

    <!-- Status badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"
           style="margin-bottom:24px;">
      <tr>
        <td style="border-radius:24px;background-color:${isFinal ? BRAND.greenSoft : "#FFF8E1"};
                    border:1px solid ${isFinal ? BRAND.greenBorder : "#FFE082"};
                    padding:8px 18px;">
          <span style="font-size:12px;font-weight:700;color:${isFinal ? BRAND.greenDark : "#F57F17"};
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
