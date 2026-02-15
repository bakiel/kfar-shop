/**
 * Landing Page Data Service
 * Server-only module: queries PostgreSQL with fallback to static data layer
 */

import { query, isDbAvailable } from '@/lib/db/postgres-client';
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';
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
import { getProductById } from '@/lib/data/wordpress-style-data-layer';

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

/**
 * Get active vendors from DB with fallback to static data
 */
async function getActiveVendors(): Promise<LandingVendor[]> {
  try {
    const { rows: dbVendors } = await query(
      'SELECT * FROM vendors WHERE is_active = true ORDER BY name'
    );

    if (dbVendors.length > 0) {
      // Get products for each vendor
      const vendorsWithProducts: LandingVendor[] = await Promise.all(
        dbVendors.map(async (v: any) => {
          const { rows: products } = await query(
            `SELECT * FROM products WHERE vendor_id = $1 AND status = 'published' ORDER BY view_count DESC LIMIT 3`,
            [v.id]
          );

          const { rows: allProducts } = await query(
            `SELECT COUNT(*) as count FROM products WHERE vendor_id = $1 AND status = 'published'`,
            [v.id]
          );

          const vendorLogo = v.logo_url || v.logo || '';
          return {
            id: v.id,
            name: v.name,
            slug: v.slug,
            description: v.description || '',
            logo: vendorLogo,
            banner: v.banner_url || v.banner,
            productCount: parseInt(allProducts[0]?.count || '0'),
            categories: v.categories || v.subcategories || [],
            rating: v.rating ? parseFloat(v.rating) : 4.5,
            reviewCount: v.total_reviews || v.review_count || 0,
            established: v.established,
            location: v.location,
            specialty: v.specialty,
            certifications: v.certifications || [],
            topProducts: products.map((p: any) => ({
              id: p.id,
              name: p.name,
              nameHe: p.name_he,
              description: p.description || '',
              price: parseFloat(p.price),
              originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
              category: p.category,
              image: p.image_url || p.image || '',
              vendorId: p.vendor_id,
              vendorName: v.name,
              vendorLogo: vendorLogo,
              inStock: p.in_stock !== false,
              isFeatured: p.is_featured || false,
              rating: p.rating ? parseFloat(p.rating) : undefined,
              tags: p.tags || [],
            })),
          };
        })
      );

      return vendorsWithProducts;
    }
  } catch (error) {
    console.log('DB vendor fetch failed, using static data:', (error as Error).message);
  }

  // Fallback to static data
  return Object.values(vendorStores).map((store) => ({
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    logo: store.logo,
    banner: store.banner,
    productCount: store.products.length,
    categories: store.categories,
    rating: store.analytics?.averageRating || 4.5,
    reviewCount: store.analytics?.reviewCount || 0,
    established: store.metadata.established,
    location: store.metadata.location,
    specialty: store.metadata.specialty,
    certifications: store.metadata.certifications || [],
    topProducts: store.products.slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      nameHe: p.nameHe || p.nameHebrew,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      category: p.category,
      image: p.image,
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      vendorLogo: store.logo,
      inStock: p.inStock,
      isFeatured: p.isFeatured || p.featured || false,
      rating: p.rating,
      tags: p.tags || [],
    })),
  }));
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
      return rows.map((p: any) => ({
        id: p.id,
        name: p.name,
        nameHe: p.name_he,
        description: p.description || '',
        price: parseFloat(p.price),
        originalPrice: p.original_price ? parseFloat(p.original_price) : undefined,
        category: p.category,
        image: p.image_url || p.image || '',
        vendorId: p.vendor_id,
        vendorName: p.vendor_name,
        vendorLogo: p.vendor_logo,
        badge: p.badge,
        rating: p.rating ? parseFloat(p.rating) : undefined,
        reviewCount: p.review_count || p.total_reviews || 0,
        inStock: p.in_stock !== false,
        isFeatured: p.is_featured || false,
        tags: p.tags || [],
      }));
    }
  } catch (error) {
    console.log('DB product fetch failed, using static data:', (error as Error).message);
  }

  // Fallback to static data
  const allProducts: LandingProduct[] = [];
  Object.values(vendorStores).forEach((store) => {
    store.products.forEach((p) => {
      allProducts.push({
        id: p.id,
        name: p.name,
        nameHe: p.nameHe || p.nameHebrew,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category,
        image: p.image,
        vendorId: p.vendorId,
        vendorName: p.vendorName,
        vendorLogo: store.logo,
        badge: p.badge,
        rating: p.rating,
        reviewCount: p.reviewCount || p.reviews || 0,
        inStock: p.inStock,
        isFeatured: p.isFeatured || p.featured || false,
        tags: p.tags || [],
      });
    });
  });

  // Sort: featured first, then by rating
  allProducts.sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  return allProducts.slice(0, limit);
}

/**
 * Get top categories from DB or derive from static data
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
    console.log('DB category fetch failed, using static data:', (error as Error).message);
  }

  // Fallback: derive from static data
  const catMap: Record<string, number> = {};
  Object.values(vendorStores).forEach((store) => {
    store.products.forEach((p) => {
      // Enforce language rule: merge "ground-meat" into "ground-meatless"
      const cat = p.category === 'ground-meat' ? 'ground-meatless' : p.category;
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
  });

  return Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([cat, count], idx) => {
      const slug = cat.toLowerCase().replace(/\s+/g, '-');
      const display = categoryDisplayNames[slug];
      return {
        id: `cat-${idx}`,
        name: display?.en || cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        nameHe: display?.he,
        slug,
        image: categoryImages[slug] || '/images/default_logo.svg',
        productCount: count,
      };
    });
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
    const { rows } = await query(
      `SELECT b.*, v.name as vendor_name
       FROM bundles b
       LEFT JOIN vendors v ON b.vendor_id = v.id
       WHERE b.is_active = true
       ORDER BY b.is_featured DESC, b.created_at DESC`
    );

    if (rows.length > 0) {
      const bundles: Bundle[] = await Promise.all(
        rows.map(async (b: any) => {
          // Resolve product details for the bundle
          const productIds = b.product_ids || [];
          let products: BundleProduct[] = [];

          if (productIds.length > 0) {
            try {
              const placeholders = productIds.map((_: string, i: number) => `$${i + 1}`).join(',');
              const { rows: prodRows } = await query(
                `SELECT id, name, image_url, price FROM products WHERE id IN (${placeholders})`,
                productIds
              );
              products = prodRows.map((p: any) => ({
                id: p.id,
                name: p.name,
                image: p.image_url || '',
                price: parseFloat(p.price),
              }));
            } catch {
              // Products not found, use empty
            }
          }

          return {
            id: b.id,
            name: b.name,
            nameHe: b.name_he,
            description: b.description || '',
            descriptionHe: b.description_he,
            products,
            bundlePrice: parseFloat(b.bundle_price),
            originalPrice: parseFloat(b.original_price),
            savingsPercent: b.savings_percent ? parseFloat(b.savings_percent) : Math.round((1 - parseFloat(b.bundle_price) / parseFloat(b.original_price)) * 100),
            image: b.image || '',
            isFeatured: b.is_featured || false,
            loyaltyPointsBonus: b.loyalty_points_bonus || 0,
            vendorId: b.vendor_id,
            vendorName: b.vendor_name,
          };
        })
      );

      return bundles;
    }
  } catch (error) {
    console.log('DB bundles fetch failed:', (error as Error).message);
  }

  // Static fallback: generate smart bundles from product catalog
  return generateStaticBundles();
}

/**
 * Generate curated promotional bundles from the static product catalog.
 * These are themed meal/lifestyle bundles that cross vendors.
 */
function generateStaticBundles(): Bundle[] {
  const allProducts: Record<string, { id: string; name: string; nameHe?: string; image: string; price: number; category: string; vendorId: string; vendorName: string }> = {};

  Object.values(vendorStores).forEach((store) => {
    store.products.forEach((p) => {
      allProducts[p.id] = {
        id: p.id,
        name: p.name,
        nameHe: (p as any).nameHe || (p as any).nameHebrew,
        image: p.image,
        price: p.price,
        category: p.category,
        vendorId: p.vendorId,
        vendorName: p.vendorName,
      };
    });
  });

  // Helper to pick products by ID
  const pick = (ids: string[]): BundleProduct[] =>
    ids
      .filter((id) => allProducts[id])
      .map((id) => ({
        id: allProducts[id].id,
        name: allProducts[id].name,
        image: allProducts[id].image,
        price: allProducts[id].price,
      }));

  const bundleDefs: {
    id: string;
    name: string;
    nameHe: string;
    description: string;
    descriptionHe: string;
    productIds: string[];
    discountPct: number;
    image: string;
    loyaltyBonus: number;
  }[] = [
    {
      id: 'bundle-family-feast',
      name: 'Family Feast Bundle',
      nameHe: 'חבילת סעודה משפחתית',
      description: 'A complete vegan dinner for the whole family: burger, sides, and dessert from 3 vendors',
      descriptionHe: 'ארוחת ערב טבעונית שלמה לכל המשפחה: המבורגר, תוספות וקינוח מ-3 חנויות',
      productIds: ['QC-001', 'TD-001', 'GD-003', 'PS004'],
      discountPct: 15,
      image: '/images/queens-cuisine/queens_cuisine_vegan_burger_seitan_patty_sesame_bun_tomato_lettuce_plant_based_sandwich.jpg',
      loyaltyBonus: 50,
    },
    {
      id: 'bundle-shabbat',
      name: 'Shabbat Dinner Pack',
      nameHe: 'חבילת ארוחת שבת',
      description: 'Everything for a beautiful Shabbat meal: schnitzels, fresh salad, and sweet treats',
      descriptionHe: 'הכל לארוחת שבת מושלמת: שניצלים, סלט טרי ומתוקים',
      productIds: ['TD-008', 'GL001', 'GD-001', 'PS001'],
      discountPct: 12,
      image: '/images/vendors/teva-deli/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg',
      loyaltyBonus: 40,
    },
    {
      id: 'bundle-bbq',
      name: 'BBQ Party Bundle',
      nameHe: 'חבילת מנגל',
      description: 'Fire up the grill! Seitan steaks, burgers, sausages and refreshments',
      descriptionHe: 'תדליקו את המנגל! סטייקים, המבורגרים, נקניקיות ושתייה',
      productIds: ['QC-003', 'TD-005', 'TD-011', 'PS007'],
      discountPct: 18,
      image: '/images/queens-cuisine/queens_cuisine_vegan_meat_grilled_seitan_steaks_plant_based_protein_alternative.jpg',
      loyaltyBonus: 60,
    },
    {
      id: 'bundle-sweet-tooth',
      name: 'Sweet Tooth Collection',
      nameHe: 'אוסף מתוקים',
      description: 'Artisan ice cream, frozen treats, and gourmet desserts from Gahn Delight',
      descriptionHe: 'גלידות אומנותיות, קינוחים קפואים וממתקי גורמה מגן תענוג',
      productIds: ['GD-001', 'GD-003', 'GD-005', 'GD-006'],
      discountPct: 10,
      image: '/images/vendors/gahn-delight/gahn_delight_ice_cream_pistachio_rose_triple_scoop_ceramic_bowl.jpeg',
      loyaltyBonus: 30,
    },
    {
      id: 'bundle-healthy-start',
      name: 'Healthy Start Pack',
      nameHe: 'חבילת התחלה בריאה',
      description: 'Kickstart your week with fresh spreads, salads, and wholesome pantry staples',
      descriptionHe: 'התחילו את השבוע עם ממרחים טריים, סלטים ומוצרי מזווה בריאים',
      productIds: ['GL001', 'GL003', 'PS001', 'PS003'],
      discountPct: 14,
      image: '/images/vendors/garden-of-light/products/1.jpg',
      loyaltyBonus: 45,
    },
    {
      id: 'bundle-kfar-essentials',
      name: 'KFAR Essentials Box',
      nameHe: 'קופסת חיוניים של כפר',
      description: 'The Village of Peace starter box: community favorites from every vendor',
      descriptionHe: 'קופסת ההתחלה של כפר השלום: מוצרים אהובים מכל חנות',
      productIds: ['TD-001', 'QC-002', 'GL001', 'GD-001', 'PS001', 'vop-001'],
      discountPct: 20,
      image: '/images/vendors/vop-shop/vop_shop_community_apparel_product_01_wellness_lifestyle_village_of_peace_heritage_clothing.jpg',
      loyaltyBonus: 100,
    },
  ];

  return bundleDefs.map((def) => {
    const products = pick(def.productIds);
    const originalPrice = products.reduce((sum, p) => sum + p.price, 0);
    const bundlePrice = Math.round(originalPrice * (1 - def.discountPct / 100) * 100) / 100;

    return {
      id: def.id,
      name: def.name,
      nameHe: def.nameHe,
      description: def.description,
      descriptionHe: def.descriptionHe,
      products,
      bundlePrice,
      originalPrice,
      savingsPercent: def.discountPct,
      image: def.image,
      isFeatured: true,
      loyaltyPointsBonus: def.loyaltyBonus,
    };
  }).filter((b) => b.products.length >= 3); // Only show bundles with at least 3 resolved products
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
    console.log('DB stats fetch failed, using static:', (error as Error).message);
  }

  // Fallback
  const stores = Object.values(vendorStores);
  const totalProducts = stores.reduce((sum, s) => sum + s.products.length, 0);
  const categories = new Set<string>();
  stores.forEach((s) => s.products.forEach((p) => categories.add(p.category)));

  return {
    totalVendors: stores.length,
    totalProducts,
    totalCategories: categories.size,
    totalCustomers: 500,
    yearsInBusiness: new Date().getFullYear() - 1973,
  };
}

/**
 * Main data fetcher -- runs all queries in parallel
 */
/**
 * Get all bundles (for dedicated bundles page)
 */
export async function getAllBundles(): Promise<Bundle[]> {
  return getFeaturedBundles();
}

export async function getBundleById(id: string): Promise<Bundle | null> {
  const bundles = await getAllBundles();
  return bundles.find(b => b.id === id) || null;
}

export async function getEnrichedBundle(id: string): Promise<EnrichedBundle | null> {
  const bundle = await getBundleById(id);
  if (!bundle) return null;

  const enrichedProducts: EnrichedBundleProduct[] = bundle.products.map(bp => {
    const fullProduct = getProductById(bp.id);
    return {
      ...bp,
      nameHe: fullProduct?.nameHe || fullProduct?.nameHebrew,
      description: fullProduct?.description,
      descriptionHe: fullProduct?.descriptionHe,
      vendorId: fullProduct?.vendorId || '',
      vendorName: fullProduct?.vendorName || '',
      vendorLogo: fullProduct?.vendorLogo,
      category: fullProduct?.category || '',
      tags: fullProduct?.tags || [],
    };
  });

  return {
    ...bundle,
    products: enrichedProducts,
  };
}

export async function getLandingPageData(): Promise<LandingPageData> {
  // Gate: check DB availability once before running 7 parallel queries.
  // If DB is down this returns in <2s instead of waiting for every query to timeout.
  const dbUp = await isDbAvailable();
  if (!dbUp) {
    console.log('DB unreachable — using static data for landing page');
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
