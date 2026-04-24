import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

// GET - Retrieve analytics for authenticated vendor
export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { error: 'Vendor access required' },
        { status: 403 }
      );
    }

    const vendorId = user.vendorId;

    // Run all analytics queries in parallel
    const [
      revenueResult,
      orderCountResult,
      productCountResult,
      dailyRevenueResult,
      topProductsResult,
      statusBreakdownResult,
    ] = await Promise.all([
      // Total revenue (all non-cancelled orders)
      query(
        `SELECT COALESCE(SUM(total), 0) as total_revenue
         FROM orders
         WHERE vendor_id = $1 AND status NOT IN ('cancelled', 'refunded')`,
        [vendorId]
      ),

      // Order count
      query(
        'SELECT COUNT(*) as order_count FROM orders WHERE vendor_id = $1',
        [vendorId]
      ),

      // Product count (active only)
      query(
        "SELECT COUNT(*) as product_count FROM products WHERE vendor_id = $1 AND status != 'archived'",
        [vendorId]
      ),

      // Revenue by day (last 30 days)
      query(
        `SELECT
           DATE(created_at) as date,
           COALESCE(SUM(total), 0) as revenue,
           COUNT(*) as orders
         FROM orders
         WHERE vendor_id = $1
           AND created_at >= NOW() - INTERVAL '30 days'
           AND status NOT IN ('cancelled', 'refunded')
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [vendorId]
      ),

      // Top products by sales (from order items)
      query(
        `SELECT
           p.id,
           p.name,
           p.price,
           p.image_url,
           COALESCE(p.view_count, 0) as views,
           COUNT(o.id) as order_appearances
         FROM products p
         LEFT JOIN orders o ON o.vendor_id = p.vendor_id
           AND o.items::text LIKE CONCAT('%', p.id, '%')
           AND o.status NOT IN ('cancelled', 'refunded')
         WHERE p.vendor_id = $1 AND p.status != 'archived'
         GROUP BY p.id, p.name, p.price, p.image_url, p.view_count
         ORDER BY order_appearances DESC, views DESC
         LIMIT 10`,
        [vendorId]
      ),

      // Order status breakdown
      query(
        `SELECT status, COUNT(*) as count
         FROM orders
         WHERE vendor_id = $1
         GROUP BY status`,
        [vendorId]
      ),
    ]);

    const totalRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || '0');
    const orderCount = parseInt(orderCountResult.rows[0]?.order_count || '0');
    const productCount = parseInt(productCountResult.rows[0]?.product_count || '0');
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Build status breakdown map
    const statusBreakdown: Record<string, number> = {};
    for (const row of statusBreakdownResult.rows) {
      statusBreakdown[row.status] = parseInt(row.count);
    }

    return NextResponse.json({
      success: true,
      vendorId,
      analytics: {
        totalRevenue,
        orderCount,
        productCount,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        statusBreakdown,
        revenueByDay: dailyRevenueResult.rows.map((row: any) => ({
          date: row.date,
          revenue: parseFloat(row.revenue),
          orders: parseInt(row.orders),
        })),
        topProducts: topProductsResult.rows.map((row: any) => ({
          id: row.id,
          name: row.name,
          price: parseFloat(row.price),
          image: row.image_url,
          views: parseInt(row.views),
          orderAppearances: parseInt(row.order_appearances),
        })),
        period: 'last_30_days',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Vendor analytics error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch vendor analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
