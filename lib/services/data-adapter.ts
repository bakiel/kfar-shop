/**
 * Data Adapter Service
 * Provides abstraction layer to switch between JSON files and database
 * Ensures backward compatibility while enabling gradual migration
 */

import { VendorStore, EnhancedProduct } from '@/lib/data/wordpress-style-data-layer';
import vendorDataService from '@/lib/services/vendor-data-service';
import { vendorDb, productDb } from '@/lib/db/supabase-database';

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
  
  async searchProducts(query: string, filters?: any) {
    return vendorDataService.search.searchProducts(query, filters);
  }
};

// Database adapter (new system)
const databaseAdapter: DataAdapter = {
  async getVendor(vendorId: string) {
    const dbVendor = await vendorDb.getById(vendorId);
    if (!dbVendor) return null;
    
    // Transform to VendorStore format
    const products = await productDb.getAll({ vendorId });
    return transformDbVendorToStore(dbVendor, products);
  },
  
  async getAllVendors() {
    const dbVendors = await vendorDb.getAll();
    const vendorStores = [];
    
    for (const vendor of dbVendors) {
      const products = await productDb.getAll({ vendorId: vendor.id });
      vendorStores.push(transformDbVendorToStore(vendor, products));
    }
    
    return vendorStores;
  },
  
  async updateVendor(vendorId: string, updates: any) {
    const updated = await vendorDb.update(vendorId, updates);
    const products = await productDb.getAll({ vendorId });
    return transformDbVendorToStore(updated, products);
  },
  
  async getProduct(productId: string) {
    const dbProduct = await productDb.getById(productId);
    return dbProduct ? transformDbProductToEnhanced(dbProduct) : null;
  },
  
  async getVendorProducts(vendorId: string) {
    const dbProducts = await productDb.getAll({ vendorId });
    return dbProducts.map(transformDbProductToEnhanced);
  },
  
  async getAllProducts() {
    const dbProducts = await productDb.getAll();
    return dbProducts.map(transformDbProductToEnhanced);
  },
  
  async updateProduct(productId: string, vendorId: string, updates: any) {
    const updated = await productDb.update(productId, updates);
    return transformDbProductToEnhanced(updated);
  },
  
  async createProduct(vendorId: string, product: any) {
    const created = await productDb.create({ ...product, vendorId });
    return transformDbProductToEnhanced(created);
  },
  
  async deleteProduct(vendorId: string, productId: string) {
    return productDb.delete(productId);
  },
  
  async searchProducts(query: string, filters?: any) {
    const dbProducts = await productDb.getAll(filters);
    const products = dbProducts.map(transformDbProductToEnhanced);
    
    // Apply text search if query provided
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      return products.filter(p => 
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.description?.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    return products;
  }
};

// Transform functions
function transformDbVendorToStore(dbVendor: any, products: any[]): VendorStore {
  return {
    id: dbVendor.id,
    name: dbVendor.name,
    slug: dbVendor.slug,
    branding: {
      logo: dbVendor.logoUrl || '',
      banner: dbVendor.bannerUrl,
      colors: {
        primary: dbVendor.primaryColor || '#478c0b',
        secondary: dbVendor.secondaryColor || '#f6af0d',
        accent: dbVendor.accentColor || '#c23c09'
      }
    },
    info: {
      description: dbVendor.description,
      shortDescription: dbVendor.shortDescription,
      established: dbVendor.establishedYear,
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
      paymentMethods: dbVendor.paymentMethods || [],
      shippingMethods: dbVendor.shippingMethods || [],
      returnPolicy: dbVendor.returnPolicy,
      minimumOrder: dbVendor.minimumOrder
    },
    products: products.map(transformDbProductToEnhanced),
    productCount: products.length,
    seo: {
      metaTitle: `${dbVendor.name} | KiFar Marketplace`,
      metaDescription: dbVendor.shortDescription || dbVendor.description?.substring(0, 160)
    },
    analytics: {
      totalSales: dbVendor.totalSales,
      averageRating: dbVendor.averageRating,
      reviewCount: dbVendor.reviewCount,
      followerCount: dbVendor.followerCount
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
    vendorId: dbProduct.vendorId,
    vendorName: dbProduct.vendorName || '',
    
    name: dbProduct.name,
    nameHe: dbProduct.nameHe,
    description: dbProduct.description || '',
    shortDescription: dbProduct.shortDescription,
    longDescription: dbProduct.longDescription,
    
    category: dbProduct.category,
    subcategory: dbProduct.subcategory,
    tags: dbProduct.tags || [],
    
    price: Number(dbProduct.price),
    originalPrice: dbProduct.originalPrice ? Number(dbProduct.originalPrice) : undefined,
    
    image: dbProduct.primaryImage || '',
    images: dbProduct.imageGallery || [],
    imageBucket: {
      primary: dbProduct.primaryImage || '',
      gallery: dbProduct.imageGallery || [],
      thumbnails: dbProduct.thumbnails || []
    },
    
    inStock: dbProduct.inStock,
    status: dbProduct.status as any,
    
    isVegan: dbProduct.isVegan,
    isKosher: dbProduct.isKosher,
    
    features: dbProduct.features || [],
    benefits: dbProduct.benefits || [],
    
    metaTitle: dbProduct.metaTitle,
    metaDescription: dbProduct.metaDescription,
    metaKeywords: dbProduct.metaKeywords || [],
    
    nutritionalInfo: dbProduct.nutritionalInfo,
    
    viewCount: dbProduct.viewCount,
    purchaseCount: dbProduct.purchaseCount,
    rating: dbProduct.rating,
    reviewCount: dbProduct.reviewCount,
    popularityScore: dbProduct.viewCount + (dbProduct.purchaseCount * 10),
    
    publishedAt: dbProduct.publishedAt,
    updatedAt: dbProduct.updatedAt
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