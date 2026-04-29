import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

type PromotionType = 'flash_sale' | 'vendor_special' | 'new_arrival' | 'limited_stock' | 'bundle_deal';

const VALID_TYPES = new Set<PromotionType>(['flash_sale', 'vendor_special', 'new_arrival', 'limited_stock', 'bundle_deal']);

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

function promotionId() {
  return `promo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function discountPercent(originalPrice: number, salePrice?: number) {
  if (!salePrice || !originalPrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

function normalizeDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function truncate(value: unknown, maxLength: number) {
  return String(value || '').slice(0, maxLength);
}

function normalizePromotion(row: any) {
  const conditions = row.conditions && typeof row.conditions === 'object' ? row.conditions : {};
  return {
    id: String(row.id),
    vendorId: row.vendor_id,
    productId: conditions.productId || '',
    productName: conditions.productName || row.badge_text || row.title,
    productImage: row.image || '/images/placeholder-product.jpg',
    originalPrice: asNumber(conditions.originalPrice),
    salePrice: conditions.salePrice === undefined ? undefined : asNumber(conditions.salePrice),
    promotionType: row.type || 'vendor_special',
    title: row.title || 'Promotion',
    description: row.description || '',
    startDate: row.start_date,
    endDate: row.end_date,
    stock: conditions.stock,
    targetAudience: asArray(conditions.targetAudience),
    budget: conditions.budget,
    status: row.status || 'pending_approval',
    isActive: row.is_active === true,
    submittedAt: row.created_at,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json({ success: false, error: 'Vendor access required' }, { status: 403 });
    }

    const body = await request.json();
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const type = VALID_TYPES.has(body.promotionType) ? body.promotionType : 'vendor_special';
    const startDate = normalizeDate(body.startDate);
    const endDate = normalizeDate(body.endDate);
    const originalPrice = asNumber(body.originalPrice);
    const salePrice = body.salePrice === undefined ? undefined : asNumber(body.salePrice);

    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Title, description, start date, and end date are required' },
        { status: 400 }
      );
    }

    if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const productIds = body.productId ? [String(body.productId)] : [];
    const conditions = {
      productId: body.productId || null,
      productName: body.productName || null,
      originalPrice,
      salePrice: salePrice ?? null,
      stock: body.stock ?? null,
      targetAudience: asArray(body.targetAudience),
      budget: body.budget ?? null,
    };

    const { rows } = await query(
      `INSERT INTO promotions (
         id, title, description, type, discount_percent, start_date, end_date,
         is_active, vendor_id, product_ids, image, badge_text, created_at,
         conditions, status, created_by
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         false, $8, $9, $10, $11, NOW(),
         $12, 'pending_approval', $13
       )
       RETURNING *`,
      [
        promotionId(),
        title,
        description,
        type,
        discountPercent(originalPrice, salePrice),
        startDate,
        endDate,
        user.vendorId,
        JSON.stringify(productIds),
        body.productImage || null,
        truncate(body.productName || title, 50),
        conditions,
        user.id,
      ]
    );

    return NextResponse.json(
      { success: true, promotion: normalizePromotion(rows[0]), message: 'Promotion submitted for admin approval' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Vendor promotion submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit promotion' },
      { status: 500 }
    );
  }
}
