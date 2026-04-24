import { NextRequest, NextResponse } from 'next/server';
import { db, query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('id');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const isActive = searchParams.get('active');

    // Get specific vendor
    if (vendorId) {
      const vendor = await db.vendors.findById(vendorId);

      if (!vendor) {
        return NextResponse.json(
          { success: false, error: 'Vendor not found' },
          { status: 404 }
        );
      }

      // Get product count
      const { rows: products } = await query(
        'SELECT COUNT(*) as count FROM products WHERE vendor_id = $1 AND in_stock = true',
        [vendorId]
      );

      return NextResponse.json({
        success: true,
        vendor: {
          ...vendor,
          productCount: parseInt(products[0]?.count || '0')
        }
      });
    }

    // Build vendor list query
    let sql = 'SELECT * FROM vendors WHERE 1=1';
    const params: any[] = [];

    if (isActive !== 'false') {
      params.push(true);
      sql += ` AND is_active = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND name ILIKE $${params.length}`;
    }

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY name ASC';

    const { rows: vendors } = await query(sql, params);

    // Get product counts for all vendors — single aggregation query instead of N per-vendor queries
    let productCountMap: Map<string, number> = new Map();
    try {
      const { rows: countRows } = await query(
        `SELECT vendor_id, COUNT(*) as count
         FROM products WHERE in_stock = true GROUP BY vendor_id`
      );
      for (const row of countRows) {
        productCountMap.set(row.vendor_id, parseInt(row.count, 10));
      }
    } catch {
      // If count query fails, all vendors get zero product count
    }

    const vendorsWithCounts = vendors.map((vendor: any) => ({
      ...vendor,
      productCount: productCountMap.get(vendor.id) ?? 0,
    }));

    return NextResponse.json({
      success: true,
      count: vendorsWithCounts.length,
      vendors: vendorsWithCounts
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Create new vendor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Require a verified admin JWT — header existence alone is not sufficient
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vendor = await db.vendors.create({
      id: body.id || body.name.toLowerCase().replace(/\s+/g, '-'),
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      description: body.description,
      logo: body.logo,
      banner: body.banner,
      category: body.category,
      email: body.email,
      phone: body.phone,
      address: body.address,
      is_active: body.isActive !== false,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      vendor
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Update vendor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, updates } = body;

    // Require a verified admin JWT — header existence alone is not sufficient
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vendor = await db.vendors.update(vendorId, {
      name: updates.name,
      description: updates.description,
      logo: updates.logo,
      banner: updates.banner,
      category: updates.category,
      email: updates.email,
      phone: updates.phone,
      address: updates.address,
      is_active: updates.isActive,
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor updated successfully',
      vendor
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
