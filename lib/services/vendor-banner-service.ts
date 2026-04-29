import { query } from '@/lib/db/postgres-client';

export interface VendorBannerContent {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
  startDate?: string;
  endDate?: string;
  discount?: number;
  eventDate?: string;
  eventLocation?: string;
}

export interface VendorBannerInput {
  template: string;
  content: VendorBannerContent;
  isActive?: boolean;
  orderPosition?: number;
  startDate?: string | null;
  endDate?: string | null;
}

const VALID_TEMPLATES = new Set(['sale', 'announcement', 'product_highlight', 'product', 'event', 'seasonal', 'custom']);

export async function ensureVendorBannersTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS vendor_banners (
      id VARCHAR(80) PRIMARY KEY,
      vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      template VARCHAR(50) NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      content JSONB NOT NULL DEFAULT '{}',
      is_active BOOLEAN NOT NULL DEFAULT true,
      order_position INTEGER NOT NULL DEFAULT 0,
      views INTEGER NOT NULL DEFAULT 0,
      clicks INTEGER NOT NULL DEFAULT 0,
      conversions INTEGER NOT NULL DEFAULT 0,
      start_date TIMESTAMPTZ,
      end_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query('CREATE INDEX IF NOT EXISTS idx_vendor_banners_vendor ON vendor_banners(vendor_id)');
  await query('CREATE INDEX IF NOT EXISTS idx_vendor_banners_active ON vendor_banners(vendor_id, is_active, order_position)');
}

function asObject(value: unknown): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, any>;
}

function asIso(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function bannerId() {
  return `banner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeVendorBanner(row: any) {
  const content = asObject(row.content);
  const template = row.template === 'product' ? 'product_highlight' : (row.template || 'custom');

  return {
    id: String(row.id),
    vendorId: row.vendor_id,
    template,
    isActive: row.is_active !== false,
    content: {
      title: content.title ?? row.title ?? '',
      subtitle: content.subtitle ?? row.subtitle ?? '',
      description: content.description ?? '',
      ctaText: content.ctaText ?? 'Shop Now',
      ctaLink: content.ctaLink ?? `/store/${row.vendor_id}`,
      image: content.image ?? '',
      backgroundColor: content.backgroundColor ?? '#478c0b',
      textColor: content.textColor ?? '#ffffff',
      startDate: content.startDate ?? asIso(row.start_date),
      endDate: content.endDate ?? asIso(row.end_date),
      discount: Number(content.discount) || 0,
      eventDate: content.eventDate ?? '',
      eventLocation: content.eventLocation ?? '',
    },
    analytics: {
      views: Number(row.views) || 0,
      clicks: Number(row.clicks) || 0,
      conversions: Number(row.conversions) || 0,
    },
    createdAt: asIso(row.created_at),
    updatedAt: asIso(row.updated_at),
  };
}

export function validateVendorBanner(input: VendorBannerInput) {
  const template = input.template || 'custom';
  if (!VALID_TEMPLATES.has(template)) {
    return { valid: false, error: 'Invalid banner template' };
  }

  const title = input.content?.title?.trim();
  if (!title) {
    return { valid: false, error: 'Banner title is required' };
  }

  return { valid: true, error: null };
}

export async function listVendorBanners(vendorId: string, activeOnly = false) {
  await ensureVendorBannersTable();
  const params: any[] = [vendorId];
  let sql = 'SELECT * FROM vendor_banners WHERE vendor_id = $1';

  if (activeOnly) {
    sql += ' AND is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW())';
  }

  sql += ' ORDER BY order_position ASC, created_at DESC';
  const { rows } = await query(sql, params);
  return rows.map(normalizeVendorBanner);
}

export async function createVendorBanner(vendorId: string, input: VendorBannerInput) {
  await ensureVendorBannersTable();
  const content = input.content || {};
  const startDate = input.startDate ?? content.startDate ?? null;
  const endDate = input.endDate ?? content.endDate ?? null;

  const { rows } = await query(
    `INSERT INTO vendor_banners (
       id, vendor_id, template, title, subtitle, content, is_active,
       order_position, start_date, end_date, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
     RETURNING *`,
    [
      bannerId(),
      vendorId,
      input.template,
      content.title?.trim(),
      content.subtitle?.trim() || null,
      content,
      input.isActive !== false,
      input.orderPosition ?? 0,
      startDate || null,
      endDate || null,
    ]
  );

  return normalizeVendorBanner(rows[0]);
}

export async function updateVendorBanner(vendorId: string, bannerIdValue: string, input: Partial<VendorBannerInput>) {
  await ensureVendorBannersTable();

  const { rows: existing } = await query(
    'SELECT * FROM vendor_banners WHERE id = $1 AND vendor_id = $2',
    [bannerIdValue, vendorId]
  );
  if (!existing[0]) return null;

  const currentContent = normalizeVendorBanner(existing[0]).content;
  const nextContent = { ...currentContent, ...(input.content || {}) };
  const template = input.template || existing[0].template || 'custom';
  const isActive = input.isActive ?? existing[0].is_active;
  const orderPosition = input.orderPosition ?? existing[0].order_position ?? 0;
  const startDate = input.startDate ?? nextContent.startDate ?? null;
  const endDate = input.endDate ?? nextContent.endDate ?? null;

  const validation = validateVendorBanner({ template, content: nextContent, isActive, orderPosition, startDate, endDate });
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid banner');
  }

  const { rows } = await query(
    `UPDATE vendor_banners
     SET template = $3,
         title = $4,
         subtitle = $5,
         content = $6,
         is_active = $7,
         order_position = $8,
         start_date = $9,
         end_date = $10,
         updated_at = NOW()
     WHERE id = $1 AND vendor_id = $2
     RETURNING *`,
    [
      bannerIdValue,
      vendorId,
      template,
      nextContent.title?.trim(),
      nextContent.subtitle?.trim() || null,
      nextContent,
      isActive,
      orderPosition,
      startDate || null,
      endDate || null,
    ]
  );

  return rows[0] ? normalizeVendorBanner(rows[0]) : null;
}

export async function setVendorBannerActive(vendorId: string, bannerIdValue: string, isActive: boolean) {
  await ensureVendorBannersTable();
  const { rows } = await query(
    `UPDATE vendor_banners
     SET is_active = $3, updated_at = NOW()
     WHERE id = $1 AND vendor_id = $2
     RETURNING *`,
    [bannerIdValue, vendorId, isActive]
  );

  return rows[0] ? normalizeVendorBanner(rows[0]) : null;
}

export async function deleteVendorBanner(vendorId: string, bannerIdValue: string) {
  await ensureVendorBannersTable();
  const { rowCount } = await query(
    'DELETE FROM vendor_banners WHERE id = $1 AND vendor_id = $2',
    [bannerIdValue, vendorId]
  );

  return rowCount > 0;
}
