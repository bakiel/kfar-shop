import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres-client';
import { getProductFeed, invalidateProductFeedCache } from '@/lib/services/live-product-feed';
import { invalidateVendorFeedCache } from '@/lib/services/live-vendor-feed';
import { verifyAccessToken } from '@/lib/services/auth-service';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

function invalidateLiveFeedCaches() {
  invalidateProductFeedCache();
  invalidateVendorFeedCache();
}

function getAuthorizedUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
  return token ? verifyAccessToken(token) : null;
}

function forbidden(message = 'Forbidden') {
  return NextResponse.json({ success: false, error: message }, { status: 403 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const feed = await getProductFeed({
    vendorId: searchParams.get('vendor'),
    search: searchParams.get('search'),
    category: searchParams.get('category'),
    limit: searchParams.get('limit'),
  });

  return NextResponse.json(feed, {
    status: feed.success ? 200 : 503,
    headers: NO_STORE_HEADERS,
  });
}

// Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const user = getAuthorizedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (user.role !== 'admin' && user.role !== 'vendor') {
      return forbidden('Vendor or admin access required');
    }

    const vendorId = user.role === 'admin' ? body.vendorId : user.vendorId;
    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID required' },
        { status: 400 }
      );
    }

    const productId = `prod-${Date.now()}`;
    const slug = body.name.toLowerCase().replace(/\s+/g, '-');

    const { rows } = await query(
      `INSERT INTO products (
        id, vendor_id, name, slug, description, category, price,
        image_url, in_stock, is_vegan, is_kosher, is_organic, is_gluten_free, tags,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        productId,
        vendorId,
        body.name,
        slug,
        body.description,
        body.category,
        body.price,
        body.image || body.image_url,
        body.inStock !== false,
        body.vegan !== false,
        body.kosher || false,
        body.organic || false,
        body.glutenFree || false,
        body.tags || []
      ]
    );

    invalidateLiveFeedCaches();

    return NextResponse.json({
      success: true,
      product: rows[0]
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, updates } = body;

    const user = getAuthorizedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (user.role !== 'admin' && user.role !== 'vendor') {
      return forbidden('Vendor or admin access required');
    }
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    if (user.role === 'vendor') {
      const { rows: ownedRows } = await query(
        'SELECT vendor_id FROM products WHERE id = $1 LIMIT 1',
        [productId]
      );
      if (!ownedRows[0]) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      if (ownedRows[0].vendor_id !== user.vendorId) {
        return forbidden('Product does not belong to this vendor');
      }
    }

    const { rows } = await query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        category = COALESCE($4, category),
        in_stock = COALESCE($5, in_stock),
        is_vegan = COALESCE($6, is_vegan),
        is_kosher = COALESCE($7, is_kosher),
        is_organic = COALESCE($8, is_organic),
        is_gluten_free = COALESCE($9, is_gluten_free),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *`,
      [
        updates.name,
        updates.description,
        updates.price,
        updates.category,
        updates.inStock,
        updates.vegan,
        updates.kosher,
        updates.organic,
        updates.glutenFree,
        productId
      ]
    );

    invalidateLiveFeedCaches();

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: rows[0]
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    const user = getAuthorizedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (user.role !== 'admin' && user.role !== 'vendor') {
      return forbidden('Vendor or admin access required');
    }
    if (user.role === 'vendor') {
      const { rows: ownedRows } = await query(
        'SELECT vendor_id FROM products WHERE id = $1 LIMIT 1',
        [productId]
      );
      if (!ownedRows[0]) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      if (ownedRows[0].vendor_id !== user.vendorId) {
        return forbidden('Product does not belong to this vendor');
      }
    }

    await query('DELETE FROM products WHERE id = $1', [productId]);
    invalidateLiveFeedCaches();

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
