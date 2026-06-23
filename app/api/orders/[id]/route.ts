import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

// ---------------------------------------------------------------------------
// GET /api/orders/[id]
//
// Returns a single order by ID (UUID) or order_number (KFAR-XXXXXXXX-XXXX).
// Includes order items if available.
// ---------------------------------------------------------------------------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = token ? verifyAccessToken(token) : null;
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = UUID_RE.test(id);
    const isOrderNumber = id.startsWith('KFAR-');

    // Try to find by ID first, then by order_number
    let orderQuery: string;
    let orderParams: any[];

    if (isUUID) {
      orderQuery = 'SELECT * FROM orders WHERE id = $1';
      orderParams = [id];
    } else if (isOrderNumber) {
      orderQuery = 'SELECT * FROM orders WHERE order_number = $1';
      orderParams = [id];
    } else {
      // Unknown format — try order_number only (safe, no UUID cast)
      orderQuery = 'SELECT * FROM orders WHERE order_number = $1';
      orderParams = [id];
    }

    const { rows: orderRows } = await query(orderQuery, orderParams);

    if (orderRows.length === 0) {
      // Fallback: if we searched by UUID try order_number, otherwise try UUID (only if valid)
      const fallbackQuery = isUUID
        ? 'SELECT * FROM orders WHERE order_number = $1'
        : (isOrderNumber && UUID_RE.test(id) ? 'SELECT * FROM orders WHERE id = $1' : null);

      if (!fallbackQuery) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      // eslint-disable-next-line no-warning-comments
      // NOTE: second attempt with alternate key format

      const { rows: fallbackRows } = await query(fallbackQuery, [id]);

      if (fallbackRows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      orderRows.push(fallbackRows[0]);
    }

    const order = orderRows[0];
    if (
      user.role !== 'admin'
      && !(user.role === 'vendor' && user.vendorId && order.vendor_id === user.vendorId)
      && !(user.role === 'customer' && user.customerId && order.customer_id === user.customerId)
    ) {
      return NextResponse.json(
        { success: false, error: 'Order does not belong to this account' },
        { status: 403 }
      );
    }

    // Fetch order items
    let items: any[] = [];
    try {
      const { rows: itemRows } = await query(
        'SELECT * FROM order_items WHERE order_id = $1 ORDER BY id',
        [order.id]
      );
      items = itemRows;
    } catch (itemsError) {
      // order_items table might not exist yet; try parsing from JSON column
      if (order.items) {
        try {
          items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch {
          items = [];
        }
      }
    }

    // Fetch payment transaction if linked
    let paymentTransaction = null;
    if (order.payment_transaction_id) {
      try {
        const { rows: ptRows } = await query(
          'SELECT * FROM payment_transactions WHERE id = $1',
          [order.payment_transaction_id]
        );
        paymentTransaction = ptRows[0] || null;
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items,
        paymentTransaction,
      },
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}
