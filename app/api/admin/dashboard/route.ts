import { NextRequest, NextResponse } from 'next/server';
import { vendorStores, getAllProducts } from '@/lib/data/wordpress-style-data-layer';
import { db, isDbAvailable, query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Static product/vendor counts from the data layer (these are real)
    const products = getAllProducts();
    const vendors = Object.values(vendorStores);

    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    let totalCustomers = 0;
    let activeOrders = 0;
    let pendingOrders = 0;
    let totalRevenue = 0;
    let recentOrders: any[] = [];
    let vendorStats: any[] = [];

    try {
      // Customer count
      const customers = await db.customers.findAll();
      totalCustomers = customers.length;

      // Order stats
      const allOrders = await db.orders.findAll();
      activeOrders = allOrders.filter(
        (o: any) => o.status === 'processing' || o.status === 'shipped'
      ).length;
      pendingOrders = allOrders.filter(
        (o: any) => o.status === 'pending'
      ).length;
      totalRevenue = allOrders.reduce(
        (sum: number, o: any) => sum + (parseFloat(o.total) || 0),
        0
      );

      // Recent orders (last 5, from DB)
      const { rows: recentRows } = await query(
        `SELECT o.id, o.order_number, o.total, o.status, o.created_at,
                c.name as customer_name, o.vendor_id
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.id
         ORDER BY o.created_at DESC
         LIMIT 5`
      );
      recentOrders = recentRows.map((r: any) => ({
        id: r.order_number || r.id,
        customer: r.customer_name || 'Unknown',
        vendor: r.vendor_id || '',
        total: parseFloat(r.total) || 0,
        status: r.status,
        date: r.created_at
          ? new Date(r.created_at).toISOString().split('T')[0]
          : '',
      }));

      // Vendor stats from DB
      const { rows: vRows } = await query(
        `SELECT v.id, v.name,
                COUNT(o.id) as order_count,
                COALESCE(SUM(o.total), 0) as revenue
         FROM vendors v
         LEFT JOIN orders o ON o.vendor_id = v.id
         WHERE v.status = 'active'
         GROUP BY v.id, v.name
         ORDER BY v.name`
      );
      vendorStats = vRows.map((v: any) => ({
        id: v.id,
        name: v.name,
        products: vendors.find((s) => s.id === v.id)?.products?.length || 0,
        revenue: parseFloat(v.revenue) || 0,
        orders: parseInt(v.order_count, 10) || 0,
      }));
    } catch (err) {
      console.error('Dashboard DB queries failed:', err);
      return NextResponse.json(
        { error: 'Database unavailable' },
        { status: 503 }
      );
    }

    const stats = {
      totalRevenue,
      activeOrders,
      activeVendors: vendors.length,
      totalProducts: products.length,
      totalCustomers,
      pendingOrders,
      recentOrders,
      vendorStats,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
