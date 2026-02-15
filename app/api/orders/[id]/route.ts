import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';

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
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Try to find by ID first, then by order_number
    let orderQuery = 'SELECT * FROM orders WHERE id = $1';
    let orderParams: any[] = [id];

    // If it looks like an order number (starts with KFAR-), search by order_number
    if (id.startsWith('KFAR-')) {
      orderQuery = 'SELECT * FROM orders WHERE order_number = $1';
    }

    const { rows: orderRows } = await query(orderQuery, orderParams);

    if (orderRows.length === 0) {
      // Fallback: try the other field
      const fallbackQuery = id.startsWith('KFAR-')
        ? 'SELECT * FROM orders WHERE id = $1'
        : 'SELECT * FROM orders WHERE order_number = $1';

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
