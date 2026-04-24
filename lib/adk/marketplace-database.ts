// Marketplace Database Service
// Connects to the actual database to fetch real vendor and product data

import { Pool } from 'pg';
import { FALLBACK_MARKETPLACE_DATA } from './marketplace-fallback';

// Database connection - only create if DATABASE_URL exists
const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

export interface VendorData {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  is_active: boolean;
  contact_email: string;
  contact_phone: string;
  address: string;
  product_count?: number;
}

export interface ProductData {
  id: string;
  vendor_id: string;
  vendor_name: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  image_path: string;
  in_stock: boolean;
  is_vegan: boolean;
  is_kosher: boolean;
  is_organic: boolean;
  is_gluten_free: boolean;
  tags: string[];
}

export class MarketplaceDatabase {
  // Get all active vendors with product counts
  async getVendors(): Promise<VendorData[]> {
    if (!pool) {
      console.warn('Database not connected, using fallback data');
      return FALLBACK_MARKETPLACE_DATA.vendors;
    }
    
    try {
      // First try the correct query, if it fails, use a simpler one
      try {
        const result = await pool.query(`
          SELECT 
            v.*,
            COUNT(p.id) as product_count
          FROM vendors v
          LEFT JOIN products p ON v.id = p.vendor_id::text AND p.in_stock = true
          WHERE v.is_active = true
          GROUP BY v.id
          ORDER BY v.name
        `);
        
        return result.rows;
      } catch (error) {
        // If the join fails, just get vendors without product count
        console.warn('Complex query failed, trying simple query');
        const result = await pool.query(`
          SELECT * FROM vendors WHERE is_active = true ORDER BY name
        `);
        
        return result.rows.map(v => ({ ...v, product_count: 0 }));
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      return FALLBACK_MARKETPLACE_DATA.vendors;
    }
  }
  
  // Get vendor by slug or name
  async getVendorBySlug(slug: string): Promise<VendorData | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM vendors WHERE slug = $1 OR LOWER(name) = LOWER($1) AND is_active = true',
        [slug]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      return null;
    }
  }
  
  // Search products by query
  async searchProducts(query: string, limit: number = 10): Promise<ProductData[]> {
    try {
      const searchTerm = `%${query}%`;
      const result = await pool.query(`
        SELECT 
          p.*,
          v.name as vendor_name
        FROM products p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE 
          p.in_stock = true AND
          (
            LOWER(p.name) LIKE LOWER($1) OR
            LOWER(p.description) LIKE LOWER($1) OR
            LOWER(p.category) LIKE LOWER($1) OR
            LOWER(v.name) LIKE LOWER($1)
          )
        ORDER BY 
          CASE 
            WHEN LOWER(p.name) LIKE LOWER($1) THEN 1
            WHEN LOWER(v.name) LIKE LOWER($1) THEN 2
            ELSE 3
          END,
          p.name
        LIMIT $2
      `, [searchTerm, limit]);
      
      return result.rows.map(row => ({
        ...row,
        tags: row.tags || []
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
  
  // Get products by vendor
  async getVendorProducts(vendorId: string): Promise<ProductData[]> {
    try {
      const result = await pool.query(`
        SELECT 
          p.*,
          v.name as vendor_name
        FROM products p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE 
          p.vendor_id = $1 AND
          p.in_stock = true
        ORDER BY p.name
      `, [vendorId]);
      
      return result.rows.map(row => ({
        ...row,
        tags: row.tags || []
      }));
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      return [];
    }
  }
  
  // Get products by category
  async getProductsByCategory(category: string): Promise<ProductData[]> {
    try {
      const result = await pool.query(`
        SELECT 
          p.*,
          v.name as vendor_name
        FROM products p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE 
          LOWER(p.category) = LOWER($1) AND
          p.in_stock = true
        ORDER BY p.name
      `, [category]);
      
      return result.rows.map(row => ({
        ...row,
        tags: row.tags || []
      }));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }
  
  // Get featured/popular products
  async getFeaturedProducts(limit: number = 6): Promise<ProductData[]> {
    try {
      const result = await pool.query(`
        SELECT 
          p.*,
          v.name as vendor_name
        FROM products p
        JOIN vendors v ON p.vendor_id = v.id
        WHERE p.in_stock = true
        ORDER BY 
          CASE 
            WHEN p.tags::text LIKE '%featured%' THEN 1
            WHEN p.tags::text LIKE '%popular%' THEN 2
            WHEN p.tags::text LIKE '%best-seller%' THEN 3
            ELSE 4
          END,
          p.price DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows.map(row => ({
        ...row,
        tags: row.tags || []
      }));
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }
  
  // Get product statistics
  async getMarketplaceStats() {
    if (!pool) {
      console.warn('Database not connected, using fallback data');
      return FALLBACK_MARKETPLACE_DATA.stats;
    }
    
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(DISTINCT v.id) as vendor_count,
          COUNT(DISTINCT p.id) as product_count,
          COUNT(DISTINCT p.category) as category_count,
          AVG(p.price) as avg_price
        FROM vendors v
        LEFT JOIN products p ON v.id = p.vendor_id
        WHERE v.is_active = true AND p.in_stock = true
      `);
      
      return stats.rows[0];
    } catch (error) {
      console.error('Error fetching stats:', error);
      return FALLBACK_MARKETPLACE_DATA.stats;
    }
  }
}

// Export singleton instance
export const marketplaceDB = new MarketplaceDatabase();
