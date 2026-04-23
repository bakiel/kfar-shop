// SMS service
//
// SMS is intentionally disabled for the current COD launch phase. Keep the
// module surface stable so existing imports continue to compile, but always
// no-op until the client is ready to pay for and test messaging.

const SMS_DISABLED_REASON = 'sms disabled for current launch phase';

export function isSmsEnabled(): boolean {
  return false;
}

export async function sendSMS(_to: string, _body: string): Promise<{ sent: boolean; reason?: string }> {
  return { sent: false, reason: SMS_DISABLED_REASON };
}

export async function sendOrderConfirmationSMS(
  _phone: string,
  _orderNumber: string,
  _total: number,
  _lang: 'en' | 'he' = 'en',
): Promise<{ sent: boolean; reason?: string }> {
  return { sent: false, reason: SMS_DISABLED_REASON };
}
