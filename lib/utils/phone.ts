// Phone number helpers for the Kfar marketplace.
//
// Customers enter phone numbers in Israeli local format (e.g. "050-123-4567" or
// "0501234567"). `wa.me/` click-to-chat links require a full international number with
// no leading "0" and no "+", so the local format must be converted first. The previous
// code only stripped non-digits, producing invalid links like wa.me/0501234567.

const DEFAULT_COUNTRY_CODE = '972'; // Israel

/**
 * Normalize a raw phone number to international digits-only format for wa.me links.
 *
 * Rules:
 *  - Strip everything except digits (handles "+", spaces, dashes, parentheses).
 *  - A leading "00" (international dialing prefix) is treated as already-international.
 *  - A number that already starts with the country code is passed through.
 *  - A local number with a leading "0" has the "0" replaced by the country code.
 *  - Any other bare number gets the country code prepended.
 *
 * Returns an empty string for input with no digits.
 */
export function toWhatsAppNumber(
  raw: string | null | undefined,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string {
  if (!raw) return '';

  let digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  // Was this written as an international number? ("+..." or a "00" dialing prefix.)
  const wasIntl = raw.trim().startsWith('+') || digits.startsWith('00');
  if (digits.startsWith('00')) {
    digits = digits.slice(2); // drop the international dialing prefix
  }

  // Already our country code (e.g. 972...). Strip a stray trunk "0" that can survive
  // between the country code and the subscriber number, e.g. "+972 (0)50..." -> 972050...
  if (digits.startsWith(countryCode)) {
    return countryCode + digits.slice(countryCode.length).replace(/^0+/, '');
  }

  // A genuinely international number (foreign country code): keep it as-is, but a leading
  // "0" here means it was a local number typed with a stray "+" (e.g. "+0 50...") -> localize.
  if (wasIntl) {
    return digits.startsWith('0') ? countryCode + digits.replace(/^0+/, '') : digits;
  }

  // Bare local number (the common case): drop the trunk 0 and prepend the country code.
  // 0501234567 -> 972501234567 ; 501234567 -> 972501234567
  return countryCode + digits.replace(/^0+/, '');
}

/**
 * Build a full WhatsApp click-to-chat URL. Returns '' when the phone has no digits.
 */
export function buildWhatsAppUrl(
  raw: string | null | undefined,
  message?: string,
  countryCode: string = DEFAULT_COUNTRY_CODE
): string {
  const number = toWhatsAppNumber(raw, countryCode);
  if (!number) return '';
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
