import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { sendTransactional } from '@/lib/services/email/email-service';

function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const user = token ? verifyAccessToken(token) : null;
  return user?.role === 'admin' ? user : null;
}

function parseItems(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseAddress(value: unknown): Record<string, string> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, string>;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : { address: value };
    } catch {
      return { address: value };
    }
  }
  return {};
}

function normalizeOrder(row: any) {
  const items = parseItems(row.items);
  const deliveryAddress = parseAddress(row.delivery_address);
  return {
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method || 'cash',
    deliveryMethod: row.delivery_method || 'delivery',
    customer: {
      id: row.customer_id,
      name: row.customer_name || '',
      email: row.customer_email || '',
      phone: row.customer_phone || '',
    },
    deliveryAddress,
    items,
    subtotal: Number(row.subtotal || 0),
    deliveryFee: Number(row.delivery_fee || 0),
    total: Number(row.total || row.total_amount || 0),
    notes: row.delivery_notes || row.notes || '',
    vendorId: row.vendor_id || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { rows } = await query(
    'SELECT * FROM orders WHERE id::text = $1 OR order_number = $1 LIMIT 1',
    [id]
  );

  if (!rows[0]) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order: normalizeOrder(rows[0]) });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (body.action !== 'resend_confirmation') {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  const { rows } = await query(
    'SELECT * FROM orders WHERE id::text = $1 OR order_number = $1 LIMIT 1',
    [id]
  );
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (!row.customer_email || String(row.customer_email).startsWith('cod+')) {
    return NextResponse.json({ error: 'Order has no customer email to resend to' }, { status: 400 });
  }

  const order = normalizeOrder(row);
  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;">${item.name || item.productId || item.id || 'Item'}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity || 1}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${Number(item.price || 0).toFixed(2)} ILS</td>
    </tr>
  `).join('');
  const itemsTable = `<table style="width:100%;border-collapse:collapse;"><tbody>${itemsHtml}</tbody></table>`;

  const result = await sendTransactional(row.customer_email, 'order_confirmation', {
    customer_name: order.customer.name || 'Customer',
    order_number: order.orderNumber,
    items_html: itemsTable,
    total: order.total.toFixed(2),
    currency: 'ILS',
    payment_method: order.paymentMethod === 'cash' ? 'Cash on Delivery' : order.paymentMethod,
    delivery_method: order.deliveryMethod || 'Delivery',
  });

  return NextResponse.json({ success: result.success, messageId: result.messageId, error: result.error });
}
