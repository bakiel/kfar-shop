import { promises as fs } from 'fs';
import path from 'path';
import { query } from '@/lib/db/postgres-client';

export type ProductFeedSource = 'database' | 'db-cache';

export interface ProductFeedProduct {
  id: string;
  name: string;
  nameHe?: string | null;
  description: string;
  descriptionHe?: string | null;
  price: number;
  originalPrice?: number | null;
  category: string;
  subcategory?: string | null;
  image: string;
  images: string[];
  kashrut?: string | null;
  vegan: boolean;
  organic: boolean;
  glutenFree: boolean;
  sugarFree?: boolean;
  unit: string;
  minimumOrder: number;
  inStock: boolean;
  stockQuantity?: number;
  rating?: number | null;
  reviewCount?: number;
  specifications?: unknown;
  nutritionalInfo?: unknown;
  ingredients?: string[];
  allergens?: string[];
  tags?: string[];
  isFeatured?: boolean;
  badge?: string | null;
  status?: string | null;
  vendorId: string;
  vendorName: string;
  vendorLogo?: string | null;
  vendorSlug?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ProductFeedParams {
  vendorId?: string | null;
  search?: string | null;
  category?: string | null;
  limit?: number | string | null;
  publicOnly?: boolean;
}

export interface ProductFeedResult {
  success: boolean;
  count: number;
  source: ProductFeedSource;
  stale: boolean;
  generatedAt: string;
  cacheAgeMs?: number;
  products: ProductFeedProduct[];
  error?: string;
}

interface FeedSnapshot {
  generatedAt: string;
  products: ProductFeedProduct[];
}

interface TableColumns {
  products: Set<string>;
  vendors: Set<string>;
}

const CACHE_DIR = process.env.KFAR_CACHE_DIR || '/tmp/kfar-marketplace-cache';
const CACHE_FILE = path.join(CACHE_DIR, 'product-feed.json');
const PLACEHOLDER_IMAGE = '/images/placeholder-product.jpg';
const COLUMN_CACHE_TTL_MS = 60_000;
const PRODUCT_FEED_CACHE_TTL_MS = envInt('KFAR_PRODUCT_FEED_CACHE_TTL_MS', 15_000);

let columnCache: { columns: TableColumns; expiresAt: number } | null = null;
let memorySnapshot: FeedSnapshot | null = null;
let feedCache = new Map<string, { expiresAt: number; result: ProductFeedResult }>();
let feedPromises = new Map<string, Promise<ProductFeedResult>>();
let feedCacheGeneration = 0;

function envInt(name: string, fallback: number) {
  const parsed = parseInt(process.env[name] || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const LEGACY_LOGO_PATHS: Record<string, string> = {
  '/images/gahn-delight/gahn_delight_official_logo_master_brand_vegan_ice_cream.jpg': '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',
  '/images/people-store/people_store_official_logo_master_brand_bulk_foods_grocery.jpg': '/images/people-store/peoples_store_official_logo_master_brand_community_market.jpg',
  '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_vegan_gourmet_catering.jpg': '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
  '/images/vop-shop/vop_shop_official_logo_master_brand_community_marketplace.jpg': '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg',
};

function normalizeLogoPath(value?: string | null) {
  return value ? (LEGACY_LOGO_PATHS[value] || value) : null;
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }
  if (typeof value === 'string') {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      // Fall through to simple comma splitting for legacy serialized arrays.
    }
    return value
      .replace(/^{|}$/g, '')
      .split(',')
      .map(item => item.trim().replace(/^"|"$/g, ''))
      .filter(Boolean);
  }
  return [];
}

function normalizeLimit(limit: ProductFeedParams['limit']) {
  if (limit === null || limit === undefined || limit === '') return null;
  const parsed = typeof limit === 'number' ? limit : parseInt(limit, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.min(parsed, 500);
}

function buildFeedCacheKey(params: ProductFeedParams) {
  return JSON.stringify({
    vendorId: params.vendorId || '',
    search: params.search?.trim().toLowerCase() || '',
    category: params.category || '',
    limit: normalizeLimit(params.limit),
    publicOnly: params.publicOnly !== false,
  });
}

function getCachedFeed(cacheKey: string) {
  const cached = feedCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() >= cached.expiresAt) {
    feedCache.delete(cacheKey);
    return null;
  }
  return cached.result;
}

function cacheFeedResult(cacheKey: string, result: ProductFeedResult) {
  if (result.source !== 'database' || result.stale) return;
  feedCache.set(cacheKey, {
    expiresAt: Date.now() + PRODUCT_FEED_CACHE_TTL_MS,
    result,
  });
}

async function getTableColumns(): Promise<TableColumns> {
  if (columnCache && Date.now() < columnCache.expiresAt) {
    return columnCache.columns;
  }

  const { rows } = await query<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])`,
    [['products', 'vendors']]
  );

  const columns: TableColumns = {
    products: new Set(),
    vendors: new Set(),
  };

  for (const row of rows) {
    if (row.table_name === 'products' || row.table_name === 'vendors') {
      columns[row.table_name].add(row.column_name);
    }
  }

  columnCache = {
    columns,
    expiresAt: Date.now() + COLUMN_CACHE_TTL_MS,
  };

  return columns;
}

function pickColumn(columns: Set<string>, alias: string, candidates: string[], fallbackSql: string) {
  const column = candidates.find(candidate => columns.has(candidate));
  return column ? `p.${column} AS ${alias}` : `${fallbackSql} AS ${alias}`;
}

function pickVendorColumn(columns: Set<string>, alias: string, candidates: string[], fallbackSql: string) {
  const column = candidates.find(candidate => columns.has(candidate));
  return column ? `v.${column} AS ${alias}` : `${fallbackSql} AS ${alias}`;
}

function buildSearchClause(columns: TableColumns, paramName: string) {
  const productCandidates = ['name', 'name_he', 'description', 'description_he', 'category', 'tags'];
  const vendorCandidates = ['name', 'business_name', 'name_he', 'description'];
  const clauses = [
    ...productCandidates
      .filter(column => columns.products.has(column))
      .map(column => `p.${column}::text ILIKE ${paramName}`),
    ...vendorCandidates
      .filter(column => columns.vendors.has(column))
      .map(column => `v.${column}::text ILIKE ${paramName}`),
  ];
  return clauses.length ? `(${clauses.join(' OR ')})` : null;
}

function buildProductsQuery(columns: TableColumns, params: ProductFeedParams) {
  const products = columns.products;
  const vendors = columns.vendors;
  const publicOnly = params.publicOnly !== false;
  const sqlParams: unknown[] = [];
  const where: string[] = [];

  const selectColumns = [
    'p.id::text AS id',
    pickColumn(products, 'vendor_id', ['vendor_id'], 'NULL::text'),
    pickColumn(products, 'name', ['name'], "''::text"),
    pickColumn(products, 'name_he', ['name_he', 'nameHebrew'], 'NULL::text'),
    pickColumn(products, 'description', ['description'], "''::text"),
    pickColumn(products, 'description_he', ['description_he'], 'NULL::text'),
    pickColumn(products, 'price', ['price'], '0::numeric'),
    pickColumn(products, 'original_price', ['original_price'], 'NULL::numeric'),
    pickColumn(products, 'category', ['category'], "'other'::text"),
    pickColumn(products, 'subcategory', ['subcategory'], 'NULL::text'),
    pickColumn(products, 'image_url', ['image_url', 'primary_image', 'image_path', 'image'], 'NULL::text'),
    pickColumn(products, 'image_gallery', ['image_gallery', 'images'], 'NULL::text[]'),
    pickColumn(products, 'tags', ['tags'], 'NULL::text[]'),
    pickColumn(products, 'badges', ['badges'], 'NULL::text[]'),
    pickColumn(products, 'badge', ['badge'], 'NULL::text'),
    pickColumn(products, 'kashrut_level', ['kashrut_level'], 'NULL::text'),
    pickColumn(products, 'is_vegan', ['is_vegan'], 'true::boolean'),
    pickColumn(products, 'is_kosher', ['is_kosher'], 'true::boolean'),
    pickColumn(products, 'is_organic', ['is_organic'], 'false::boolean'),
    pickColumn(products, 'is_gluten_free', ['is_gluten_free'], 'false::boolean'),
    pickColumn(products, 'is_featured', ['is_featured', 'featured'], 'false::boolean'),
    pickColumn(products, 'in_stock', ['in_stock'], 'true::boolean'),
    pickColumn(products, 'stock_quantity', ['stock_quantity'], '0::int'),
    pickColumn(products, 'unit', ['unit'], "'unit'::text"),
    pickColumn(products, 'nutritional_info', ['nutritional_info'], 'NULL::jsonb'),
    pickColumn(products, 'ingredients', ['ingredients'], 'NULL::text[]'),
    pickColumn(products, 'allergens', ['allergens'], 'NULL::text[]'),
    pickColumn(products, 'specifications', ['specifications'], 'NULL::jsonb'),
    pickColumn(products, 'rating', ['rating'], 'NULL::numeric'),
    pickColumn(products, 'review_count', ['review_count'], '0::int'),
    pickColumn(products, 'status', ['status'], "'published'::text"),
    pickColumn(products, 'created_at', ['created_at'], 'NULL::timestamp'),
    pickColumn(products, 'updated_at', ['updated_at'], 'NULL::timestamp'),
    pickVendorColumn(vendors, 'vendor_name', ['name', 'business_name'], 'NULL::text'),
    pickVendorColumn(vendors, 'vendor_slug', ['slug'], 'NULL::text'),
    pickVendorColumn(vendors, 'vendor_logo', ['logo_url', 'logo_path'], 'NULL::text'),
  ];

  if (publicOnly) {
    if (products.has('status')) {
      where.push(`COALESCE(p.status, 'published') IN ('published', 'active')`);
    }
    if (products.has('in_stock')) {
      where.push('COALESCE(p.in_stock, true) = true');
    }
    if (vendors.has('is_active')) {
      where.push('COALESCE(v.is_active, true) = true');
    }
    if (vendors.has('status')) {
      where.push(`COALESCE(v.status, 'active') IN ('active', 'published', 'approved')`);
    }
  }

  if (params.vendorId) {
    sqlParams.push(params.vendorId);
    where.push(`p.vendor_id = $${sqlParams.length}`);
  }

  if (params.category) {
    sqlParams.push(params.category);
    where.push(`p.category = $${sqlParams.length}`);
  }

  const search = params.search?.trim();
  if (search && search.length >= 2) {
    sqlParams.push(`%${search}%`);
    const clause = buildSearchClause(columns, `$${sqlParams.length}`);
    if (clause) where.push(clause);
  }

  const limit = normalizeLimit(params.limit);
  const orderParts = [
    products.has('is_featured') ? 'COALESCE(p.is_featured, false) DESC' : null,
    products.has('updated_at') ? 'p.updated_at DESC NULLS LAST' : null,
    products.has('created_at') ? 'p.created_at DESC NULLS LAST' : null,
    'p.name ASC',
  ].filter(Boolean);

  let sql = `
    SELECT ${selectColumns.join(',\n           ')}
    FROM products p
    LEFT JOIN vendors v ON p.vendor_id = v.id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY ${orderParts.join(', ')}
  `;

  if (limit) {
    sqlParams.push(limit);
    sql += ` LIMIT $${sqlParams.length}`;
  }

  return { sql, params: sqlParams };
}

function normalizeProduct(row: any): ProductFeedProduct {
  const images = toStringArray(row.image_gallery);
  const image = row.image_url || images[0] || PLACEHOLDER_IMAGE;
  const badges = toStringArray(row.badges);
  const badge = row.badge || badges[0] || null;
  const isKosher = row.is_kosher === true || Boolean(row.kashrut_level);

  return {
    id: String(row.id),
    name: row.name || '',
    nameHe: row.name_he || null,
    description: row.description || '',
    descriptionHe: row.description_he || null,
    price: toNumber(row.price),
    originalPrice: row.original_price === null || row.original_price === undefined
      ? null
      : toNumber(row.original_price),
    category: row.category || 'other',
    subcategory: row.subcategory || null,
    image,
    images,
    kashrut: isKosher ? (row.kashrut_level || 'Kosher') : null,
    vegan: row.is_vegan !== false,
    organic: row.is_organic === true,
    glutenFree: row.is_gluten_free === true,
    unit: row.unit || 'unit',
    minimumOrder: 1,
    inStock: row.in_stock !== false,
    stockQuantity: Number.isFinite(parseInt(row.stock_quantity, 10)) ? parseInt(row.stock_quantity, 10) : 0,
    rating: row.rating === null || row.rating === undefined ? null : toNumber(row.rating),
    reviewCount: Number.isFinite(parseInt(row.review_count, 10)) ? parseInt(row.review_count, 10) : 0,
    specifications: row.specifications || [],
    nutritionalInfo: row.nutritional_info || null,
    ingredients: toStringArray(row.ingredients),
    allergens: toStringArray(row.allergens),
    tags: toStringArray(row.tags),
    isFeatured: row.is_featured === true,
    badge,
    status: row.status || null,
    vendorId: row.vendor_id || '',
    vendorName: row.vendor_name || row.vendor_id || 'KFAR Vendor',
    vendorLogo: normalizeLogoPath(row.vendor_logo),
    vendorSlug: row.vendor_slug || null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

async function writeSnapshot(products: ProductFeedProduct[]) {
  const snapshot: FeedSnapshot = {
    generatedAt: new Date().toISOString(),
    products,
  };
  memorySnapshot = snapshot;

  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const tmpFile = `${CACHE_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmpFile, JSON.stringify(snapshot), 'utf8');
    await fs.rename(tmpFile, CACHE_FILE);
  } catch (error) {
    console.warn('[product-feed] failed to write DB snapshot cache:', (error as Error).message);
  }
}

async function readSnapshot(): Promise<FeedSnapshot | null> {
  if (memorySnapshot) return memorySnapshot;

  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as FeedSnapshot;
    if (Array.isArray(parsed.products)) {
      memorySnapshot = parsed;
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

function filterCachedProducts(products: ProductFeedProduct[], params: ProductFeedParams) {
  const search = params.search?.trim().toLowerCase();
  let filtered = products;

  if (params.vendorId) {
    filtered = filtered.filter(product => product.vendorId === params.vendorId);
  }

  if (params.category) {
    filtered = filtered.filter(product => product.category === params.category);
  }

  if (search && search.length >= 2) {
    filtered = filtered.filter(product => {
      const haystack = [
        product.name,
        product.nameHe,
        product.description,
        product.descriptionHe,
        product.category,
        product.vendorName,
        ...(product.tags || []),
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(search);
    });
  }

  const limit = normalizeLimit(params.limit);
  return limit ? filtered.slice(0, limit) : filtered;
}

function shouldRefreshFullSnapshot(params: ProductFeedParams) {
  return !params.vendorId && !params.search && !params.category && !params.limit && params.publicOnly !== false;
}

async function loadProductFeed(params: ProductFeedParams = {}): Promise<ProductFeedResult> {
  const generatedAt = new Date().toISOString();

  try {
    const columns = await getTableColumns();
    const { sql, params: sqlParams } = buildProductsQuery(columns, params);
    const { rows } = await query(sql, sqlParams);
    const products = rows.map(normalizeProduct).filter(product => product.id && product.name);

    if (shouldRefreshFullSnapshot(params)) {
      await writeSnapshot(products);
    }

    return {
      success: true,
      count: products.length,
      source: 'database',
      stale: false,
      generatedAt,
      products,
    };
  } catch (error) {
    const snapshot = await readSnapshot();
    if (snapshot) {
      const products = filterCachedProducts(snapshot.products, params);
      return {
        success: true,
        count: products.length,
        source: 'db-cache',
        stale: true,
        generatedAt,
        cacheAgeMs: Date.now() - new Date(snapshot.generatedAt).getTime(),
        products,
        error: (error as Error).message,
      };
    }

    return {
      success: false,
      count: 0,
      source: 'db-cache',
      stale: true,
      generatedAt,
      products: [],
      error: (error as Error).message,
    };
  }
}

export async function getProductFeed(params: ProductFeedParams = {}): Promise<ProductFeedResult> {
  const cacheKey = buildFeedCacheKey(params);
  const cached = getCachedFeed(cacheKey);
  if (cached) return cached;

  const existingPromise = feedPromises.get(cacheKey);
  if (existingPromise) return existingPromise;

  const generation = feedCacheGeneration;
  const promise = loadProductFeed(params)
    .then(result => {
      if (generation === feedCacheGeneration) {
        cacheFeedResult(cacheKey, result);
      }
      return result;
    })
    .finally(() => {
      feedPromises.delete(cacheKey);
    });

  feedPromises.set(cacheKey, promise);
  return promise;
}

export async function getProductById(productId: string, publicOnly = true): Promise<ProductFeedProduct | null> {
  const feed = await getProductFeed({ publicOnly });
  return feed.products.find(product =>
    product.id === productId ||
    product.id.toLowerCase() === productId.toLowerCase()
  ) || null;
}

export function invalidateProductFeedCache() {
  feedCacheGeneration++;
  memorySnapshot = null;
  feedCache.clear();
  feedPromises.clear();
}
