// SMS service (Task #6)
//
// Thin server-side Twilio wrapper gated by a single env flag:
//   SMS_ENABLED=true   → real SMS sends attempted
//   SMS_ENABLED=false  → all methods no-op (default)
//
// The client is being deferred on SMS spend during the Phase-1 launch, so all
// dispatch sites call into this module. Flipping the flag on is a one-env-var
// change — no code path edits required.

const SMS_ENABLED = process.env.SMS_ENABLED === 'true';

let cachedClient: any | null = null;

function getClient() {
  if (!SMS_ENABLED) return null;
  if (cachedClient) return cachedClient;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    console.warn('[sms-service] SMS_ENABLED=true but TWILIO_ACCOUNT_SID/TOKEN missing — skipping');
    return null;
  }
  try {
    // Lazy import to keep cold start light when SMS is off
    const twilio = require('twilio');
    cachedClient = twilio(accountSid, authToken);
    return cachedClient;
  } catch (err) {
    console.warn('[sms-service] twilio package unavailable:', err);
    return null;
  }
}

function formatIsraeliNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('972')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+972${cleaned.slice(1)}`;
  if (cleaned.length >= 9) return `+972${cleaned}`;
  return phone;
}

export function isSmsEnabled(): boolean {
  return SMS_ENABLED;
}

export async function sendSMS(to: string, body: string): Promise<{ sent: boolean; reason?: string }> {
  if (!SMS_ENABLED) {
    return { sent: false, reason: 'SMS_ENABLED=false' };
  }
  const client = getClient();
  if (!client) return { sent: false, reason: 'twilio client unavailable' };
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) return { sent: false, reason: 'TWILIO_PHONE_NUMBER missing' };
  try {
    const result = await client.messages.create({
      from,
      to: formatIsraeliNumber(to),
      body,
    });
    console.log(`[sms-service] sent ${result.sid} → ${to}`);
    return { sent: true };
  } catch (err: any) {
    console.error('[sms-service] send error:', err?.message || err);
    return { sent: false, reason: err?.message || 'unknown error' };
  }
}

export async function sendOrderConfirmationSMS(
  phone: string,
  orderNumber: string,
  total: number,
  lang: 'en' | 'he' = 'en',
): Promise<{ sent: boolean; reason?: string }> {
  const body = lang === 'he'
    ? `Kfar: ההזמנה ${orderNumber} התקבלה. סה"כ ₪${total.toFixed(2)}. נעדכן בזמן המשלוח.`
    : `Kfar: order ${orderNumber} received. Total ₪${total.toFixed(2)}. We'll call to arrange delivery.`;
  return sendSMS(phone, body);
}
