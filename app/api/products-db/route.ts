import { NextRequest, NextResponse } from 'next/server';
import { db, query } from '@/lib/db/postgres-client';
import { verifyAccessToken, type AuthUser } from '@/lib/services/auth-service';

const PRODUCT_SCHEMA_TTL_MS = 300_000;
let cachedProductColumns: Set<string> | null = null;
let cachedProductColumnsAt = 0;

async function getProductColumns(): Promise<Set<string>> {
  if (cachedProductColumns && Date.now() - cachedProductColumnsAt < PRODUCT_SCHEMA_TTL_MS) {
    return cachedProductColumns;
  }

  try {
    const { rows } = await query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'products'`
    );
    cachedProductColumns = new Set(rows.map((row) => row.column_name));
    cachedProductColumnsAt = Date.now();
    return cachedProductColumns;
  } catch {
    // Safe fallback for environments where schema introspection is unavailable.
    cachedProductColumns = new Set([
      'id',
      'vendor_id',
      'name',
      'name_he',
      'slug',
      'description',
      'price',
      'category',
      'image_url',
      'primary_image',
      'image_gallery',
      'in_stock',
      'is_vegan',
      'is_kosher',
      'is_organic',
      'is_gluten_free',
      'tags',
      'status',
      'unit',
      'stock_quantity',
      'updated_at',
      'created_at',
    ]);
    cachedProductColumnsAt = Date.now();
    return cachedProductColumns;
  }
}

function getUser(request: NextRequest): AuthUser | null {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

function canManageVendor(user: AuthUser | null, vendorId?: string | null): boolean {
  if (!user || !vendorId) return false;
  return user.role === 'admin' || (user.role === 'vendor' && user.vendorId === vendorId);
}

function buildProductSlug(name: string, fallbackId: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallbackId;
}

async function buildProductWriteData(
  payload: Record<string, any>,
  vendorId?: string
): Promise<Record<string, any>> {
  const columns = await getProductColumns();
  const data: Record<string, any> = {};
  const image = payload.image ?? payload.image_url ?? payload.primary_image ?? null;
  const gallery = payload.images ?? payload.image_gallery;

  if (payload.id && columns.has('id')) data.id = payload.id;
  if (vendorId && columns.has('vendor_id')) data.vendor_id = vendorId;
  if (payload.name !== undefined && columns.has('name')) data.name = payload.name;
  if (payload.nameHe !== undefined && columns.has('name_he')) data.name_he = payload.nameHe;
  if (payload.name_he !== undefined && columns.has('name_he')) data.name_he = payload.name_he;
  if (payload.slug !== undefined && columns.has('slug')) data.slug = payload.slug;
  if (payload.description !== undefined && columns.has('description')) data.description = payload.description;
  if (payload.price !== undefined && columns.has('price')) data.price = payload.price;
  if (payload.category !== undefined && columns.has('category')) data.category = payload.category;
  if (payload.inStock !== undefined && columns.has('in_stock')) data.in_stock = payload.inStock;
  if (payload.in_stock !== undefined && columns.has('in_stock')) data.in_stock = payload.in_stock;
  if (payload.vegan !== undefined && columns.has('is_vegan')) data.is_vegan = payload.vegan;
  if (payload.is_vegan !== undefined && columns.has('is_vegan')) data.is_vegan = payload.is_vegan;
  if (payload.kosher !== undefined && columns.has('is_kosher')) data.is_kosher = payload.kosher;
  if (payload.is_kosher !== undefined && columns.has('is_kosher')) data.is_kosher = payload.is_kosher;
  if (payload.organic !== undefined && columns.has('is_organic')) data.is_organic = payload.organic;
  if (payload.is_organic !== undefined && columns.has('is_organic')) data.is_organic = payload.is_organic;
  if (payload.glutenFree !== undefined && columns.has('is_gluten_free')) data.is_gluten_free = payload.glutenFree;
  if (payload.is_gluten_free !== undefined && columns.has('is_gluten_free')) data.is_gluten_free = payload.is_gluten_free;
  if (payload.unit !== undefined && columns.has('unit')) data.unit = payload.unit;
  if (payload.stock_quantity !== undefined && columns.has('stock_quantity')) data.stock_quantity = payload.stock_quantity;
  if (payload.status !== undefined && columns.has('status')) data.status = payload.status;

  if (image !== undefined) {
    if (columns.has('image_url')) data.image_url = image;
    if (columns.has('primary_image')) data.primary_image = image;
  }

  if (gallery !== undefined && columns.has('image_gallery')) {
    data.image_gallery = Array.isArray(gallery) ? gallery : [];
  }

  if (payload.tags !== undefined && columns.has('tags')) {
    data.tags = Array.isArray(payload.tags) ? payload.tags : [];
  }

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    // Build query dynamically
    let sqlQuery = `
      SELECT p.*, v.name as vendor_name, v.slug as vendor_slug, v.logo_url as vendor_logo
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
    const transformedProducts = products
      ?.filter((product: any) => {
        const status = typeof product.status === 'string' ? product.status.toLowerCase() : 'published';
        return status === 'published';
      })
      .map((product: any) => ({
      id: product.id,
      name: product.name,
      nameHe: product.name_he,
      description: product.description,
      price: parseFloat(product.price),
      originalPrice: product.original_price ? parseFloat(product.original_price) : null,
      category: product.category,
      image: product.image_url || product.image || '/images/placeholder-product.jpg',
      images: product.image_gallery || [],
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
    const user = getUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin' && user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, error: 'Vendor or admin access required' },
        { status: 403 }
      );
    }

    const vendorId = user.role === 'vendor' ? user.vendorId : (body.vendorId || body.vendor_id);
    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'vendorId is required' },
        { status: 400 }
      );
    }

    if (!canManageVendor(user, vendorId)) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this vendor' },
        { status: 403 }
      );
    }

    if (!body.name || body.price === undefined || !body.category) {
      return NextResponse.json(
        { success: false, error: 'name, price, and category are required' },
        { status: 400 }
      );
    }

    const productId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const productData = await buildProductWriteData(
      {
        ...body,
        id: productId,
        slug: body.slug || buildProductSlug(body.name, productId),
        inStock: body.inStock !== false,
        vegan: body.vegan ?? true,
        kosher: body.kosher ?? false,
        organic: body.organic ?? false,
        glutenFree: body.glutenFree ?? false,
        status: body.status || 'draft',
        stock_quantity: body.stock_quantity ?? 0,
        unit: body.unit || 'item',
      },
      vendorId
    );

    const createdProduct = await db.products.create(productData);

    return NextResponse.json({
      success: true,
      product: createdProduct
    }, { status: 201 });

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
    const user = getUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const existingProduct = await db.products.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!canManageVendor(user, existingProduct.vendor_id)) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this product' },
        { status: 403 }
      );
    }

    const updateData = await buildProductWriteData(updates || {}, existingProduct.vendor_id);
    delete updateData.id;
    delete updateData.vendor_id;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date().toISOString();

    const updatedProduct = await db.products.update(productId, updateData);

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
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
    const user = getUser(request);

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const existingProduct = await db.products.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!canManageVendor(user, existingProduct.vendor_id)) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this product' },
        { status: 403 }
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
