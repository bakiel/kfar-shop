import { NextRequest, NextResponse } from 'next/server';
import { db, query } from '@/lib/db/postgres-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    // Build query dynamically
    let sqlQuery = `
      SELECT p.*, v.name as vendor_name, v.slug as vendor_slug, v.logo as vendor_logo
      FROM products p
      LEFT JOIN vendors v ON p.vendor_id = v.id
      WHERE p.in_stock = true
    `;
    const params: any[] = [];
    let paramCount = 0;

    // Filter by vendor
    if (vendorId) {
      paramCount++;
      sqlQuery += ` AND p.vendor_id = $${paramCount}`;
      params.push(vendorId);
    }

    // Search in name and description
    if (search) {
      paramCount++;
      sqlQuery += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Filter by category
    if (category) {
      paramCount++;
      sqlQuery += ` AND p.category = $${paramCount}`;
      params.push(category);
    }

    // Order by created_at
    sqlQuery += ` ORDER BY p.created_at DESC`;

    // Apply limit
    if (limit) {
      paramCount++;
      sqlQuery += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
    }

    const { rows: products } = await query(sqlQuery, params);

    // Transform data to match frontend expectations
    const transformedProducts = products?.map((product: any) => ({
      id: product.id,
      name: product.name,
      nameHe: product.name_he,
      description: product.description,
      price: parseFloat(product.price),
      originalPrice: product.original_price ? parseFloat(product.original_price) : null,
      category: product.category,
      image: product.image || product.main_image_url || '/images/placeholder-product.jpg',
      images: product.additional_images || [],
      kashrut: product.is_kosher ? 'Kosher' : null,
      vegan: product.is_vegan,
      organic: product.is_organic,
      glutenFree: product.is_gluten_free,
      unit: product.unit || 'unit',
      minimumOrder: product.minimum_order || 1,
      inStock: product.in_stock,
      rating: product.rating || 4.5,
      reviewCount: product.review_count || 0,
      specifications: product.specifications || [],
      culturalSignificance: product.cultural_significance,
      isFeatured: product.is_featured,
      badge: product.badge,
      vendorId: product.vendor_id,
      vendorName: product.vendor_name || 'Unknown Vendor',
      vendorLogo: product.vendor_logo
    })) || [];

    return NextResponse.json({
      success: true,
      count: transformedProducts.length,
      products: transformedProducts
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if user is authenticated as vendor or admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const productId = `prod-${Date.now()}`;
    const slug = body.name.toLowerCase().replace(/\s+/g, '-');

    const { rows } = await query(
      `INSERT INTO products (
        id, vendor_id, name, slug, description, category, price,
        image, in_stock, is_vegan, is_kosher, is_organic, is_gluten_free, tags,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *`,
      [
        productId,
        body.vendorId,
        body.name,
        slug,
        body.description,
        body.category,
        body.price,
        body.image,
        body.inStock !== false,
        body.vegan !== false,
        body.kosher || false,
        body.organic || false,
        body.glutenFree || false,
        JSON.stringify(body.tags || [])
      ]
    );

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

    // Check if user is authenticated as vendor or admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
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

    // Check if user is authenticated as vendor or admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await query('DELETE FROM products WHERE id = $1', [productId]);

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
