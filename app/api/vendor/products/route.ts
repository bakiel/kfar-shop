import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';
import { invalidateProductFeedCache } from '@/lib/services/live-product-feed';
import { invalidateVendorFeedCache } from '@/lib/services/live-vendor-feed';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `product-${Date.now()}`;
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value) return [value];
  return [];
}

function normalizeVendorProduct(row: any) {
  const images = asArray(row.image_gallery || row.images);
  const image = row.image_url || row.primary_image || row.image_path || row.image || images[0] || '/images/placeholder-product.jpg';
  return {
    ...row,
    image,
    images: images.length > 0 ? images : (image ? [image] : []),
  };
}

function invalidateLiveFeedCaches() {
  invalidateProductFeedCache();
  invalidateVendorFeedCache();
}

// GET - Retrieve products for authenticated vendor
export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor access required' },
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
      products: rows.map(normalizeVendorProduct),
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
      { success: false, products: [], pagination: { page: 1, limit: 0, total: 0, totalPages: 0 }, error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { name, price, category } = body;
    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }

    const productId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const images = asArray(body.images || body.image_gallery);
    const tags = asArray(body.tags);

    const { rows } = await query(
      `INSERT INTO products (
        id, vendor_id, name, name_he, slug, description, description_he,
        price, original_price, category, image_url, image_gallery, tags, status,
        stock_quantity, unit, is_vegan, is_kosher, is_organic, is_gluten_free,
        nutritional_info, ingredients, view_count, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20,
        $21, $22, 0, NOW(), NOW()
      ) RETURNING *`,
      [
        productId,
        user.vendorId,
        name,
        body.name_he || null,
        slugify(name),
        body.description || null,
        body.description_he || null,
        price,
        body.original_price ?? null,
        category,
        body.image || body.image_url || images[0] || null,
        images,
        tags,
        body.status || 'draft',
        body.stock_quantity || 0,
        body.unit || 'item',
        body.is_vegan !== false,
        body.is_kosher !== false,
        body.is_organic === true,
        body.is_gluten_free === true,
        body.nutritional_info || null,
        asArray(body.ingredients),
      ]
    );

    invalidateLiveFeedCaches();

    return NextResponse.json({
      success: true,
      product: normalizeVendorProduct(rows[0]),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
