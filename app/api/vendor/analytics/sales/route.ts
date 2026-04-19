import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

// GET /api/vendor/analytics/sales?days=30
//
// Returns two leaderboards for the authenticated vendor:
//   - bestSellers: products ranked by units sold (last N days)
//   - topBuyers:   customers ranked by total spend (last N days)
//
// Data source: orders.items (jsonb) — we unnest, filter by vendor, aggregate.

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json({ error: 'Vendor access required' }, { status: 403 });
    }
    const vendorId = user.vendorId;

    const { searchParams } = new URL(request.url);
    const days = Math.max(1, Math.min(365, parseInt(searchParams.get('days') || '30', 10)));

    // Best sellers — unnest items, filter to this vendor, aggregate by productId+name.
    const bestSellersPromise = query(
      `SELECT
         COALESCE(item->>'productId', item->>'product_id', item->>'id') AS product_id,
         COALESCE(item->>'name', item->>'productId', item->>'product_id', item->>'id') AS product_name,
         item->>'image' AS image,
         SUM( (item->>'quantity')::numeric ) AS units_sold,
         SUM( (item->>'price')::numeric * (item->>'quantity')::numeric ) AS revenue
       FROM orders o,
            jsonb_array_elements(
              CASE jsonb_typeof(o.items)
                WHEN 'array' THEN o.items
                ELSE '[]'::jsonb
              END
            ) AS item
       WHERE COALESCE(NULLIF(item->>'vendorId', ''), NULLIF(item->>'vendor_id', ''), o.vendor_id) = $1
         AND o.status NOT IN ('cancelled', 'refunded')
         AND o.created_at >= NOW() - ($2 || ' days')::interval
       GROUP BY product_id, product_name, image
       ORDER BY units_sold DESC
       LIMIT 5`,
      [vendorId, String(days)]
    );

    // Top buyers — aggregate vendor-attributable spend from order items so
    // mixed-vendor carts still contribute to the correct vendor.
    const topBuyersPromise = query(
      `WITH vendor_order_totals AS (
         SELECT
           o.id AS order_id,
           o.customer_id,
           o.customer_name,
           o.customer_email,
           SUM((item->>'price')::numeric * (item->>'quantity')::numeric) AS vendor_total
         FROM orders o,
              jsonb_array_elements(
                CASE jsonb_typeof(o.items)
                  WHEN 'array' THEN o.items
                  ELSE '[]'::jsonb
                END
              ) AS item
         WHERE COALESCE(NULLIF(item->>'vendorId', ''), NULLIF(item->>'vendor_id', ''), o.vendor_id) = $1
           AND o.status NOT IN ('cancelled', 'refunded')
           AND o.created_at >= NOW() - ($2 || ' days')::interval
         GROUP BY o.id, o.customer_id, o.customer_name, o.customer_email
       )
       SELECT
         COALESCE(customer_id::text, customer_email) AS buyer_key,
         MAX(customer_name) AS customer_name,
         MAX(customer_email) AS customer_email,
         COUNT(*) AS order_count,
         SUM(vendor_total) AS total_spent
       FROM vendor_order_totals
       GROUP BY buyer_key
       ORDER BY total_spent DESC
       LIMIT 5`,
      [vendorId, String(days)]
    );

    const [bestSellersResult, topBuyersResult] = await Promise.all([
      bestSellersPromise,
      topBuyersPromise,
    ]);

    return NextResponse.json({
      success: true,
      days,
      bestSellers: bestSellersResult.rows.map((r: any) => ({
        productId: r.product_id,
        name: r.product_name,
        image: r.image,
        unitsSold: Number(r.units_sold) || 0,
        revenue: Number(r.revenue) || 0,
      })),
      topBuyers: topBuyersResult.rows.map((r: any) => ({
        name: r.customer_name || 'Customer',
        email: r.customer_email,
        orderCount: Number(r.order_count) || 0,
        totalSpent: Number(r.total_spent) || 0,
      })),
    });
  } catch (err) {
    console.error('vendor/analytics/sales error', err);
    return NextResponse.json({ error: 'Failed to fetch sales analytics' }, { status: 500 });
  }
}
