export const dynamic = 'force-dynamic';

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

        // Enrich with order/revenue stats — single aggregation query instead of N per-vendor queries
        let statsMap: Map<string, { totalOrders: number; totalRevenue: number }> = new Map();
        try {
          const { rows: statsRows } = await query(
            `SELECT vendor_id, COUNT(*) as order_count, COALESCE(SUM(total), 0) as revenue
             FROM orders GROUP BY vendor_id`
          );
          for (const row of statsRows) {
            statsMap.set(row.vendor_id, {
              totalOrders: parseInt(row.order_count, 10),
              totalRevenue: parseFloat(row.revenue) || 0,
            });
          }
        } catch {
          // If order stats query fails, all vendors get zero stats
        }

        const enrichedVendors = vendors.map((v: any) => {
          const stats = statsMap.get(v.id) ?? { totalOrders: 0, totalRevenue: 0 };
          return { ...v, ...stats };
        });

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

    // --- Admins ---
    if (!type || type === 'admins') {
      try {
        const { rows: admins } = await query(
          `SELECT id, email, role, display_name, is_active, last_login_at, created_at
           FROM users WHERE role = 'admin' ORDER BY created_at ASC`
        );

        const normalizedAdmins = admins.map((a: any) => ({
          id: a.id,
          name: a.display_name || a.email?.split('@')[0] || 'Admin',
          email: a.email,
          role: a.role === 'admin' ? 'Super Admin' : a.role,
          lastLogin: a.last_login_at ? new Date(a.last_login_at).toISOString().split('T')[0] : '',
          status: a.is_active ? 'active' : 'inactive',
        }));

        response.admins = normalizedAdmins;
        response.adminCount = normalizedAdmins.length;
      } catch (err) {
        console.error('Admins DB query failed:', err);
        response.admins = [];
        response.adminCount = 0;
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
