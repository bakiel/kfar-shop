import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePromotion(row: any) {
  const conditions = row.conditions && typeof row.conditions === 'object' ? row.conditions : {};
  const status = row.status || (row.is_active ? 'approved' : 'pending_approval');

  return {
    id: String(row.id),
    vendorId: row.vendor_id,
    productId: conditions.productId || asArray(row.product_ids)[0] || '',
    productName: conditions.productName || row.badge_text || row.title || 'Promotion',
    productImage: row.image || '/images/placeholder-product.jpg',
    originalPrice: asNumber(conditions.originalPrice),
    salePrice: conditions.salePrice === undefined || conditions.salePrice === null ? undefined : asNumber(conditions.salePrice),
    promotionType: row.type || 'vendor_special',
    title: row.title || 'Promotion',
    description: row.description || '',
    startDate: row.start_date,
    endDate: row.end_date,
    stock: conditions.stock,
    targetAudience: asArray(conditions.targetAudience),
    budget: conditions.budget,
    status,
    isActive: row.is_active === true,
    submittedAt: row.created_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json({ success: false, error: 'Vendor access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const params: any[] = [user.vendorId];
    let sql = 'SELECT * FROM promotions WHERE vendor_id = $1';

    if (status !== 'all') {
      params.push(status === 'pending' ? ['pending', 'pending_approval'] : [status]);
      sql += ` AND status = ANY($${params.length}::text[])`;
    }

    sql += ' ORDER BY created_at DESC';

    const { rows } = await query(sql, params);
    const promotions = rows.map(normalizePromotion);

    return NextResponse.json({
      success: true,
      promotions,
      stats: {
        total: promotions.length,
        active: promotions.filter((promotion: any) => promotion.isActive || promotion.status === 'approved').length,
        pending: promotions.filter((promotion: any) => ['pending', 'pending_approval'].includes(promotion.status)).length,
        rejected: promotions.filter((promotion: any) => promotion.status === 'rejected').length,
      },
    });
  } catch (error) {
    console.error('Vendor promotions fetch error:', error);
    return NextResponse.json(
      { success: false, promotions: [], stats: { total: 0, active: 0, pending: 0, rejected: 0 }, error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}
