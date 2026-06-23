import { NextRequest, NextResponse } from 'next/server';
import { getVendorById, invalidateVendorFeedCache } from '@/lib/services/live-vendor-feed';
import { query } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { invalidateProductFeedCache } from '@/lib/services/live-product-feed';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const vendor = await getVendorById(vendorId, true);

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  return NextResponse.json(vendor, { headers: NO_STORE_HEADERS });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const user = token ? verifyAccessToken(token) : null;

  if (!user || (user.role !== 'admin' && user.vendorId !== vendorId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const body = await request.json();

  const { rows: columnRows } = await query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'vendors'`
  );
  const columns = new Set(columnRows.map(row => row.column_name));

  const updateFields: string[] = [];
  const values: any[] = [vendorId];
  const seen = new Set<string>();
  let hasWritableField = false;

  const addUpdate = (column: string, value: unknown) => {
    if (value === undefined || seen.has(column) || !columns.has(column)) return;
    values.push(value);
    updateFields.push(`${column} = $${values.length}`);
    seen.add(column);
    hasWritableField = true;
  };

  addUpdate('name', body.name);
  addUpdate('business_name', body.name);
  addUpdate('description', body.description);
  addUpdate('category', body.category || body.metadata?.specialty);
  addUpdate('address', body.metadata?.location || body.address);

  if (columns.has('metadata') && body.metadata !== undefined) {
    const { rows } = await query<{ metadata: Record<string, any> | null }>(
      'SELECT metadata FROM vendors WHERE id = $1',
      [vendorId]
    );
    const currentMetadata = rows[0]?.metadata && typeof rows[0].metadata === 'object' ? rows[0].metadata : {};
    addUpdate('metadata', { ...currentMetadata, ...body.metadata });
  }

  if (columns.has('updated_at')) {
    updateFields.push('updated_at = NOW()');
  }

  if (hasWritableField) {
    await query(
      `UPDATE vendors
       SET ${updateFields.join(', ')}
       WHERE id = $1`,
      values
    );
    invalidateProductFeedCache();
    invalidateVendorFeedCache();
  }

  const vendor = await getVendorById(vendorId, true);
  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  return NextResponse.json(vendor, { headers: NO_STORE_HEADERS });
}
