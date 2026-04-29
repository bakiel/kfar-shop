import { query } from '@/lib/db/postgres-client';
import { getProductFeed, ProductFeedProduct } from '@/lib/services/live-product-feed';

export interface LiveVendor {
  id: string;
  name: string;
  nameHe?: string | null;
  slug?: string | null;
  description?: string | null;
  descriptionHe?: string | null;
  logo: string;
  banner: string;
  category?: string | null;
  categories: string[];
  status?: string | null;
  featured: boolean;
  verified: boolean;
  rating: number;
  totalReviews: number;
  productCount: number;
  products?: ProductFeedProduct[];
  metadata: Record<string, any>;
  source: 'database' | 'db-cache';
}

export interface VendorFeedResult {
  success: boolean;
  source: 'database' | 'db-cache';
  stale: boolean;
  count: number;
  vendors: LiveVendor[];
  error?: string;
}

const VENDOR_FEED_CACHE_TTL_MS = envInt('KFAR_VENDOR_FEED_CACHE_TTL_MS', 15_000);

let vendorFeedCache = new Map<string, { expiresAt: number; result: VendorFeedResult }>();
let vendorFeedPromises = new Map<string, Promise<VendorFeedResult>>();
let vendorFeedCacheGeneration = 0;

function envInt(name: string, fallback: number) {
  const parsed = parseInt(process.env[name] || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildVendorFeedCacheKey(options: {
  vendorId?: string | null;
  includeProducts?: boolean;
  productLimit?: number | null;
}) {
  return JSON.stringify({
    vendorId: options.vendorId || '',
    includeProducts: options.includeProducts === true,
    productLimit: options.productLimit || null,
  });
}

function getCachedVendorFeed(cacheKey: string) {
  const cached = vendorFeedCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() >= cached.expiresAt) {
    vendorFeedCache.delete(cacheKey);
    return null;
  }
  return cached.result;
}

function cacheVendorFeedResult(cacheKey: string, result: VendorFeedResult) {
  if (result.source !== 'database' || result.stale) return;
  vendorFeedCache.set(cacheKey, {
    expiresAt: Date.now() + VENDOR_FEED_CACHE_TTL_MS,
    result,
  });
}

function parseObject(value: unknown): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, any>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string' && value) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

const LEGACY_LOGO_PATHS: Record<string, string> = {
  '/images/gahn-delight/gahn_delight_official_logo_master_brand_vegan_ice_cream.jpg': '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',
  '/images/people-store/people_store_official_logo_master_brand_bulk_foods_grocery.jpg': '/images/people-store/peoples_store_official_logo_master_brand_community_market.jpg',
  '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_vegan_gourmet_catering.jpg': '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
  '/images/vop-shop/vop_shop_official_logo_master_brand_community_marketplace.jpg': '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg',
};

const VENDOR_LOGO_FALLBACKS: Record<string, string> = {
  'teva-deli': '/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg',
  'garden-of-light': '/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg',
  'queens-cuisine': '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
  'gahn-delight': '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',
  'people-store': '/images/people-store/peoples_store_official_logo_master_brand_community_market.jpg',
  'vop-shop': '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg',
};

function normalizeLogoPath(vendorId: string, value?: string | null, productLogo?: string | null) {
  const candidate = value || productLogo || VENDOR_LOGO_FALLBACKS[vendorId] || '/images/placeholder-logo.jpg';
  return LEGACY_LOGO_PATHS[candidate] || candidate;
}

function normalizeVendor(row: any, products: ProductFeedProduct[] = [], source: LiveVendor['source'] = 'database'): LiveVendor {
  const metadata = parseObject(row.metadata);
  const categories = [
    ...toArray(row.categories),
    ...toArray(row.subcategories),
    ...toArray(metadata.categories),
    ...(metadata.specialty ? [String(metadata.specialty)] : []),
    ...(row.category ? [String(row.category)] : []),
  ].filter((value, index, all) => value && all.indexOf(value) === index);

  return {
    id: row.id,
    name: row.name || row.business_name || row.id,
    nameHe: row.name_he || null,
    slug: row.slug || row.id,
    description: row.description || null,
    descriptionHe: row.description_he || null,
    logo: normalizeLogoPath(row.id, row.logo_url || row.logo_path || row.logo, products[0]?.vendorLogo),
    banner: row.banner_url || row.banner || '/images/default-store-banner.svg',
    category: row.category || categories[0] || null,
    categories: categories.length > 0 ? categories : ['general'],
    status: row.status || null,
    featured: row.featured === true || row.is_featured === true,
    verified: row.verified === true,
    rating: toNumber(row.rating, 4.5),
    totalReviews: Number.isFinite(parseInt(row.total_reviews, 10)) ? parseInt(row.total_reviews, 10) : 0,
    productCount: Number.isFinite(parseInt(row.product_count, 10)) ? parseInt(row.product_count, 10) : products.length,
    products,
    metadata: {
      ...metadata,
      location: row.address || metadata.location || 'Dimona, Israel',
      businessHours: row.business_hours || metadata.businessHours,
      deliveryOptions: row.delivery_options || metadata.deliveryOptions,
      minimumOrder: row.minimum_order ?? metadata.minimumOrder,
      deliveryFee: row.delivery_fee ?? metadata.deliveryFee,
      preparationTime: row.preparation_time || metadata.preparationTime,
      established: metadata.established || (row.created_at ? new Date(row.created_at).getFullYear().toString() : undefined),
    },
    source,
  };
}

function vendorsFromProducts(products: ProductFeedProduct[]): LiveVendor[] {
  const grouped = new Map<string, ProductFeedProduct[]>();
  for (const product of products) {
    if (!product.vendorId) continue;
    const group = grouped.get(product.vendorId) || [];
    group.push(product);
    grouped.set(product.vendorId, group);
  }

  return Array.from(grouped.entries()).map(([vendorId, vendorProducts]) => normalizeVendor({
    id: vendorId,
    name: vendorProducts[0]?.vendorName || vendorId,
    slug: vendorId,
    logo_url: vendorProducts[0]?.vendorLogo || null,
    status: 'active',
    product_count: vendorProducts.length,
  }, vendorProducts, 'db-cache'));
}

async function loadVendorFeed(options: {
  vendorId?: string | null;
  includeProducts?: boolean;
  productLimit?: number | null;
} = {}): Promise<VendorFeedResult> {
  const includeProducts = options.includeProducts === true;

  try {
    const { rows } = await query(
      `SELECT
         v.id,
         v.name,
         v.business_name,
         v.name_he,
         v.slug,
         v.description,
         v.description_he,
         v.logo_url,
         v.banner_url,
         v.category,
         v.categories,
         v.subcategories,
         v.metadata,
         v.address,
         v.business_hours,
         v.delivery_options,
         v.minimum_order,
         v.delivery_fee,
         v.preparation_time,
         v.status,
         v.featured,
         v.verified,
         v.rating,
         v.total_reviews,
         v.created_at,
         COUNT(p.id)::int AS product_count
       FROM vendors v
       LEFT JOIN products p
         ON p.vendor_id = v.id
        AND COALESCE(p.status, 'published') IN ('published', 'active')
        AND COALESCE(p.in_stock, true) = true
       WHERE COALESCE(v.is_active, true) = true
         AND COALESCE(v.status, 'active') IN ('active', 'published', 'approved')
         AND ($1::text IS NULL OR v.id = $1 OR v.slug = $1)
       GROUP BY v.id
       ORDER BY COALESCE(v.featured, false) DESC, v.name ASC`,
      [options.vendorId || null]
    );

    let productGroups = new Map<string, ProductFeedProduct[]>();
    if (includeProducts) {
      const productFeed = await getProductFeed({
        vendorId: options.vendorId,
        limit: options.vendorId ? options.productLimit : null,
      });
      for (const product of productFeed.products) {
        const group = productGroups.get(product.vendorId) || [];
        if (!options.productLimit || group.length < options.productLimit) {
          group.push(product);
        }
        productGroups.set(product.vendorId, group);
      }
    }

    const vendors = rows.map(row => normalizeVendor(row, productGroups.get(row.id) || [], 'database'));
    return {
      success: true,
      source: 'database',
      stale: false,
      count: vendors.length,
      vendors,
    };
  } catch (error) {
    const productFeed = await getProductFeed({ publicOnly: true });
    const vendors = vendorsFromProducts(productFeed.products)
      .filter(vendor => !options.vendorId || vendor.id === options.vendorId || vendor.slug === options.vendorId)
      .map(vendor => ({
        ...vendor,
        products: includeProducts
          ? vendor.products?.slice(0, options.productLimit || undefined)
          : undefined,
      }));

    return {
      success: productFeed.success,
      source: 'db-cache',
      stale: true,
      count: vendors.length,
      vendors,
      error: (error as Error).message,
    };
  }
}

export async function getVendorFeed(options: {
  vendorId?: string | null;
  includeProducts?: boolean;
  productLimit?: number | null;
} = {}): Promise<VendorFeedResult> {
  const cacheKey = buildVendorFeedCacheKey(options);
  const cached = getCachedVendorFeed(cacheKey);
  if (cached) return cached;

  const existingPromise = vendorFeedPromises.get(cacheKey);
  if (existingPromise) return existingPromise;

  const generation = vendorFeedCacheGeneration;
  const promise = loadVendorFeed(options)
    .then(result => {
      if (generation === vendorFeedCacheGeneration) {
        cacheVendorFeedResult(cacheKey, result);
      }
      return result;
    })
    .finally(() => {
      vendorFeedPromises.delete(cacheKey);
    });

  vendorFeedPromises.set(cacheKey, promise);
  return promise;
}

export async function getVendorById(vendorId: string, includeProducts = true): Promise<LiveVendor | null> {
  const feed = await getVendorFeed({ vendorId, includeProducts });
  return feed.vendors[0] || null;
}

export function invalidateVendorFeedCache() {
  vendorFeedCacheGeneration++;
  vendorFeedCache.clear();
  vendorFeedPromises.clear();
}
