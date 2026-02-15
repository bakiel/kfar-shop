import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

// GET - Retrieve products for authenticated vendor
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM products WHERE vendor_id = $1';
    const params: any[] = [user.vendorId];

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    // Total count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { rows: countRows } = await query(countSql, params);
    const total = parseInt(countRows[0]?.total || '0');

    // Ordering and pagination
    sql += ' ORDER BY created_at DESC';
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const { rows } = await query(sql, params);

    return NextResponse.json({
      success: true,
      products: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching vendor products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new product for authenticated vendor
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    const { name, price, category } = body;
    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }

    const productId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const { rows } = await query(
      `INSERT INTO products (
        id, vendor_id, name, name_he, description, description_he,
        price, category, image, images, tags, status,
        stock_quantity, unit, view_count, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, 0, NOW(), NOW()
      ) RETURNING *`,
      [
        productId,
        user.vendorId,
        name,
        body.name_he || null,
        body.description || null,
        body.description_he || null,
        price,
        category,
        body.image || null,
        body.images ? JSON.stringify(body.images) : null,
        body.tags ? JSON.stringify(body.tags) : null,
        body.status || 'draft',
        body.stock_quantity || 0,
        body.unit || 'item',
      ]
    );

    return NextResponse.json({
      success: true,
      product: rows[0],
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
