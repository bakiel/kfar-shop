import * as nodemailer from 'nodemailer';
import { query } from '@/lib/db/postgres-client';

// -------------------------------------------------------------------
// Email Service - sends transactional & marketing emails via Postfix
// Falls back to console logging when running outside the VPS
// -------------------------------------------------------------------

// Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject_en: string;
  subject_he: string | null;
  body_en: string;
  body_he: string | null;
  variables: string[];
  category: string;
  is_active: boolean;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// SMTP configuration from env vars (defaults to local Postfix on VPS)
const SMTP_HOST = process.env.SMTP_HOST || 'localhost';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@kfarapp.com';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'KFAR Marketplace';
const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://kfarapp.com').replace(/\/$/, '');
const EMAIL_LOGO_URL = `${SITE_URL}/images/logos/kfar_logo_white_on_green.png`;
const EMAIL_BANNER_URL = `${SITE_URL}/images/email/kfar-transactional-banner.png`;
const DEFAULT_VARIABLES: Record<string, string> = {
  dashboard_url: `${SITE_URL}/vendor/orders`,
  status_message: '',
  status_message_he: '',
  status_he: '',
};

// Detect if we are running on the VPS (Postfix available) or local dev
const isLocalDev = SMTP_HOST === 'localhost' && !process.env.SMTP_HOST;

// Create transporter lazily so the module can be imported without side-effects
let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (_transporter) return _transporter;

  const transportOptions: nodemailer.TransportOptions & Record<string, unknown> = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
  };

  // Add auth only when credentials are provided
  if (SMTP_USER && SMTP_PASS) {
    transportOptions.auth = {
      user: SMTP_USER,
      pass: SMTP_PASS,
    };
  } else {
    // Local Postfix does not require auth
    transportOptions.tls = { rejectUnauthorized: false };
  }

  _transporter = nodemailer.createTransport(transportOptions as any);
  return _transporter;
}

// -------------------------------------------------------------------
// Template rendering
// -------------------------------------------------------------------

/**
 * Replace {{variable}} placeholders in a template body with the
 * corresponding values from the variables map.
 */
export function renderTemplate(
  templateBody: string,
  variables: Record<string, string>
): string {
  let rendered = templateBody;
  const mergedVariables = { ...DEFAULT_VARIABLES, ...variables };
  for (const [key, value] of Object.entries(mergedVariables)) {
    // Replace all occurrences of {{key}} (global, case-sensitive)
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(pattern, value ?? '');
  }
  return rendered.replace(/\{\{[^{}]+\}\}/g, '');
}

// -------------------------------------------------------------------
// Email logging
// -------------------------------------------------------------------

/**
 * Write a row to the email_log table.
 */
export async function logEmail(
  templateName: string,
  recipientEmail: string,
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced',
  variables: Record<string, string> = {},
  extra: {
    templateId?: string;
    recipientName?: string;
    subject?: string;
    errorMessage?: string;
  } = {}
): Promise<void> {
  try {
    await query(
      `INSERT INTO email_log
        (template_id, template_name, recipient_email, recipient_name, subject, status, error_message, variables, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        extra.templateId || null,
        templateName,
        recipientEmail,
        extra.recipientName || null,
        extra.subject || null,
        status,
        extra.errorMessage || null,
        JSON.stringify(variables),
        status === 'sent' ? new Date() : null,
      ]
    );
  } catch (err) {
    // Log failure should never block the caller
    console.error('[email-service] Failed to write email_log:', err);
  }
}

// -------------------------------------------------------------------
// Template fetching
// -------------------------------------------------------------------

async function fetchTemplate(templateName: string): Promise<EmailTemplate | null> {
  try {
    const { rows } = await query<EmailTemplate>(
      'SELECT * FROM email_templates WHERE name = $1 AND is_active = true',
      [templateName]
    );
    return rows[0] || null;
  } catch (err) {
    console.error('[email-service] Failed to fetch template:', templateName, err);
    return null;
  }
}

// -------------------------------------------------------------------
// Core send function (wraps nodemailer)
// -------------------------------------------------------------------

async function send(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const from = `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS}>`;

  // In local dev without SMTP configured, just log and return success
  if (isLocalDev) {
    console.log('[email-service] LOCAL DEV - email NOT sent (no SMTP configured)');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body length: ${html.length} chars`);
    return { success: true, messageId: `dev-${Date.now()}` };
  }

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[email-service] sendMail error:', err);
    return { success: false, error: err.message || 'Unknown send error' };
  }
}

// -------------------------------------------------------------------
// Wrap the HTML body in a branded email layout
// -------------------------------------------------------------------

function shouldShowOrderSequence(templateName?: string): boolean {
  return Boolean(templateName && [
    'order_confirmation',
    'order_status_update',
    'vendor_new_order',
  ].includes(templateName));
}

function renderOrderSequence(language: 'en' | 'he'): string {
  const steps = language === 'he'
    ? ['הזמנה התקבלה', 'החנות מאשרת', 'הסל נארז', 'תשלום במשלוח']
    : ['Order received', 'Store confirms', 'Basket packed', 'COD on delivery'];

  return `
    <div class="sequence" aria-label="${language === 'he' ? 'רצף ניהול הזמנה' : 'Order management sequence'}">
      ${steps.map((step, index) => `
        <div class="sequence-step">
          <span>${index + 1}</span>
          <strong>${step}</strong>
        </div>
      `).join('')}
    </div>
  `;
}

function wrapInLayout(
  bodyHtml: string,
  language: 'en' | 'he' = 'en',
  templateName?: string
): string {
  const dir = language === 'he' ? 'rtl' : 'ltr';
  const fontFamily = language === 'he'
    ? "'Segoe UI', Tahoma, Arial, sans-serif"
    : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  const sequenceHtml = shouldShowOrderSequence(templateName) ? renderOrderSequence(language) : '';

  return `
<!DOCTYPE html>
<html dir="${dir}" lang="${language}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin:0; padding:0; background:#f5f0e8; font-family:${fontFamily}; color:#1a1a1a; }
    .shell { width:100%; padding:24px 12px; box-sizing:border-box; }
    .container { max-width:640px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; border:1px solid #e5dccd; }
    .header { background:#2D5A27; color:#ffffff; text-align:center; }
    .brand-banner { padding:0 0 22px; background:#2D5A27; }
    .hero-banner { width:100%; max-width:640px; height:auto; display:block; margin:0 auto 14px; }
    .fallback-logo { width:150px; max-width:54%; height:auto; display:block; margin:0 auto 12px; }
    .brand-banner h1 { color:#ffffff; margin:0; font-size:24px; line-height:1.25; font-weight:800; letter-spacing:0; }
    .brand-banner p { color:#F6C343; margin:8px 0 0; font-size:14px; font-weight:600; }
    .brand-ribbon { background:#F6C343; color:#3A2A1A; padding:9px 18px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0; }
    .sequence { display:table; width:100%; table-layout:fixed; background:#fff8e6; border-bottom:1px solid #eadfca; }
    .sequence-step { display:table-cell; padding:13px 8px; text-align:center; vertical-align:top; border-right:1px solid #eadfca; }
    .sequence-step:last-child { border-right:0; }
    .sequence-step span { display:inline-block; width:22px; height:22px; line-height:22px; border-radius:50%; background:#2D5A27; color:#ffffff; font-size:12px; font-weight:800; margin-bottom:6px; }
    .sequence-step strong { display:block; color:#3A2A1A; font-size:12px; line-height:1.25; }
    .body { padding:32px 24px; line-height:1.6; }
    .body h2 { color:#2D5A27; margin-top:0; }
    .body h3 { color:#3A2A1A; }
    .body a { color:#2D5A27; }
    .footer { background:#f5f0e8; padding:18px 24px; text-align:center; font-size:12px; color:#6b6256; }
    .footer a { color:#2D5A27; text-decoration:none; }
    @media (max-width:520px) {
      .shell { padding:0; }
      .container { border-radius:0; border-left:0; border-right:0; }
      .sequence, .sequence-step { display:block; width:auto; }
      .sequence-step { border-right:0; border-bottom:1px solid #eadfca; }
      .sequence-step:last-child { border-bottom:0; }
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="container">
      <div class="header">
        <div class="brand-banner">
          <img class="hero-banner" src="${EMAIL_BANNER_URL}" alt="${language === 'he' ? 'שוק כפר - כל הכפר ביד שלך' : 'KFAR Marketplace - The Whole Village, In Your Hand'}" />
          <img class="fallback-logo" src="${EMAIL_LOGO_URL}" alt="${language === 'he' ? 'כפר' : 'KFAR Marketplace'}" />
          <h1>${language === 'he' ? 'שוק כפר' : 'KFAR Marketplace'}</h1>
          <p>${language === 'he' ? 'כל הכפר ביד שלך' : 'The Whole Village, In Your Hand'}</p>
        </div>
        <div class="brand-ribbon">${language === 'he' ? 'קהילה מקומית | הזמנות מאומתות | תשלום במשלוח' : 'Local community market | Verified orders | Cash on Delivery'}</div>
      </div>
      ${sequenceHtml}
      <div class="body">
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>${language === 'he' ? 'כפר השלום, דימונה, ישראל' : 'Village of Peace, Dimona, Israel'}</p>
        <p><a href="https://kfarapp.com">kfarapp.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>`.trim();
}

// -------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------

/**
 * Send a transactional email using a named template from the DB.
 *
 * @param to        Recipient email address
 * @param templateName  The `name` column value in email_templates
 * @param variables     Key/value map for {{placeholder}} substitution
 * @param language      'en' or 'he' - selects subject and body column
 */
export async function sendTransactional(
  to: string,
  templateName: string,
  variables: Record<string, string> = {},
  language: 'en' | 'he' = 'en'
): Promise<SendEmailResult> {
  const template = await fetchTemplate(templateName);
  if (!template) {
    const error = `Template "${templateName}" not found or inactive`;
    await logEmail(templateName, to, 'failed', variables, { errorMessage: error });
    return { success: false, error };
  }

  // Pick the right language column
  const rawSubject = language === 'he' && template.subject_he
    ? template.subject_he
    : template.subject_en;
  const rawBody = language === 'he' && template.body_he
    ? template.body_he
    : template.body_en;

  const subject = renderTemplate(rawSubject, variables);
  const bodyHtml = renderTemplate(rawBody, variables);
  const html = wrapInLayout(bodyHtml, language, templateName);

  const result = await send(to, subject, html);

  await logEmail(templateName, to, result.success ? 'sent' : 'failed', variables, {
    templateId: template.id,
    subject,
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send a marketing email to multiple recipients using a template.
 * Sends sequentially with a small delay to avoid overwhelming the MTA.
 */
export async function sendMarketing(
  recipients: Array<{ email: string; name?: string; variables?: Record<string, string> }>,
  templateName: string,
  sharedVariables: Record<string, string> = {},
  language: 'en' | 'he' = 'en'
): Promise<{ total: number; sent: number; failed: number; results: SendEmailResult[] }> {
  const template = await fetchTemplate(templateName);
  if (!template) {
    return {
      total: recipients.length,
      sent: 0,
      failed: recipients.length,
      results: recipients.map(() => ({
        success: false,
        error: `Template "${templateName}" not found or inactive`,
      })),
    };
  }

  const rawSubject = language === 'he' && template.subject_he
    ? template.subject_he
    : template.subject_en;
  const rawBody = language === 'he' && template.body_he
    ? template.body_he
    : template.body_en;

  const results: SendEmailResult[] = [];
  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    // Merge shared variables with per-recipient overrides
    const vars = { ...sharedVariables, ...recipient.variables };
    if (recipient.name) {
      vars.customer_name = vars.customer_name || recipient.name;
    }

    const subject = renderTemplate(rawSubject, vars);
    const bodyHtml = renderTemplate(rawBody, vars);
    const html = wrapInLayout(bodyHtml, language, templateName);

    const result = await send(recipient.email, subject, html);

    await logEmail(templateName, recipient.email, result.success ? 'sent' : 'failed', vars, {
      templateId: template.id,
      recipientName: recipient.name,
      subject,
      errorMessage: result.error,
    });

    results.push(result);
    if (result.success) sent++;
    else failed++;

    // Small delay between sends (100ms) to be polite to the MTA
    if (recipients.length > 1) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return { total: recipients.length, sent, failed, results };
}

/**
 * Send a raw email (no template). Useful for one-off system emails.
 */
export async function sendRaw(
  to: string,
  subject: string,
  bodyHtml: string,
  language: 'en' | 'he' = 'en'
): Promise<SendEmailResult> {
  const html = wrapInLayout(bodyHtml, language);
  const result = await send(to, subject, html);

  await logEmail('raw_email', to, result.success ? 'sent' : 'failed', {}, {
    subject,
    errorMessage: result.error,
  });

  return result;
}
