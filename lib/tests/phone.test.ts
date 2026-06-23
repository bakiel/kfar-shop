import { describe, expect, test } from 'vitest';
import { toWhatsAppNumber, buildWhatsAppUrl } from '../utils/phone';

describe('toWhatsAppNumber', () => {
  test('converts Israeli local number with leading 0 to international', () => {
    expect(toWhatsAppNumber('0501234567')).toBe('972501234567');
  });

  test('strips dashes, spaces and parentheses', () => {
    expect(toWhatsAppNumber('050-123-4567')).toBe('972501234567');
    expect(toWhatsAppNumber('(050) 123 4567')).toBe('972501234567');
  });

  test('passes through a number already in international format', () => {
    expect(toWhatsAppNumber('972501234567')).toBe('972501234567');
  });

  test('handles a + international prefix', () => {
    expect(toWhatsAppNumber('+972 50 123 4567')).toBe('972501234567');
  });

  test('handles a 00 international dialing prefix', () => {
    expect(toWhatsAppNumber('00972501234567')).toBe('972501234567');
  });

  test('prepends country code to a bare local number without leading 0', () => {
    expect(toWhatsAppNumber('501234567')).toBe('972501234567');
  });

  test('returns empty string for empty / non-digit input', () => {
    expect(toWhatsAppNumber('')).toBe('');
    expect(toWhatsAppNumber(null)).toBe('');
    expect(toWhatsAppNumber(undefined)).toBe('');
    expect(toWhatsAppNumber('---')).toBe('');
  });

  test('supports a custom country code', () => {
    expect(toWhatsAppNumber('0821234567', '27')).toBe('27821234567');
  });

  test('drops a trunk 0 left between the country code and the number', () => {
    expect(toWhatsAppNumber('+972 (0)50 123 4567')).toBe('972501234567');
    expect(toWhatsAppNumber('9720501234567')).toBe('972501234567');
  });

  test('00 dialing prefix with a trunk 0 is cleaned', () => {
    expect(toWhatsAppNumber('00972 (0)50 123 4567')).toBe('972501234567');
  });

  test('a + in front of a local number (typo) is localized', () => {
    expect(toWhatsAppNumber('+0501234567')).toBe('972501234567');
  });

  test('keeps a genuine foreign international number', () => {
    expect(toWhatsAppNumber('+1 212 555 1212')).toBe('12125551212');
    expect(toWhatsAppNumber('0044 20 7946 0958')).toBe('442079460958');
  });
});

describe('buildWhatsAppUrl', () => {
  test('builds a valid wa.me url with encoded message', () => {
    expect(buildWhatsAppUrl('050-123-4567', 'Hi there!')).toBe(
      'https://wa.me/972501234567?text=Hi%20there!'
    );
  });

  test('builds a url without a message', () => {
    expect(buildWhatsAppUrl('0501234567')).toBe('https://wa.me/972501234567');
  });

  test('returns empty string when no digits present', () => {
    expect(buildWhatsAppUrl('')).toBe('');
  });
});
