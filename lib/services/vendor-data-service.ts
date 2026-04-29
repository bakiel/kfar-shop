/**
 * Vendor/product data service backed by PostgreSQL live feeds.
 * Kept as a compatibility layer for older admin/internal modules.
 */

import { query } from '@/lib/db/postgres-client';
import {
  getProductById,
  getProductFeed,
  invalidateProductFeedCache,
  ProductFeedProduct,
} from '@/lib/services/live-product-feed';
import {
  getVendorById,
  getVendorFeed,
  invalidateVendorFeedCache,
  LiveVendor,
} from '@/lib/services/live-vendor-feed';

export type EnhancedProduct = ProductFeedProduct & {
  vendor_id?: string;
  in_stock?: boolean;
  isVegan?: boolean;
  isKosher?: boolean;
  isOrganic?: boolean;
  isGlutenFree?: boolean;
  viewCount?: number;
  purchaseCount?: number;
  popularityScore?: number;
  [key: string]: any;
};

export type VendorStore = LiveVendor & {
  products: EnhancedProduct[];
  branding?: { logo?: string; banner?: string; [key: string]: any };
  info?: { description?: string; location?: string; [key: string]: any };
  analytics?: {
    totalProducts?: number;
    activeProducts?: number;
    totalViews?: number;
    totalSales?: number;
    averageRating?: number;
    reviewCount?: number;
    followerCount?: number;
  };
  [key: string]: any;
};

export interface VendorDataUpdate {
  vendorId: string;
  updates: Partial<VendorStore> & Record<string, any>;
}

export interface ProductDataUpdate {
  productId: string;
  vendorId: string;
  updates: Partial<EnhancedProduct> & Record<string, any>;
}

export interface VendorAnalytics {
  vendorId: string;
  totalProducts: number;
  activeProducts: number;
  totalViews: number;
  totalSales: number;
  averageRating: number;
  topProducts: EnhancedProduct[];
  recentActivity: Array<{
    type: string;
    timestamp: Date;
    details: any;
  }>;
}

function asEnhanced(product: ProductFeedProduct): EnhancedProduct {
  return {
    ...product,
    vendor_id: product.vendorId,
    in_stock: product.inStock,
    isVegan: product.vegan,
    isKosher: Boolean(product.kashrut),
    isOrganic: product.organic,
    isGlutenFree: product.glutenFree,
    viewCount: 0,
    purchaseCount: 0,
    popularityScore: (product.rating || 0) * 10,
  };
}

function asVendorStore(vendor: LiveVendor): VendorStore {
  const products = (vendor.products || []).map(asEnhanced);
  return {
    ...vendor,
    products,
    branding: {
      logo: vendor.logo,
      banner: vendor.banner,
    },
    info: {
      description: vendor.description || '',
      location: vendor.metadata?.location,
    },
    analytics: {
      totalProducts: vendor.productCount,
      activeProducts: products.filter(product => product.inStock !== false).length,
      totalViews: 0,
      totalSales: 0,
      averageRating: vendor.rating || 0,
      reviewCount: vendor.totalReviews || 0,
    },
  };
}

function invalidateLiveFeedCaches() {
  invalidateProductFeedCache();
  invalidateVendorFeedCache();
}

async function updateColumns(
  table: 'vendors' | 'products',
  id: string,
  updates: Record<string, any>,
  fieldMap: Record<string, string>
) {
  const { rows: columnRows } = await query<{ column_name: string }>(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1`,
    [table]
  );
  const columns = new Set(columnRows.map(row => row.column_name));
  const values: any[] = [id];
  const fields: string[] = [];
  const seen = new Set<string>();

  for (const [field, column] of Object.entries(fieldMap)) {
    if (updates[field] === undefined || seen.has(column) || !columns.has(column)) continue;
    values.push(updates[field]);
    fields.push(`${column} = $${values.length}`);
    seen.add(column);
  }

  if (fields.length === 0) return;
  if (columns.has('updated_at')) fields.push('updated_at = NOW()');

  await query(
    `UPDATE ${table}
     SET ${fields.join(', ')}
     WHERE id = $1`,
    values
  );
}

export async function getVendorAnalytics(vendorId: string): Promise<VendorAnalytics | null> {
  const vendor = await getVendorById(vendorId, true);
  if (!vendor) return null;

  const products = (vendor.products || []).map(asEnhanced);
  const activeProducts = products.filter(product => product.inStock !== false);
  const averageRating = products.length
    ? products.reduce((sum, product) => sum + (product.rating || 0), 0) / products.length
    : vendor.rating || 0;

  return {
    vendorId,
    totalProducts: products.length,
    activeProducts: activeProducts.length,
    totalViews: 0,
    totalSales: 0,
    averageRating: Math.round(averageRating * 10) / 10,
    topProducts: [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5),
    recentActivity: [],
  };
}

export const vendorDataService = {
  async getVendor(vendorId: string): Promise<VendorStore | null> {
    const vendor = await getVendorById(vendorId, true);
    return vendor ? asVendorStore(vendor) : null;
  },

  async getAllVendors(): Promise<VendorStore[]> {
    const feed = await getVendorFeed({ includeProducts: true });
    return feed.vendors.map(asVendorStore);
  },

  async updateVendor(update: VendorDataUpdate): Promise<VendorStore> {
    await updateColumns('vendors', update.vendorId, update.updates, {
      name: 'name',
      businessName: 'business_name',
      description: 'description',
      category: 'category',
      status: 'status',
      featured: 'featured',
      verified: 'verified',
      rating: 'rating',
    });

    invalidateLiveFeedCaches();
    const vendor = await this.getVendor(update.vendorId);
    if (!vendor) throw new Error(`Vendor ${update.vendorId} not found`);
    return vendor;
  },

  async getVendorAnalytics(vendorId: string): Promise<VendorAnalytics> {
    const analytics = await getVendorAnalytics(vendorId);
    if (!analytics) throw new Error(`Vendor ${vendorId} not found`);
    return analytics;
  },
};

export const productDataService = {
  async getProduct(productId: string): Promise<EnhancedProduct | null> {
    const product = await getProductById(productId, false);
    return product ? asEnhanced(product) : null;
  },

  async getVendorProducts(vendorId: string): Promise<EnhancedProduct[]> {
    const feed = await getProductFeed({ vendorId, publicOnly: false });
    return feed.products.map(asEnhanced);
  },

  async updateProduct(update: ProductDataUpdate): Promise<EnhancedProduct> {
    await updateColumns('products', update.productId, update.updates, {
      name: 'name',
      nameHe: 'name_he',
      description: 'description',
      price: 'price',
      originalPrice: 'original_price',
      category: 'category',
      image: 'image_url',
      status: 'status',
      stockQuantity: 'stock_quantity',
      inStock: 'in_stock',
      unit: 'unit',
      vegan: 'is_vegan',
      organic: 'is_organic',
      glutenFree: 'is_gluten_free',
      nutritionalInfo: 'nutritional_info',
    });

    invalidateLiveFeedCaches();
    const product = await this.getProduct(update.productId);
    if (!product) throw new Error(`Product ${update.productId} not found`);
    return product;
  },

  async createProduct(vendorId: string, productData: Partial<EnhancedProduct>): Promise<EnhancedProduct> {
    const productId = `${vendorId}-${Date.now()}`;
    const { rows } = await query(
      `INSERT INTO products (
        id, vendor_id, name, description, price, category, image_url,
        status, stock_quantity, unit, is_vegan, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING id`,
      [
        productId,
        vendorId,
        productData.name || 'New Product',
        productData.description || '',
        productData.price || 0,
        productData.category || 'uncategorized',
        productData.image || null,
        productData.status || 'draft',
        productData.stockQuantity || 0,
        productData.unit || 'unit',
        productData.vegan !== false,
      ]
    );

    invalidateLiveFeedCaches();
    const product = await this.getProduct(rows[0].id);
    if (!product) throw new Error(`Product ${rows[0].id} not found after create`);
    return product;
  },

  async deleteProduct(vendorId: string, productId: string): Promise<boolean> {
    await query(
      `UPDATE products
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1 AND vendor_id = $2`,
      [productId, vendorId]
    );
    invalidateLiveFeedCaches();
    return true;
  },

  async bulkUpdateProducts(updates: ProductDataUpdate[]): Promise<EnhancedProduct[]> {
    const results: EnhancedProduct[] = [];
    for (const update of updates) {
      try {
        results.push(await this.updateProduct(update));
      } catch (error) {
        console.error(`Failed to update product ${update.productId}:`, error);
      }
    }
    return results;
  },
};

export const searchService = {
  async searchProducts(queryText: string, filters?: {
    vendorId?: string;
    category?: string;
    subcategory?: string;
    tags?: string[];
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
  }): Promise<EnhancedProduct[]> {
    const feed = await getProductFeed({
      search: queryText,
      vendorId: filters?.vendorId,
      category: filters?.category,
      publicOnly: filters?.inStock === false ? false : undefined,
    });

    let products = feed.products.map(asEnhanced);
    if (filters?.subcategory) products = products.filter(product => product.subcategory === filters.subcategory);
    if (filters?.tags?.length) {
      products = products.filter(product => filters.tags!.some(tag => product.tags?.includes(tag)));
    }
    if (filters?.priceMin !== undefined) products = products.filter(product => product.price >= filters.priceMin!);
    if (filters?.priceMax !== undefined) products = products.filter(product => product.price <= filters.priceMax!);
    if (filters?.inStock !== undefined) products = products.filter(product => product.inStock === filters.inStock);

    return products;
  },

  async getRecommendations(productId: string, limit: number = 6): Promise<EnhancedProduct[]> {
    const product = await productDataService.getProduct(productId);
    if (!product) return [];

    const products = await this.searchProducts('', {
      category: product.category,
      inStock: true,
    });

    return products
      .filter(candidate => candidate.id !== productId)
      .sort((a, b) => {
        if (a.vendorId === product.vendorId && b.vendorId !== product.vendorId) return -1;
        if (b.vendorId === product.vendorId && a.vendorId !== product.vendorId) return 1;
        return (b.popularityScore || 0) - (a.popularityScore || 0);
      })
      .slice(0, limit);
  },
};

export default {
  vendor: vendorDataService,
  product: productDataService,
  search: searchService,
};
