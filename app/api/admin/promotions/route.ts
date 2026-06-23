import { NextRequest, NextResponse } from 'next/server';
import { query, isDbAvailable } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      // fall through to comma split
    }
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePromotion(row: any) {
  const status = row.status === 'pending' ? 'pending_approval' : (row.status || (row.is_active ? 'active' : 'pending_approval'));
  const productImage = row.product_image || row.image_url || row.banner_image || row.image || '/images/placeholder-product.jpg';
  const originalPrice = asNumber(row.original_price ?? row.originalPrice ?? row.price ?? row.discount_value, 0);
  const salePrice = row.sale_price ?? row.salePrice ?? row.discounted_price;

  return {
    ...row,
    id: String(row.id),
    vendorId: row.vendor_id || row.vendorId || '',
    vendorName: row.vendor_name || row.business_name || row.vendor_id || 'Marketplace',
    productName: row.product_name || row.product_id || row.title || 'Promotion',
    productImage,
    originalPrice,
    salePrice: salePrice === undefined || salePrice === null ? undefined : asNumber(salePrice),
    promotionType: row.promotion_type || row.type || 'vendor_special',
    title: row.title || 'Promotion',
    description: row.description || '',
    startDate: row.start_date || row.starts_at || row.created_at || new Date().toISOString(),
    endDate: row.end_date || row.ends_at || row.expires_at || row.created_at || new Date().toISOString(),
    stock: row.stock_quantity ?? row.stock,
    targetAudience: asArray(row.target_audience || row.targetAudience),
    budget: row.budget === undefined || row.budget === null ? undefined : asNumber(row.budget),
    status,
    submittedAt: row.submitted_at || row.created_at || new Date().toISOString(),
    priority: asNumber(row.priority, 5),
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';

    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json(
        { error: 'Database unavailable', promotions: [], total: 0 },
        { status: 503 }
      );
    }

    try {
      const { rows: columnRows } = await query<{ column_name: string }>(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'promotions'`,
        []
      );
      const columns = new Set(columnRows.map(row => row.column_name));
      if (columns.size === 0) {
        return NextResponse.json({ success: true, promotions: [], total: 0 });
      }

      let sql = 'SELECT p.*';
      if (columns.has('vendor_id')) {
        sql += ', v.name AS vendor_name';
      }
      if (columns.has('product_id')) {
        sql += ', pr.name AS product_name, pr.image_url AS product_image, pr.price AS price';
      }
      sql += ' FROM promotions p';
      if (columns.has('vendor_id')) {
        sql += ' LEFT JOIN vendors v ON v.id::text = p.vendor_id::text';
      }
      if (columns.has('product_id')) {
        sql += ' LEFT JOIN products pr ON pr.id::text = p.product_id::text';
      }
      const params: any[] = [];

      if (status !== 'all' && columns.has('status')) {
        const statuses = status === 'pending_approval' ? ['pending_approval', 'pending'] : [status];
        sql += ' WHERE p.status = ANY($1::text[])';
        params.push(statuses);
      }

      sql += columns.has('created_at') ? ' ORDER BY p.created_at DESC' : ' ORDER BY p.id DESC';

      const { rows } = await query(sql, params);
      const promotions = rows.map(normalizePromotion);

      return NextResponse.json({
        success: true,
        promotions,
        total: promotions.length,
      });
    } catch (err: any) {
      // Handle case where promotions table does not exist yet
      if (err?.message?.includes('does not exist') || err?.code === '42P01') {
        return NextResponse.json({
          promotions: [],
          total: 0,
        });
      }
      console.error('Promotions DB query failed:', err);
      return NextResponse.json(
        { error: 'Database unavailable', promotions: [], total: 0 },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}
