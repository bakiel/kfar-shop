import { describe, expect, test, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as confirmOrder } from '../../app/api/orders/confirm/route';
import { renderTemplate } from '../services/email/email-service';
import { resolveImagePath } from '../utils/image-resolver';

vi.mock('@/lib/db/postgres-client', () => ({
  query: vi.fn(),
}));

describe('launch security regressions', () => {
  test('legacy order confirmation endpoint cannot create bypass orders', async () => {
    const request = new NextRequest('https://kfarapp.com/api/orders/confirm', {
      method: 'POST',
      body: JSON.stringify({
        orderId: 'KFAR-TEST-BYPASS',
        paymentMethod: 'credit_card',
        total: 1,
        customer: { name: 'Bypass', email: 'test@example.com' },
        items: [{ name: 'Item', quantity: 1, price: 1 }],
      }),
    });

    const response = await confirmOrder(request);
    const data = await response.json();

    expect(response.status).toBe(410);
    expect(data.success).toBe(false);
    expect(data.error).toContain('disabled');
  });

  test('transactional templates strip unresolved placeholders', () => {
    const rendered = renderTemplate(
      'Order {{order_number}} {{status_message}} {{dashboard_url}} {{missing_value}}',
      { order_number: 'KFAR-1' }
    );

    expect(rendered).toContain('KFAR-1');
    expect(rendered).toContain('https://kfarapp.com/vendor/orders');
    expect(rendered).not.toMatch(/\{\{[^{}]+\}\}/);
  });

  test('vendor upload image paths are not collapsed to placeholders', () => {
    expect(resolveImagePath('/uploads/vendor-products/teva-deli/item.webp'))
      .toBe('/uploads/vendor-products/teva-deli/item.webp');
  });
});
