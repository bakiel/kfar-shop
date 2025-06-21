/**
 * Vendor Data Management Service
 * 
 * WordPress-style data service for managing vendor stores and products
 * Provides CRUD operations and data consistency
 */

import { VendorStore, EnhancedProduct, vendorStores, getVendorStore, getAllProducts } from '@/lib/data/wordpress-style-data-layer';
import { productEnrichmentService } from './product-enrichment-service';
import { getVendorImagePaths, getProductImage, getVendorLogo } from '@/lib/utils/vendor-bucket-manager';

export interface VendorDataUpdate {
  vendorId: string;
  updates: Partial<VendorStore>;
}

export interface ProductDataUpdate {
  productId: string;
  vendorId: string;
  updates: Partial<EnhancedProduct>;
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

// Vendor CRUD operations
export const vendorDataService = {
  // Get vendor with enriched data
  async getVendor(vendorId: string): Promise<VendorStore | null> {
    const vendor = getVendorStore(vendorId);
    if (!vendor) return null;
    
    // Enrich vendor data
    return {
      ...vendor,
      imageBuckets: {
        ...vendor.imageBuckets,
        // Add actual image paths
        logo: getVendorLogo(vendorId),
        paths: getVendorImagePaths(vendorId)
      }
    };
  },
  
  // Get all vendors
  async getAllVendors(): Promise<VendorStore[]> {
    return Object.values(vendorStores);
  },
  
  // Update vendor information
  async updateVendor(update: VendorDataUpdate): Promise<VendorStore> {
    const vendor = vendorStores[update.vendorId];
    if (!vendor) {
      throw new Error(`Vendor ${update.vendorId} not found`);
    }
    
    // Deep merge updates
    const updatedVendor = deepMerge(vendor, update.updates);
    vendorStores[update.vendorId] = updatedVendor;
    
    // In production, this would save to database
    console.log(`Updated vendor ${update.vendorId}`, updatedVendor);
    
    return updatedVendor;
  },
  
  // Get vendor analytics
  async getVendorAnalytics(vendorId: string): Promise<VendorAnalytics> {
    const vendor = getVendorStore(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }
    
    const activeProducts = vendor.products.filter(p => p.status === 'published');
    const topProducts = [...vendor.products]
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
      .slice(0, 5);
    
    return {
      vendorId,
      totalProducts: vendor.products.length,
      activeProducts: activeProducts.length,
      totalViews: vendor.products.reduce((sum, p) => sum + (p.viewCount || 0), 0),
      totalSales: vendor.products.reduce((sum, p) => sum + (p.purchaseCount || 0), 0),
      averageRating: vendor.analytics.averageRating || 0,
      topProducts,
      recentActivity: [] // Would be populated from activity log
    };
  }
};

// Product CRUD operations
export const productDataService = {
  // Get product with enriched data
  async getProduct(productId: string): Promise<EnhancedProduct | null> {
    for (const vendor of Object.values(vendorStores)) {
      const product = vendor.products.find(p => p.id === productId);
      if (product) {
        // Enrich with vision data if needed
        return await productEnrichmentService.enrichProduct(product);
      }
    }
    return null;
  },
  
  // Get products by vendor
  async getVendorProducts(vendorId: string): Promise<EnhancedProduct[]> {
    const vendor = vendorStores[vendorId];
    if (!vendor) return [];
    
    // Enrich all products
    return await productEnrichmentService.enrichVendorProducts(vendorId, vendor.products);
  },
  
  // Update product
  async updateProduct(update: ProductDataUpdate): Promise<EnhancedProduct> {
    const vendor = vendorStores[update.vendorId];
    if (!vendor) {
      throw new Error(`Vendor ${update.vendorId} not found`);
    }
    
    const productIndex = vendor.products.findIndex(p => p.id === update.productId);
    if (productIndex === -1) {
      throw new Error(`Product ${update.productId} not found`);
    }
    
    // Update product
    const updatedProduct = {
      ...vendor.products[productIndex],
      ...update.updates,
      updatedAt: new Date(),
      version: (vendor.products[productIndex].version || 0) + 1
    };
    
    vendor.products[productIndex] = updatedProduct;
    
    // In production, this would save to database
    console.log(`Updated product ${update.productId}`, updatedProduct);
    
    return updatedProduct;
  },
  
  // Create new product
  async createProduct(vendorId: string, productData: Partial<EnhancedProduct>): Promise<EnhancedProduct> {
    const vendor = vendorStores[vendorId];
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }
    
    // Generate ID
    const productId = `${vendorId}-${Date.now()}`;
    
    // Create product with defaults
    const newProduct: EnhancedProduct = {
      id: productId,
      name: productData.name || 'New Product',
      description: productData.description || '',
      price: productData.price || 0,
      category: productData.category || 'uncategorized',
      subcategory: productData.subcategory || 'general',
      image: getProductImage(vendorId, productId),
      vendorId,
      vendorName: vendor.name,
      isVegan: true,
      isKosher: true,
      inStock: true,
      status: 'draft',
      publishedAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      ...productData
    };
    
    // Enrich with vision if image provided
    const enrichedProduct = await productEnrichmentService.enrichProduct(newProduct);
    
    // Add to vendor
    vendor.products.push(enrichedProduct);
    vendor.productCount = vendor.products.length;
    
    return enrichedProduct;
  },
  
  // Delete product
  async deleteProduct(vendorId: string, productId: string): Promise<boolean> {
    const vendor = vendorStores[vendorId];
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }
    
    const productIndex = vendor.products.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return false;
    }
    
    // Remove product
    vendor.products.splice(productIndex, 1);
    vendor.productCount = vendor.products.length;
    
    return true;
  },
  
  // Bulk operations
  async bulkUpdateProducts(updates: ProductDataUpdate[]): Promise<EnhancedProduct[]> {
    const results = [];
    
    for (const update of updates) {
      try {
        const updated = await this.updateProduct(update);
        results.push(updated);
      } catch (error) {
        console.error(`Failed to update product ${update.productId}:`, error);
      }
    }
    
    return results;
  }
};

// Search and filter service
export const searchService = {
  // Search products across all vendors
  async searchProducts(query: string, filters?: {
    vendorId?: string;
    category?: string;
    subcategory?: string;
    tags?: string[];
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
  }): Promise<EnhancedProduct[]> {
    let products = getAllProducts();
    
    // Apply search query
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.nameHe?.toLowerCase().includes(lowercaseQuery) ||
        product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.vendorId) {
        products = products.filter(p => p.vendorId === filters.vendorId);
      }
      if (filters.category) {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.subcategory) {
        products = products.filter(p => p.subcategory === filters.subcategory);
      }
      if (filters.tags?.length) {
        products = products.filter(p => 
          filters.tags!.some(tag => p.tags?.includes(tag))
        );
      }
      if (filters.priceMin !== undefined) {
        products = products.filter(p => p.price >= filters.priceMin!);
      }
      if (filters.priceMax !== undefined) {
        products = products.filter(p => p.price <= filters.priceMax!);
      }
      if (filters.inStock !== undefined) {
        products = products.filter(p => p.inStock === filters.inStock);
      }
    }
    
    return products;
  },
  
  // Get product recommendations
  async getRecommendations(productId: string, limit: number = 6): Promise<EnhancedProduct[]> {
    const product = await productDataService.getProduct(productId);
    if (!product) return [];
    
    // Get products from same category
    let recommendations = await this.searchProducts('', {
      category: product.category,
      inStock: true
    });
    
    // Remove current product
    recommendations = recommendations.filter(p => p.id !== productId);
    
    // Sort by popularity and similarity
    recommendations.sort((a, b) => {
      // Prioritize same vendor
      if (a.vendorId === product.vendorId && b.vendorId !== product.vendorId) return -1;
      if (b.vendorId === product.vendorId && a.vendorId !== product.vendorId) return 1;
      
      // Then by popularity
      return (b.popularityScore || 0) - (a.popularityScore || 0);
    });
    
    return recommendations.slice(0, limit);
  }
};

// Helper function for deep merge
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Export all services
export default {
  vendor: vendorDataService,
  product: productDataService,
  search: searchService
};