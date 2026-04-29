import { NextResponse } from 'next/server';
import { getVendorById } from '@/lib/services/live-vendor-feed';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';
import { invalidateVendorFeedCache } from '@/lib/services/live-vendor-feed';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const user = token ? verifyAccessToken(token) : null;

  if (!user || (user.role !== 'admin' && user.vendorId !== vendorId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const vendor = await getVendorById(vendorId, true);

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  return NextResponse.json({
    vendor: {
      ...vendor,
      products: vendor.products || [],
    },
  }, { headers: NO_STORE_HEADERS });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;

    if (!user || (user.role !== 'admin' && user.vendorId !== vendorId)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const body = await request.json();
    const fieldMap: Record<string, string> = {
      name: 'name',
      nameHe: 'name_he',
      name_he: 'name_he',
      description: 'description',
      descriptionHe: 'description_he',
      description_he: 'description_he',
      phone: 'phone',
      whatsapp: 'whatsapp',
      address: 'address',
      category: 'category',
      categories: 'categories',
      logo: 'logo_url',
      logoUrl: 'logo_url',
      logo_url: 'logo_url',
      banner: 'banner_url',
      bannerUrl: 'banner_url',
      banner_url: 'banner_url',
      businessHours: 'business_hours',
      business_hours: 'business_hours',
      deliveryAreas: 'delivery_areas',
      delivery_areas: 'delivery_areas',
      minimumOrder: 'minimum_order',
      minimum_order: 'minimum_order',
      deliveryFee: 'delivery_fee',
      delivery_fee: 'delivery_fee',
      preparationTime: 'preparation_time',
      preparation_time: 'preparation_time',
      metadata: 'metadata',
    };

    const updates: string[] = [];
    const values: any[] = [vendorId];
    const seen = new Set<string>();

    for (const [inputKey, column] of Object.entries(fieldMap)) {
      if (body[inputKey] === undefined || seen.has(column)) continue;
      let value = body[inputKey];
      if (column === 'categories' || column === 'delivery_areas') {
        value = Array.isArray(value) ? value.map(String).filter(Boolean) : [];
      }
      updates.push(`${column} = $${values.length + 1}`);
      values.push(value);
      seen.add(column);
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid vendor fields to update' }, { status: 400, headers: NO_STORE_HEADERS });
    }

    updates.push('updated_at = NOW()');
    const { rows } = await query(
      `UPDATE vendors SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (!rows[0]) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404, headers: NO_STORE_HEADERS });
    }

    invalidateVendorFeedCache();
    const vendor = await getVendorById(vendorId, true);

    return NextResponse.json({
      success: true,
      vendor: vendor || rows[0],
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Vendor profile update failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor profile' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
