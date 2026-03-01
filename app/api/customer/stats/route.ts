import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'customer' || !user.customerId) {
      return NextResponse.json(
        { error: 'Customer access required' },
        { status: 403 }
      );
    }

    const customerId = user.customerId;

    // Run all stats queries in parallel
    const [
      orderStatsResult,
      lastOrderResult,
      vendorBreakdownResult,
    ] = await Promise.all([
      // Total orders and spending
      query(
        `SELECT
           COUNT(*) as total_orders,
           COALESCE(SUM(total_amount), 0) as total_spent
         FROM orders
         WHERE customer_id = $1`,
        [customerId]
      ),

      // Last order date
      query(
        `SELECT created_at
         FROM orders
         WHERE customer_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [customerId]
      ),

      // Vendor breakdown (top vendor)
      query(
        `SELECT v.name as vendor_name, COUNT(*) as order_count
         FROM orders o
         LEFT JOIN vendors v ON o.vendor_id = v.id
         WHERE o.customer_id = $1
         GROUP BY v.name
         ORDER BY order_count DESC
         LIMIT 5`,
        [customerId]
      ),
    ]);

    const totalOrders = parseInt(orderStatsResult.rows[0]?.total_orders || '0');
    const totalSpent = parseFloat(orderStatsResult.rows[0]?.total_spent || '0');
    const lastOrderDate = lastOrderResult.rows[0]?.created_at || null;
    const favoriteVendor = vendorBreakdownResult.rows[0]?.vendor_name || '';
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

    // Build vendor breakdown map
    const vendorBreakdown: Record<string, number> = {};
    for (const row of vendorBreakdownResult.rows) {
      if (row.vendor_name) {
        vendorBreakdown[row.vendor_name] = parseInt(row.order_count);
      }
    }

    const stats = {
      totalOrders,
      totalSpent: Math.round(totalSpent * 100) / 100,
      savedWithDiscounts: 0, // Would need a discount tracking column to calculate
      favoriteVendor,
      lastOrderDate,
      averageOrderValue,
      vendorBreakdown,
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching customer stats:', error);
    // Return zero-state on error
    return NextResponse.json({
      totalOrders: 0,
      totalSpent: 0,
      savedWithDiscounts: 0,
      favoriteVendor: '',
      lastOrderDate: null,
      averageOrderValue: 0,
      vendorBreakdown: {},
    });
  }
}
