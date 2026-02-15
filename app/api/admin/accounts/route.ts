import { NextRequest, NextResponse } from 'next/server';
import { db, isDbAvailable, query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'customers', 'vendors', or null (both)
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');

    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json(
        { error: 'Database unavailable', customers: [], vendors: [] },
        { status: 503 }
      );
    }

    const response: any = {};

    // --- Customers ---
    if (!type || type === 'customers') {
      try {
        let customers = await db.customers.findAll();

        // Apply filters
        if (search) {
          customers = customers.filter(
            (c: any) =>
              c.name?.toLowerCase().includes(search) ||
              c.email?.toLowerCase().includes(search) ||
              c.phone?.includes(search)
          );
        }
        if (status && status !== 'all') {
          customers = customers.filter((c: any) => c.status === status);
        }

        response.customers = customers;
        response.customerCount = customers.length;
      } catch (err) {
        console.error('Customers DB query failed:', err);
        return NextResponse.json(
          { error: 'Database unavailable', customers: [], vendors: [] },
          { status: 503 }
        );
      }
    }

    // --- Vendors ---
    if (!type || type === 'vendors') {
      try {
        let vendors = await db.vendors.findAll();

        // Enrich with order/revenue stats from DB
        const enrichedVendors = await Promise.all(
          vendors.map(async (v: any) => {
            let totalRevenue = 0;
            let totalOrders = 0;
            try {
              const { rows } = await query(
                `SELECT COUNT(*) as order_count, COALESCE(SUM(total), 0) as revenue
                 FROM orders WHERE vendor_id = $1`,
                [v.id]
              );
              if (rows[0]) {
                totalOrders = parseInt(rows[0].order_count, 10);
                totalRevenue = parseFloat(rows[0].revenue) || 0;
              }
            } catch {
              // If order stats query fails, leave at 0
            }
            return {
              ...v,
              totalRevenue,
              totalOrders,
            };
          })
        );

        let filteredVendors = enrichedVendors;
        if (search) {
          filteredVendors = filteredVendors.filter(
            (v: any) =>
              v.name?.toLowerCase().includes(search) ||
              v.specialty?.toLowerCase().includes(search)
          );
        }

        response.vendors = filteredVendors;
        response.vendorCount = filteredVendors.length;
      } catch (err) {
        console.error('Vendors DB query failed:', err);
        return NextResponse.json(
          { error: 'Database unavailable', customers: [], vendors: [] },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Accounts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}
