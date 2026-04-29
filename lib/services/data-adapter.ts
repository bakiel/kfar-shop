/**
 * Data Adapter Service
 * Compatibility adapter for older modules.
 * Both adapter branches now resolve against PostgreSQL-backed services.
 */

import type { VendorStore, EnhancedProduct } from '@/lib/services/vendor-data-service';
import vendorDataService from '@/lib/services/vendor-data-service';
import { db, query } from '@/lib/db/postgres-client';

// Check if database is enabled
const USE_DATABASE = process.env.USE_DATABASE === 'true';

// Data adapter interface
interface DataAdapter {
  // Vendor operations
  getVendor(vendorId: string): Promise<VendorStore | null>;
  getAllVendors(): Promise<VendorStore[]>;
  updateVendor(vendorId: string, updates: any): Promise<VendorStore>;

  // Product operations
  getProduct(productId: string): Promise<EnhancedProduct | null>;
  getVendorProducts(vendorId: string): Promise<EnhancedProduct[]>;
  getAllProducts(): Promise<EnhancedProduct[]>;
  updateProduct(productId: string, vendorId: string, updates: any): Promise<EnhancedProduct>;
  createProduct(vendorId: string, product: any): Promise<EnhancedProduct>;
  deleteProduct(vendorId: string, productId: string): Promise<boolean>;

  // Search operations
  searchProducts(query: string, filters?: any): Promise<EnhancedProduct[]>;
}

// JSON-based adapter (existing system)
const jsonAdapter: DataAdapter = {
  async getVendor(vendorId: string) {
    return vendorDataService.vendor.getVendor(vendorId);
  },

  async getAllVendors() {
    return vendorDataService.vendor.getAllVendors();
  },

  async updateVendor(vendorId: string, updates: any) {
    return vendorDataService.vendor.updateVendor({ vendorId, updates });
  },

  async getProduct(productId: string) {
    return vendorDataService.product.getProduct(productId);
  },

  async getVendorProducts(vendorId: string) {
    return vendorDataService.product.getVendorProducts(vendorId);
  },

  async getAllProducts() {
    const vendors = await vendorDataService.vendor.getAllVendors();
    return vendors.flatMap(v => v.products);
  },

  async updateProduct(productId: string, vendorId: string, updates: any) {
    return vendorDataService.product.updateProduct({ productId, vendorId, updates });
  },

  async createProduct(vendorId: string, product: any) {
    return vendorDataService.product.createProduct(vendorId, product);
  },

  async deleteProduct(vendorId: string, productId: string) {
    return vendorDataService.product.deleteProduct(vendorId, productId);
  },

  async searchProducts(queryStr: string, filters?: any) {
    return vendorDataService.search.searchProducts(queryStr, filters);
  }
};

// Database adapter (PostgreSQL)
const databaseAdapter: DataAdapter = {
  async getVendor(vendorId: string) {
    try {
      const { rows } = await query(`SELECT * FROM vendors WHERE id = $1`, [vendorId]);
      const dbVendor = rows[0];
      if (!dbVendor) return null;

      // Get products for this vendor
      const { rows: products } = await query(
        `SELECT * FROM products WHERE vendor_id = $1`,
        [vendorId]
      );
      return transformDbVendorToStore(dbVendor, products);
    } catch (error) {
      console.error('Database adapter getVendor error:', error);
      return null;
    }
  },

  async getAllVendors() {
    try {
      const { rows: dbVendors } = await query(`SELECT * FROM vendors`);
      const vendorStores = [];

      for (const vendor of dbVendors) {
        const { rows: products } = await query(
          `SELECT * FROM products WHERE vendor_id = $1`,
          [vendor.id]
        );
        vendorStores.push(transformDbVendorToStore(vendor, products));
      }

      return vendorStores;
    } catch (error) {
      console.error('Database adapter getAllVendors error:', error);
      return [];
    }
  },

  async updateVendor(vendorId: string, updates: any) {
    try {
      const { rows } = await query(
        `UPDATE vendors SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          updated_at = NOW()
        WHERE id = $3
        RETURNING *`,
        [updates.name, updates.description, vendorId]
      );
      const { rows: products } = await query(
        `SELECT * FROM products WHERE vendor_id = $1`,
        [vendorId]
      );
      return transformDbVendorToStore(rows[0], products);
    } catch (error) {
      console.error('Database adapter updateVendor error:', error);
      throw error;
    }
  },

  async getProduct(productId: string) {
    try {
      const { rows } = await query(`SELECT * FROM products WHERE id = $1`, [productId]);
      return rows[0] ? transformDbProductToEnhanced(rows[0]) : null;
    } catch (error) {
      console.error('Database adapter getProduct error:', error);
      return null;
    }
  },

  async getVendorProducts(vendorId: string) {
    try {
      const { rows } = await query(
        `SELECT * FROM products WHERE vendor_id = $1`,
        [vendorId]
      );
      return rows.map(transformDbProductToEnhanced);
    } catch (error) {
      console.error('Database adapter getVendorProducts error:', error);
      return [];
    }
  },

  async getAllProducts() {
    try {
      const { rows } = await query(`SELECT * FROM products`);
      return rows.map(transformDbProductToEnhanced);
    } catch (error) {
      console.error('Database adapter getAllProducts error:', error);
      return [];
    }
  },

  async updateProduct(productId: string, vendorId: string, updates: any) {
    try {
      const { rows } = await query(
        `UPDATE products SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          updated_at = NOW()
        WHERE id = $4
        RETURNING *`,
        [updates.name, updates.description, updates.price, productId]
      );
      return transformDbProductToEnhanced(rows[0]);
    } catch (error) {
      console.error('Database adapter updateProduct error:', error);
      throw error;
    }
  },

  async createProduct(vendorId: string, product: any) {
    try {
      const { rows } = await query(
        `INSERT INTO products (vendor_id, name, description, price, category, in_stock, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *`,
        [vendorId, product.name, product.description, product.price, product.category, product.inStock]
      );
      return transformDbProductToEnhanced(rows[0]);
    } catch (error) {
      console.error('Database adapter createProduct error:', error);
      throw error;
    }
  },

  async deleteProduct(vendorId: string, productId: string) {
    try {
      await query(`DELETE FROM products WHERE id = $1 AND vendor_id = $2`, [productId, vendorId]);
      return true;
    } catch (error) {
      console.error('Database adapter deleteProduct error:', error);
      return false;
    }
  },

  async searchProducts(queryStr: string, filters?: any) {
    try {
      let sqlQuery = `SELECT * FROM products WHERE 1=1`;
      const params: any[] = [];
      let paramCount = 0;

      if (queryStr) {
        paramCount++;
        sqlQuery += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        params.push(`%${queryStr}%`);
      }

      if (filters?.category) {
        paramCount++;
        sqlQuery += ` AND category = $${paramCount}`;
        params.push(filters.category);
      }

      if (filters?.vendorId) {
        paramCount++;
        sqlQuery += ` AND vendor_id = $${paramCount}`;
        params.push(filters.vendorId);
      }

      const { rows } = await query(sqlQuery, params);
      return rows.map(transformDbProductToEnhanced);
    } catch (error) {
      console.error('Database adapter searchProducts error:', error);
      return [];
    }
  }
};

// Transform functions
function transformDbVendorToStore(dbVendor: any, products: any[]): VendorStore {
  return {
    id: dbVendor.id,
    name: dbVendor.name,
    slug: dbVendor.slug,
    branding: {
      logo: dbVendor.logo_url || dbVendor.logo || '',
      banner: dbVendor.banner_url || dbVendor.banner,
      colors: {
        primary: dbVendor.primary_color || '#478c0b',
        secondary: dbVendor.secondary_color || '#f6af0d',
        accent: dbVendor.accent_color || '#c23c09'
      }
    },
    info: {
      description: dbVendor.description,
      shortDescription: dbVendor.short_description,
      established: dbVendor.established_year,
      location: dbVendor.location,
      contactEmail: dbVendor.email,
      contactPhone: dbVendor.phone
    },
    imageBuckets: {
      logo: `/images/vendors/${dbVendor.id}/logo/`,
      banners: [`/images/vendors/${dbVendor.id}/banners/`],
      gallery: [`/images/vendors/${dbVendor.id}/gallery/`],
      team: [`/images/vendors/${dbVendor.id}/team/`],
      certificates: [`/images/vendors/${dbVendor.id}/certificates/`],
      promotional: [`/images/vendors/${dbVendor.id}/promotional/`],
      storefront: [`/images/vendors/${dbVendor.id}/storefront/`]
    },
    settings: {
      theme: dbVendor.theme,
      layout: dbVendor.layout,
      features: dbVendor.features || [],
      paymentMethods: dbVendor.payment_methods || [],
      shippingMethods: dbVendor.shipping_methods || [],
      returnPolicy: dbVendor.return_policy,
      minimumOrder: dbVendor.minimum_order
    },
    products: products.map(transformDbProductToEnhanced),
    productCount: products.length,
    seo: {
      metaTitle: `${dbVendor.name} | KFAR Marketplace`,
      metaDescription: dbVendor.short_description || dbVendor.description?.substring(0, 160)
    },
    analytics: {
      totalSales: dbVendor.total_sales,
      averageRating: dbVendor.average_rating,
      reviewCount: dbVendor.review_count,
      followerCount: dbVendor.follower_count
    },
    tags: dbVendor.tags || [],
    categories: []
  };
}

function transformDbProductToEnhanced(dbProduct: any): EnhancedProduct {
  return {
    id: dbProduct.id,
    sku: dbProduct.sku,
    slug: dbProduct.slug,
    vendorId: dbProduct.vendor_id,
    vendorName: dbProduct.vendor_name || '',

    name: dbProduct.name,
    nameHe: dbProduct.name_he,
    description: dbProduct.description || '',
    shortDescription: dbProduct.short_description,
    longDescription: dbProduct.long_description,

    category: dbProduct.category,
    subcategory: dbProduct.subcategory,
    tags: dbProduct.tags || [],

    price: Number(dbProduct.price),
    originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,

    image: dbProduct.image || dbProduct.primary_image || '',
    images: dbProduct.images || dbProduct.image_gallery || [],
    imageBucket: {
      primary: dbProduct.image || dbProduct.primary_image || '',
      gallery: dbProduct.images || dbProduct.image_gallery || [],
      thumbnails: dbProduct.thumbnails || []
    },

    inStock: dbProduct.in_stock,
    status: dbProduct.status as any,

    isVegan: dbProduct.is_vegan,
    isKosher: dbProduct.is_kosher,

    features: dbProduct.features || [],
    benefits: dbProduct.benefits || [],

    metaTitle: dbProduct.meta_title,
    metaDescription: dbProduct.meta_description,
    metaKeywords: dbProduct.meta_keywords || [],

    nutritionalInfo: dbProduct.nutritional_info,

    viewCount: dbProduct.view_count,
    purchaseCount: dbProduct.purchase_count,
    rating: dbProduct.rating,
    reviewCount: dbProduct.review_count,
    popularityScore: (dbProduct.view_count || 0) + ((dbProduct.purchase_count || 0) * 10),

    publishedAt: dbProduct.published_at,
    updatedAt: dbProduct.updated_at
  };
}

// Export the appropriate adapter based on configuration
export const dataAdapter: DataAdapter = USE_DATABASE ? databaseAdapter : jsonAdapter;

// Helper to check if database is enabled
export function isDatabaseEnabled(): boolean {
  return USE_DATABASE;
}

// Helper to switch data source (for migration testing)
export function switchDataSource(useDatabase: boolean) {
  if (typeof window !== 'undefined') {
    console.warn('Data source switching should only be done server-side');
    return;
  }

  process.env.USE_DATABASE = useDatabase ? 'true' : 'false';
}
