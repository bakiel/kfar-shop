/**
 * Landing Page Data Service
 * Server-only module: queries PostgreSQL and DB-derived live feed cache.
 */

import { unstable_cache } from 'next/cache';
import {
  getBundleRecordOriginalPrice,
  getBundleRecordPrice,
  getBundleRecordProductIds,
  getBundleRecordStatus,
  getBundleSavingsPercent,
  normalizeBundleRecord,
  sortBundleRecords,
} from '@/lib/db/bundles';
import { query, isDbAvailable } from '@/lib/db/postgres-client';
import { getProductById as getLiveProductById, getProductFeed, ProductFeedProduct } from '@/lib/services/live-product-feed';
import { getVendorFeed } from '@/lib/services/live-vendor-feed';
import { resolveImagePath } from '@/lib/utils/image-resolver';
import type {
  LandingPageData,
  LandingVendor,
  LandingProduct,
  LandingCategory,
  FlashDeal,
  Bundle,
  BundleProduct,
  Promotion,
  MarketplaceStats,
  EnrichedBundle,
  EnrichedBundleProduct,
} from '@/lib/types/landing';

// Category images mapping (AI-generated category banners)
const categoryImages: Record<string, string> = {
  'pantry': '/images/categories/pantry.jpg',
  'seitan': '/images/categories/seitan.jpg',
  'ready-meals': '/images/categories/ready-meals.jpg',
  'apparel': '/images/categories/apparel.jpg',
  'ice-cream': '/images/categories/ice-cream.jpg',
  'ground-meatless': '/images/categories/ground-meatless.jpg',
  'patties': '/images/categories/patties.jpg',
  'beverages': '/images/categories/beverages.jpg',
  // Fallback to product images for other categories
  'schnitzels': '/images/vendors/teva-deli/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg',
  'burgers': '/images/vendors/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg',
  'tofu': '/images/vendors/teva-deli/teva_deli_vegan_tofu_natural_organic_plant_based_protein_block_israeli_made.png',
  'spreads': '/images/vendors/garden-of-light/products/2.jpg',
  'catering': '/images/queens-cuisine/queens_cuisine_product_banner_vegan_meat_alternatives_plant_based_cuisine_display_01.jpg',
  'salads': '/images/vendors/garden-of-light/products/1.jpg',
};

const bundleHeroImages: Record<string, string> = {
  'bundle-shabbat': '/images/bundles/kfar-sheshe-dinner-hero.jpg',
  '140d5de1-4cf1-4704-80d7-8af3fa1b15b9': '/images/bundles/kfar-sheshe-dinner-hero.jpg',
  'sheshe dinner pack': '/images/bundles/kfar-sheshe-dinner-hero.jpg',
};

// Display name mapping -- proper casing + language rule enforcement
const categoryDisplayNames: Record<string, { en: string; he: string }> = {
  'pantry': { en: 'Pantry Staples', he: 'מזווה' },
  'seitan': { en: 'Seitan', he: 'סייטן' },
  'ready-meals': { en: 'Ready Meals', he: 'ארוחות מוכנות' },
  'apparel': { en: 'Apparel', he: 'ביגוד' },
  'ice-cream': { en: 'Ice Cream', he: 'גלידות' },
  'ground-meat': { en: 'Ground Meatless', he: 'בשר טחון צמחי' },  // LANGUAGE RULE: never "Ground Meat"
  'ground-meatless': { en: 'Ground Meatless', he: 'בשר טחון צמחי' },
  'patties': { en: 'Patties', he: 'קציצות' },
  'beverages': { en: 'Beverages', he: 'משקאות' },
  'schnitzels': { en: 'Schnitzels', he: 'שניצלים' },
  'burgers': { en: 'Burgers', he: 'המבורגרים' },
  'tofu': { en: 'Tofu', he: 'טופו' },
  'spreads': { en: 'Spreads', he: 'ממרחים' },
  'salads': { en: 'Salads', he: 'סלטים' },
  'middle-eastern': { en: 'Middle Eastern', he: 'מזרח תיכוני' },
  'sausages': { en: 'Sausages', he: 'נקניקיות' },
  'bbq-burgers': { en: 'BBQ Burgers', he: 'המבורגרי ברביקיו' },
};

function toStringArray(value: unknown): string[] {
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

function mapDatabaseLandingProduct(row: any): LandingProduct {
  return {
    id: row.id,
    name: row.name,
    nameHe: row.name_he,
    description: row.description || '',
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    category: row.category,
    image: row.image_url || row.image || '',
    vendorId: row.vendor_id,
    vendorName: row.vendor_name,
    vendorLogo: row.vendor_logo,
    badge: row.badge,
    rating: row.rating ? parseFloat(row.rating) : undefined,
    reviewCount: row.review_count || row.total_reviews || 0,
    inStock: row.in_stock !== false,
    isFeatured: row.is_featured || false,
    tags: toStringArray(row.tags),
  };
}

function mapLiveLandingProduct(product: ProductFeedProduct): LandingProduct {
  return {
    id: product.id,
    name: product.name,
    nameHe: product.nameHe || undefined,
    description: product.description || '',
    price: product.price,
    originalPrice: product.originalPrice || undefined,
    category: product.category,
    image: product.image || '',
    vendorId: product.vendorId,
    vendorName: product.vendorName,
    vendorLogo: product.vendorLogo || undefined,
    badge: product.badge || undefined,
    rating: product.rating || undefined,
    reviewCount: product.reviewCount || 0,
    inStock: product.inStock,
    isFeatured: product.isFeatured || false,
    tags: product.tags || [],
  };
}

function resolveBundleHeroImage(
  bundleId: string,
  configuredImage?: string,
  firstProductImage?: string,
  bundleName?: string
): string {
  const bundleKey = bundleName?.trim().toLowerCase() || '';
  const heroImage = bundleHeroImages[bundleId] || bundleHeroImages[bundleKey] || configuredImage || firstProductImage;
  return resolveImagePath(heroImage);
}

function mapLiveBundleProduct(product: ProductFeedProduct): BundleProduct {
  return {
    id: product.id,
    name: product.name,
    image: resolveImagePath(product.image || product.images?.[0]),
    price: product.price,
  };
}

async function getLiveLandingPageData(): Promise<LandingPageData> {
  const [productFeed, vendorFeed] = await Promise.all([
    getProductFeed(),
    getVendorFeed({ includeProducts: true, productLimit: 3 }),
  ]);

  const featuredProducts = productFeed.products
    .map(mapLiveLandingProduct)
    .sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 12);

  const categories = Array.from(
    productFeed.products.reduce((counts, product) => {
      const category = product.category === 'ground-meat' ? 'ground-meatless' : product.category || 'general';
      counts.set(category, (counts.get(category) || 0) + 1);
      return counts;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([category, count], idx) => {
      const slug = category.toLowerCase().replace(/\s+/g, '-');
      const display = categoryDisplayNames[slug];
      return {
        id: `cat-${idx}`,
        name: display?.en || category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        nameHe: display?.he,
        slug,
        image: categoryImages[slug] || '/images/default_logo.svg',
        productCount: count,
      };
    });

  return {
    vendors: vendorFeed.vendors.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      slug: vendor.slug || vendor.id,
      description: vendor.description || '',
      logo: vendor.logo,
      banner: vendor.banner,
      productCount: vendor.productCount,
      categories: vendor.categories,
      rating: vendor.rating || 4.5,
      reviewCount: vendor.totalReviews || 0,
      established: vendor.metadata?.established,
      location: vendor.metadata?.location,
      specialty: vendor.category || vendor.categories[0],
      certifications: vendor.metadata?.certifications || [],
      topProducts: (vendor.products || []).map(mapLiveLandingProduct),
    })),
    featuredProducts,
    categories,
    flashDeals: [],
    bundles: [],
    promotions: [],
    stats: {
      totalVendors: vendorFeed.count,
      totalProducts: productFeed.count,
      totalCategories: categories.length,
      totalCustomers: 0,
      yearsInBusiness: new Date().getFullYear() - 1973,
    },
  };
}

/**
 * Get active vendors from DB with live-feed fallback
 */
async function getActiveVendors(): Promise<LandingVendor[]> {
  try {
    const { rows: dbVendors } = await query(
      'SELECT * FROM vendors WHERE is_active = true ORDER BY name'
    );

    if (dbVendors.length > 0) {
      const vendorIds = dbVendors.map((vendor: any) => vendor.id);
      const [{ rows: countRows }, { rows: topProductRows }] = await Promise.all([
        query(
          `SELECT vendor_id, COUNT(*)::int AS product_count
           FROM products
           WHERE status = 'published' AND vendor_id = ANY($1::text[])
           GROUP BY vendor_id`,
          [vendorIds]
        ),
        query(
          `SELECT *
           FROM (
             SELECT
               p.*,
               v.name AS vendor_name,
               v.logo_url AS vendor_logo,
               ROW_NUMBER() OVER (
                 PARTITION BY p.vendor_id
                 ORDER BY COALESCE(p.is_featured, false) DESC, COALESCE(p.view_count, 0) DESC, p.created_at DESC
               ) AS row_num
             FROM products p
             JOIN vendors v ON p.vendor_id = v.id
             WHERE p.status = 'published' AND p.vendor_id = ANY($1::text[])
           ) ranked
           WHERE row_num <= 3
           ORDER BY vendor_id, row_num`,
          [vendorIds]
        ),
      ]);

      const productCountByVendor = new Map<string, number>(
        countRows.map((row: any) => [row.vendor_id, parseInt(row.product_count || '0', 10)])
      );
      const topProductsByVendor = new Map<string, LandingProduct[]>();

      for (const row of topProductRows) {
        const currentProducts = topProductsByVendor.get(row.vendor_id) || [];
        currentProducts.push(mapDatabaseLandingProduct(row));
        topProductsByVendor.set(row.vendor_id, currentProducts);
      }

      return dbVendors.map((vendor: any) => {
        const vendorLogo = vendor.logo_url || vendor.logo || '';
        const categories = toStringArray(vendor.categories);

        return {
          id: vendor.id,
          name: vendor.name,
          slug: vendor.slug,
          description: vendor.description || '',
          logo: vendorLogo,
          banner: vendor.banner_url || vendor.banner,
          productCount: productCountByVendor.get(vendor.id) || 0,
          categories: categories.length > 0
            ? categories
            : toStringArray(vendor.subcategories),
          rating: vendor.rating ? parseFloat(vendor.rating) : 4.5,
          reviewCount: vendor.total_reviews || vendor.review_count || 0,
          established: vendor.established,
          location: vendor.location,
          specialty: vendor.specialty,
          certifications: toStringArray(vendor.certifications),
          topProducts: topProductsByVendor.get(vendor.id) || [],
        };
      });
    }
  } catch (error) {
    console.log('DB vendor fetch failed, using live feed:', (error as Error).message);
  }

  return (await getLiveLandingPageData()).vendors;
}

/**
 * Get featured products from DB with fallback
 */
async function getFeaturedProducts(limit: number = 12): Promise<LandingProduct[]> {
  try {
    const { rows } = await query(
      `SELECT p.*, v.name as vendor_name, v.logo_url as vendor_logo
       FROM products p
       JOIN vendors v ON p.vendor_id = v.id
       WHERE p.status = 'published'
       ORDER BY p.is_featured DESC, p.view_count DESC
       LIMIT $1`,
      [limit]
    );

    if (rows.length > 0) {
      return rows.map(mapDatabaseLandingProduct);
    }
  } catch (error) {
    console.log('DB product fetch failed, using live feed:', (error as Error).message);
  }

  const feed = await getProductFeed({ limit });
  return feed.products.map(mapLiveLandingProduct);
}

/**
 * Get top categories from DB or derive from live product feed
 */
async function getTopCategories(limit: number = 8): Promise<LandingCategory[]> {
  try {
    const { rows } = await query(
      `SELECT category, COUNT(*) as product_count
       FROM products
       WHERE status = 'published'
       GROUP BY category
       ORDER BY product_count DESC
       LIMIT $1`,
      [limit]
    );

    if (rows.length > 0) {
      return rows.map((row: any, idx: number) => {
        const slug = row.category.toLowerCase().replace(/\s+/g, '-');
        const displaySlug = slug === 'ground-meat' ? 'ground-meatless' : slug;
        const display = categoryDisplayNames[slug];
        return {
          id: `cat-${idx}`,
          name: display?.en || row.category.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          nameHe: display?.he,
          slug: displaySlug,
          image: categoryImages[displaySlug] || categoryImages[slug] || '/images/default_logo.svg',
          productCount: parseInt(row.product_count),
        };
      });
    }
  } catch (error) {
    console.log('DB category fetch failed, using live feed:', (error as Error).message);
  }

  return (await getLiveLandingPageData()).categories.slice(0, limit);
}

/**
 * Get active flash deals from DB
 */
async function getActiveFlashDeals(): Promise<FlashDeal[]> {
  try {
    const { rows } = await query(
      `SELECT fd.*, p.name as product_name, p.name_he as product_name_he,
              p.image_url as product_image, v.name as vendor_name
       FROM flash_deals fd
       JOIN products p ON fd.product_id = p.id
       JOIN vendors v ON p.vendor_id = v.id
       WHERE fd.is_active = true AND fd.ends_at > NOW() AND fd.stock_remaining > 0
       ORDER BY fd.ends_at ASC`
    );

    return rows.map((d: any) => ({
      id: d.id,
      productId: d.product_id,
      productName: d.product_name,
      productNameHe: d.product_name_he,
      productImage: d.product_image || '',
      vendorName: d.vendor_name,
      dealPrice: parseFloat(d.deal_price),
      originalPrice: parseFloat(d.original_price),
      savingsPercent: Math.round((1 - parseFloat(d.deal_price) / parseFloat(d.original_price)) * 100),
      stockLimit: d.stock_limit,
      stockRemaining: d.stock_remaining,
      startsAt: new Date(d.starts_at).toISOString(),
      endsAt: new Date(d.ends_at).toISOString(),
      isActive: d.is_active,
    }));
  } catch (error) {
    console.log('DB flash deals fetch failed:', (error as Error).message);
    return [];
  }
}

/**
 * Get featured bundles from DB
 */
async function getFeaturedBundles(): Promise<Bundle[]> {
  try {
    const { rows } = await query('SELECT * FROM bundles');
    const activeRows = sortBundleRecords(rows).filter((bundle) => getBundleRecordStatus(bundle) === 'active');

    if (activeRows.length > 0) {
      const bundleProductIds = activeRows.map((bundle: any) => getBundleRecordProductIds(bundle));
      const allProductIds = Array.from(new Set(bundleProductIds.flat())).filter(Boolean);
      const productMap = new Map<string, BundleProduct>();

      if (allProductIds.length > 0) {
        try {
          const { rows: productRows } = await query(
            `SELECT id, name, image_url, price FROM products WHERE id = ANY($1::text[])`,
            [allProductIds]
          );

          for (const product of productRows) {
            productMap.set(product.id, {
              id: product.id,
              name: product.name,
              image: resolveImagePath(product.image_url || ''),
              price: parseFloat(product.price),
            });
          }
        } catch {
          // Use empty product map if the lookup fails.
        }
      }

      return activeRows.map((bundle: any, idx: number) => {
        const productIds = bundleProductIds[idx];
        const products = productIds
          .map((productId) => productMap.get(productId))
          .filter((product): product is BundleProduct => !!product);
        const bundlePrice = getBundleRecordPrice(bundle);
        const originalPrice = getBundleRecordOriginalPrice(bundle);
        const savingsPercent = bundle.savings_percent
          ? parseFloat(bundle.savings_percent)
          : getBundleSavingsPercent(originalPrice, bundlePrice);

        return {
          id: bundle.id,
          name: bundle.name,
          nameHe: bundle.name_he,
          description: bundle.description || '',
          descriptionHe: bundle.description_he,
          products,
          bundlePrice,
          originalPrice,
          savingsPercent,
          image: resolveBundleHeroImage(bundle.id, bundle.image || '', products[0]?.image, bundle.name),
          isFeatured: bundle.is_featured || false,
          loyaltyPointsBonus: bundle.loyalty_points_bonus || 0,
          vendorId: bundle.vendor_id,
        };
      });
    }
  } catch (error) {
    console.log('DB bundles fetch failed:', (error as Error).message);
  }

  return [];
}

/**
 * Get active promotions from DB
 */
async function getActivePromotions(): Promise<Promotion[]> {
  try {
    const { rows } = await query(
      `SELECT * FROM promotions
       WHERE is_active = true AND end_date > NOW()
       ORDER BY type, created_at DESC`
    );

    return rows.map((p: any) => ({
      id: p.id,
      title: p.title,
      titleHe: p.title_he,
      description: p.description || '',
      descriptionHe: p.description_he,
      type: p.type,
      discountPercent: p.discount_percent ? parseFloat(p.discount_percent) : undefined,
      badgeText: p.badge_text,
      badgeTextHe: p.badge_text_he,
      image: p.image,
      startDate: new Date(p.start_date).toISOString(),
      endDate: new Date(p.end_date).toISOString(),
      isActive: p.is_active,
    }));
  } catch (error) {
    console.log('DB promotions fetch failed:', (error as Error).message);
    return [];
  }
}

/**
 * Get marketplace stats
 */
async function getMarketplaceStats(): Promise<MarketplaceStats> {
  try {
    const [vendorResult, productResult, categoryResult, customerResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM vendors WHERE is_active = true'),
      query("SELECT COUNT(*) as count FROM products WHERE status = 'published'"),
      query("SELECT COUNT(DISTINCT category) as count FROM products WHERE status = 'published'"),
      query('SELECT COUNT(*) as count FROM customers'),
    ]);

    return {
      totalVendors: parseInt(vendorResult.rows[0]?.count || '0'),
      totalProducts: parseInt(productResult.rows[0]?.count || '0'),
      totalCategories: parseInt(categoryResult.rows[0]?.count || '0'),
      totalCustomers: parseInt(customerResult.rows[0]?.count || '0') || 500,
      yearsInBusiness: new Date().getFullYear() - 1973,
    };
  } catch (error) {
    console.log('DB stats fetch failed, using live feed:', (error as Error).message);
  }

  return (await getLiveLandingPageData()).stats;
}

function resolveBundleProduct(productId: string): BundleProduct {
  return {
    id: productId,
    name: productId,
    image: resolveImagePath(''),
    price: 0,
  };
}

function mapDatabaseBundle(row: any): Bundle {
  const normalized = normalizeBundleRecord(row) as any;
  const products = normalized.products.map(resolveBundleProduct);
  const bundlePrice = normalized.price;
  const originalPrice = normalized.originalPrice;

  return {
    id: normalized.id,
    name: normalized.name,
    nameHe: normalized.nameHe || undefined,
    description: normalized.description || '',
    descriptionHe: normalized.descriptionHe || undefined,
    products,
    bundlePrice,
    originalPrice,
    savingsPercent: normalized.savingsPercent,
    image: resolveBundleHeroImage(normalized.id, normalized.image, products[0]?.image, normalized.name),
    isFeatured: normalized.isFeatured,
    loyaltyPointsBonus: normalized.loyaltyPointsBonus,
    vendorId: normalized.vendorId,
  };
}

async function getDatabaseBundles(): Promise<Bundle[]> {
  const dbUp = await isDbAvailable();
  if (!dbUp) return [];

  try {
    const { rows } = await query('SELECT * FROM bundles');
    const activeRows = sortBundleRecords(rows).filter((row) => getBundleRecordStatus(row) === 'active');

    return activeRows.map(mapDatabaseBundle);
  } catch (error) {
    console.log('DB bundle fetch failed:', (error as Error).message);
    return [];
  }
}

/**
 * Get all bundles (for dedicated bundles page)
 */
async function loadAllBundles(): Promise<Bundle[]> {
  const dbUp = await isDbAvailable();
  if (!dbUp) return [];

  try {
    const [{ rows }, productFeed] = await Promise.all([
      query('SELECT * FROM bundles'),
      getProductFeed(),
    ]);
    const productMap = new Map(productFeed.products.map((product) => [product.id.toLowerCase(), product]));

    return sortBundleRecords(rows)
      .filter((row) => getBundleRecordStatus(row) === 'active')
      .map((row: any) => {
        const normalized = normalizeBundleRecord(row) as any;
        const products = normalized.products.map((productId: string) => {
          const liveProduct = productMap.get(productId.toLowerCase());
          return liveProduct ? mapLiveBundleProduct(liveProduct) : resolveBundleProduct(productId);
        });

        return {
          id: normalized.id,
          name: normalized.name,
          nameHe: normalized.nameHe || undefined,
          description: normalized.description || '',
          descriptionHe: normalized.descriptionHe || undefined,
          products,
          bundlePrice: normalized.price,
          originalPrice: normalized.originalPrice,
          savingsPercent: normalized.savingsPercent,
          image: resolveBundleHeroImage(normalized.id, normalized.image, products[0]?.image, normalized.name),
          isFeatured: normalized.isFeatured,
          loyaltyPointsBonus: normalized.loyaltyPointsBonus,
          vendorId: normalized.vendorId,
        };
      });
  } catch (error) {
    console.log('DB bundle fetch failed:', (error as Error).message);
    return [];
  }
}

export async function getAllBundles(): Promise<Bundle[]> {
  return loadAllBundles();
}

export async function getBundleById(id: string): Promise<Bundle | null> {
  const bundles = await getAllBundles();
  return bundles.find(b => b.id === id) || null;
}

export async function getEnrichedBundle(id: string): Promise<EnrichedBundle | null> {
  const bundle = await getBundleById(id);
  if (!bundle) return null;

  const enrichedProducts: EnrichedBundleProduct[] = await Promise.all(bundle.products.map(async (bp) => {
    const fullProduct = await getLiveProductById(bp.id);
    const liveProduct = fullProduct ? mapLiveBundleProduct(fullProduct) : null;

    return {
      ...bp,
      ...(liveProduct || {}),
      nameHe: fullProduct?.nameHe || undefined,
      description: fullProduct?.description,
      descriptionHe: fullProduct?.descriptionHe || undefined,
      vendorId: fullProduct?.vendorId || '',
      vendorName: fullProduct?.vendorName || '',
      vendorLogo: fullProduct?.vendorLogo || undefined,
      category: fullProduct?.category || '',
      tags: fullProduct?.tags || [],
    };
  }));

  return {
    ...bundle,
    image: resolveBundleHeroImage(bundle.id, bundle.image, enrichedProducts[0]?.image, bundle.name),
    products: enrichedProducts,
  };
}

async function loadLandingPageData(): Promise<LandingPageData> {
  // Gate: check DB availability once before running 7 parallel queries.
  // If DB is down this returns in <2s instead of waiting for every query to timeout.
  const dbUp = await isDbAvailable();
  if (!dbUp) {
    console.log('DB unreachable - using DB-derived live feed cache for landing page');
    return getLiveLandingPageData();
  }

  const [vendors, featuredProducts, categories, flashDeals, bundles, promotions, stats] =
    await Promise.all([
      getActiveVendors(),
      getFeaturedProducts(12),
      getTopCategories(8),
      getActiveFlashDeals(),
      getFeaturedBundles(),
      getActivePromotions(),
      getMarketplaceStats(),
    ]);

  return {
    vendors,
    featuredProducts,
    categories,
    flashDeals,
    bundles,
    promotions,
    stats,
  };
}

const getLandingPageDataCached = unstable_cache(loadLandingPageData, ['landing-page-data'], {
  revalidate: 300,
});

export async function getLandingPageData(): Promise<LandingPageData> {
  return getLandingPageDataCached();
}
