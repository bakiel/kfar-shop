import { isDbAvailable, query } from './postgres-client';

export interface BundleTableSchema {
  columns: string[];
  hasProducts: boolean;
  hasProductIds: boolean;
  hasPrice: boolean;
  hasBundlePrice: boolean;
  hasStatus: boolean;
  hasIsActive: boolean;
  hasImage: boolean;
  hasIsPromoted: boolean;
  hasIsFeatured: boolean;
  hasCreatedAt: boolean;
  hasUpdatedAt: boolean;
  hasNameHe: boolean;
  hasDescription: boolean;
  hasDescriptionHe: boolean;
  hasOriginalPrice: boolean;
  hasSavingsPercent: boolean;
  hasVendorId: boolean;
  hasLoyaltyPointsBonus: boolean;
}

const BUNDLE_SCHEMA_TTL_MS = 300_000;

let cachedBundleSchema: BundleTableSchema | null = null;
let cachedBundleSchemaAt = 0;
let cachedBundleSchemaPromise: Promise<BundleTableSchema | null> | null = null;

function buildBundleTableSchema(columns: string[]): BundleTableSchema {
  const columnSet = new Set(columns);
  const has = (name: string) => columnSet.has(name);

  return {
    columns,
    hasProducts: has('products'),
    hasProductIds: has('product_ids'),
    hasPrice: has('price'),
    hasBundlePrice: has('bundle_price'),
    hasStatus: has('status'),
    hasIsActive: has('is_active'),
    hasImage: has('image'),
    hasIsPromoted: has('is_promoted'),
    hasIsFeatured: has('is_featured'),
    hasCreatedAt: has('created_at'),
    hasUpdatedAt: has('updated_at'),
    hasNameHe: has('name_he'),
    hasDescription: has('description'),
    hasDescriptionHe: has('description_he'),
    hasOriginalPrice: has('original_price'),
    hasSavingsPercent: has('savings_percent'),
    hasVendorId: has('vendor_id'),
    hasLoyaltyPointsBonus: has('loyalty_points_bonus'),
  };
}

export async function getBundleTableSchema(): Promise<BundleTableSchema | null> {
  if (cachedBundleSchema && Date.now() - cachedBundleSchemaAt < BUNDLE_SCHEMA_TTL_MS) {
    return cachedBundleSchema;
  }

  if (cachedBundleSchemaPromise) {
    return cachedBundleSchemaPromise;
  }

  cachedBundleSchemaPromise = (async () => {
    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return null;
    }

    try {
      const { rows } = await query<{ column_name: string }>(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'bundles'
         ORDER BY ordinal_position`
      );

      const schema = buildBundleTableSchema(rows.map((row) => row.column_name));
      cachedBundleSchema = schema;
      cachedBundleSchemaAt = Date.now();
      return schema;
    } catch (error) {
      console.log('Bundle schema lookup failed:', (error as Error).message);
      cachedBundleSchemaAt = Date.now();
      return cachedBundleSchema;
    } finally {
      cachedBundleSchemaPromise = null;
    }
  })();

  return cachedBundleSchemaPromise;
}

export function parseBundleProductIds(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item)).filter(Boolean);
      }
    } catch {
      return value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

export function getBundleRecordProductIds(row: Record<string, any>): string[] {
  return parseBundleProductIds(row.products ?? row.product_ids);
}

export function getBundleRecordPrice(row: Record<string, any>): number {
  const value = row.price ?? row.bundle_price;
  return Number(value) || 0;
}

export function getBundleRecordOriginalPrice(row: Record<string, any>): number {
  const price = getBundleRecordPrice(row);
  const value = row.original_price ?? price;
  return Number(value) || price;
}

export function getBundleSavingsPercent(originalPrice: number, bundlePrice: number): number {
  if (!(originalPrice > 0) || !(originalPrice > bundlePrice)) {
    return 0;
  }

  return Math.round(((originalPrice - bundlePrice) / originalPrice) * 100);
}

export function getBundleRecordStatus(row: Record<string, any>): 'active' | 'draft' {
  if (typeof row.status === 'string') {
    return row.status === 'active' ? 'active' : 'draft';
  }

  return row.is_active ? 'active' : 'draft';
}

export function isBundleRecordActive(row: Record<string, any>): boolean {
  return getBundleRecordStatus(row) === 'active';
}

export function getBundleRecordImage(row: Record<string, any>): string {
  const value = row.image ?? row.image_url ?? '';
  return typeof value === 'string' ? value : '';
}

export function getBundleRecordTimestamp(row: Record<string, any>): number {
  const value = row.updated_at ?? row.created_at ?? row.updatedAt ?? row.createdAt;
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function sortBundleRecords<T extends Record<string, any>>(rows: T[]): T[] {
  return [...rows].sort((left, right) => {
    const promotionDiff = Number(!!right.is_promoted) - Number(!!left.is_promoted);
    if (promotionDiff !== 0) {
      return promotionDiff;
    }

    const featuredDiff = Number(!!right.is_featured) - Number(!!left.is_featured);
    if (featuredDiff !== 0) {
      return featuredDiff;
    }

    return getBundleRecordTimestamp(right) - getBundleRecordTimestamp(left);
  });
}

export function normalizeBundleRecord(row: Record<string, any>) {
  const price = getBundleRecordPrice(row);
  const originalPrice = getBundleRecordOriginalPrice(row);

  return {
    ...row,
    nameHe: row.nameHe ?? row.name_he ?? '',
    description: row.description ?? '',
    descriptionHe: row.descriptionHe ?? row.description_he ?? '',
    products: getBundleRecordProductIds(row),
    price,
    originalPrice,
    status: getBundleRecordStatus(row),
    image: getBundleRecordImage(row),
    isPromoted: !!(row.isPromoted ?? row.is_promoted),
    isFeatured: !!(row.isFeatured ?? row.is_featured),
    savingsPercent: row.savings_percent != null
      ? Number(row.savings_percent) || 0
      : getBundleSavingsPercent(originalPrice, price),
    vendorId: row.vendorId ?? row.vendor_id,
    loyaltyPointsBonus: Number(row.loyaltyPointsBonus ?? row.loyalty_points_bonus) || 0,
  };
}
