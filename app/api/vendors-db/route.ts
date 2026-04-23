import { NextRequest, NextResponse } from 'next/server';
import { db, query } from '@/lib/db/postgres-client';
import { verifyAccessToken, type AuthUser } from '@/lib/services/auth-service';
import bcrypt from 'bcryptjs';

const VENDOR_SCHEMA_TTL_MS = 300_000;
let cachedVendorColumns: Set<string> | null = null;
let cachedVendorColumnsAt = 0;

async function getVendorColumns(): Promise<Set<string>> {
  if (cachedVendorColumns && Date.now() - cachedVendorColumnsAt < VENDOR_SCHEMA_TTL_MS) {
    return cachedVendorColumns;
  }

  try {
    const { rows } = await query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'vendors'`
    );
    cachedVendorColumns = new Set(rows.map((row) => row.column_name));
    cachedVendorColumnsAt = Date.now();
    return cachedVendorColumns;
  } catch {
    cachedVendorColumns = new Set([
      'id',
      'name',
      'slug',
      'description',
      'logo_url',
      'banner_url',
      'category',
      'email',
      'phone',
      'address',
      'password_hash',
      'is_active',
      'status',
      'featured',
      'created_at',
      'updated_at',
    ]);
    cachedVendorColumnsAt = Date.now();
    return cachedVendorColumns;
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

function buildVendorSlug(name: string, fallbackId: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallbackId;
}

function mapPublicVendor(vendor: any, productCount: number) {
  return {
    id: vendor.id,
    name: vendor.name,
    slug: vendor.slug,
    description: vendor.description || '',
    logo: vendor.logo_url || vendor.logo || '',
    banner: vendor.banner_url || vendor.banner || '',
    category: vendor.category || 'general',
    featured: !!vendor.featured,
    isActive: vendor.is_active ?? vendor.status === 'active',
    productCount,
    createdAt: vendor.created_at,
    updatedAt: vendor.updated_at,
  };
}

async function buildVendorWriteData(payload: Record<string, any>): Promise<Record<string, any>> {
  const columns = await getVendorColumns();
  const data: Record<string, any> = {};

  if (payload.id && columns.has('id')) data.id = payload.id;
  if (payload.name !== undefined && columns.has('name')) data.name = payload.name;
  if (payload.slug !== undefined && columns.has('slug')) data.slug = payload.slug;
  if (payload.description !== undefined && columns.has('description')) data.description = payload.description;
  if (payload.category !== undefined && columns.has('category')) data.category = payload.category;
  if (payload.email !== undefined && columns.has('email')) data.email = payload.email;
  if (payload.phone !== undefined && columns.has('phone')) data.phone = payload.phone;
  if (payload.address !== undefined && columns.has('address')) data.address = payload.address;
  if (payload.featured !== undefined && columns.has('featured')) data.featured = payload.featured;
  if (payload.created_at !== undefined && columns.has('created_at')) data.created_at = payload.created_at;
  if (payload.updated_at !== undefined && columns.has('updated_at')) data.updated_at = payload.updated_at;

  const logo = payload.logo ?? payload.logo_url;
  const banner = payload.banner ?? payload.banner_url;
  if (logo !== undefined) {
    if (columns.has('logo_url')) data.logo_url = logo;
    else if (columns.has('logo')) data.logo = logo;
  }
  if (banner !== undefined) {
    if (columns.has('banner_url')) data.banner_url = banner;
    else if (columns.has('banner')) data.banner = banner;
  }

  if (payload.isActive !== undefined || payload.is_active !== undefined) {
    const isActive = payload.isActive ?? payload.is_active;
    if (columns.has('is_active')) data.is_active = isActive;
    if (columns.has('status')) data.status = isActive ? 'active' : 'suspended';
  }

  if (columns.has('password_hash')) {
    if (payload.passwordHash) {
      data.password_hash = payload.passwordHash;
    } else if (payload.password) {
      data.password_hash = await bcrypt.hash(payload.password, 10);
    }
  }

  return data;
}

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
        vendor: mapPublicVendor(vendor, parseInt(products[0]?.count || '0'))
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

    // Get product counts for each vendor
    const vendorsWithCounts = await Promise.all(
      vendors.map(async (vendor: any) => {
        const { rows: products } = await query(
          'SELECT COUNT(*) as count FROM products WHERE vendor_id = $1 AND in_stock = true',
          [vendor.id]
        );
        return {
          ...mapPublicVendor(vendor, parseInt(products[0]?.count || '0'))
        };
      })
    );

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
    const user = getUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'name and email are required' },
        { status: 400 }
      );
    }

    const vendorId = body.id || buildVendorSlug(body.name, `vendor-${Date.now()}`);
    const vendorData = await buildVendorWriteData({
      ...body,
      id: vendorId,
      slug: body.slug || buildVendorSlug(body.name, vendorId),
      isActive: body.isActive !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (Object.prototype.hasOwnProperty.call(vendorData, 'password_hash') && !vendorData.password_hash) {
      return NextResponse.json(
        { success: false, error: 'password or passwordHash is required to create a vendor account' },
        { status: 400 }
      );
    }

    const vendor = await db.vendors.create(vendorData);

    return NextResponse.json({
      success: true,
      vendor: mapPublicVendor(vendor, 0)
    }, { status: 201 });

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
    const user = getUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

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

    const vendor = await db.vendors.update(vendorId, await buildVendorWriteData({
      ...(updates || {}),
      updated_at: new Date().toISOString()
    }));

    return NextResponse.json({
      success: true,
      message: 'Vendor updated successfully',
      vendor: mapPublicVendor(vendor, 0)
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
