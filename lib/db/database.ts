/**
 * Database Connection and Query Builder
 * Provides database abstraction layer for KiFar Marketplace
 */

import { Pool } from 'pg';
import { Vendor, Product } from './schema';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kfar_marketplace',
  user: process.env.DB_USER || 'kfar_user',
  password: process.env.DB_PASSWORD || 'kfar_password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Database query helper
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Vendor CRUD operations
export const vendorDb = {
  // Get all vendors
  async getAll(filters?: {
    status?: string;
    featured?: boolean;
    verified?: boolean;
  }): Promise<Vendor[]> {
    let sql = 'SELECT * FROM vendors WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.status) {
      sql += ` AND status = $${++paramCount}`;
      params.push(filters.status);
    }
    if (filters?.featured !== undefined) {
      sql += ` AND featured = $${++paramCount}`;
      params.push(filters.featured);
    }
    if (filters?.verified !== undefined) {
      sql += ` AND verified = $${++paramCount}`;
      params.push(filters.verified);
    }

    sql += ' ORDER BY created_at DESC';
    const { rows } = await query<Vendor>(sql, params);
    return rows;
  },

  // Get vendor by ID
  async getById(id: string): Promise<Vendor | null> {
    const { rows } = await query<Vendor>(
      'SELECT * FROM vendors WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  // Create vendor
  async create(vendor: Partial<Vendor>): Promise<Vendor> {
    const {
      id, name, slug, email, phone, logoUrl, bannerUrl,
      description, shortDescription, location, status = 'pending'
    } = vendor;

    const { rows } = await query<Vendor>(
      `INSERT INTO vendors (
        id, name, slug, email, phone, logo_url, banner_url,
        description, short_description, location, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [id, name, slug, email, phone, logoUrl, bannerUrl,
       description, shortDescription, location, status]
    );
    return rows[0];
  },

  // Update vendor
  async update(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        // Convert camelCase to snake_case
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbKey} = $${++paramCount}`);
        params.push(value);
      }
    });

    params.push(id);
    const sql = `
      UPDATE vendors 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const { rows } = await query<Vendor>(sql, params);
    return rows[0];
  },

  // Delete vendor
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query(
      'DELETE FROM vendors WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },

  // Get vendor analytics
  async getAnalytics(vendorId: string, startDate: Date, endDate: Date) {
    const { rows } = await query(
      `SELECT 
        date,
        SUM(views) as views,
        SUM(unique_visitors) as unique_visitors,
        SUM(products_viewed) as products_viewed,
        SUM(add_to_cart_count) as add_to_cart_count,
        SUM(checkout_count) as checkout_count,
        SUM(revenue) as revenue
      FROM vendor_analytics
      WHERE vendor_id = $1 AND date BETWEEN $2 AND $3
      GROUP BY date
      ORDER BY date`,
      [vendorId, startDate, endDate]
    );
    return rows;
  }
};

// Product CRUD operations
export const productDb = {
  // Get all products
  async getAll(filters?: {
    vendorId?: string;
    category?: string;
    status?: string;
    inStock?: boolean;
    search?: string;
  }): Promise<Product[]> {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.vendorId) {
      sql += ` AND vendor_id = $${++paramCount}`;
      params.push(filters.vendorId);
    }
    if (filters?.category) {
      sql += ` AND category = $${++paramCount}`;
      params.push(filters.category);
    }
    if (filters?.status) {
      sql += ` AND status = $${++paramCount}`;
      params.push(filters.status);
    }
    if (filters?.inStock !== undefined) {
      sql += ` AND in_stock = $${++paramCount}`;
      params.push(filters.inStock);
    }
    if (filters?.search) {
      sql += ` AND (name ILIKE $${++paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const { rows } = await query<Product>(sql, params);
    return rows;
  },

  // Get product by ID
  async getById(id: string): Promise<Product | null> {
    const { rows } = await query<Product>(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  // Create product
  async create(product: Partial<Product>): Promise<Product> {
    const {
      id, vendorId, name, nameHe, description, category, subcategory,
      price, originalPrice, inStock = true, status = 'draft',
      primaryImage, tags = [], isVegan = true, isKosher = true
    } = product;

    const { rows } = await query<Product>(
      `INSERT INTO products (
        id, vendor_id, name, name_he, description, category, subcategory,
        price, original_price, in_stock, status, primary_image, tags,
        is_vegan, is_kosher, slug
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        id, vendorId, name, nameHe, description, category, subcategory,
        price, originalPrice, inStock, status, primaryImage, tags,
        isVegan, isKosher, name.toLowerCase().replace(/\s+/g, '-')
      ]
    );
    return rows[0];
  },

  // Update product
  async update(id: string, updates: Partial<Product>): Promise<Product> {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbKey} = $${++paramCount}`);
        params.push(value);
      }
    });

    params.push(id);
    const sql = `
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING *
    `;

    const { rows } = await query<Product>(sql, params);
    return rows[0];
  },

  // Delete product
  async delete(id: string): Promise<boolean> {
    const { rowCount } = await query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  },

  // Bulk update products
  async bulkUpdate(updates: Array<{ id: string; updates: Partial<Product> }>) {
    return transaction(async (client) => {
      const results = [];
      for (const update of updates) {
        const result = await this.update(update.id, update.updates);
        results.push(result);
      }
      return results;
    });
  },

  // Update stock
  async updateStock(productId: string, quantity: number): Promise<void> {
    await query(
      `UPDATE products 
       SET stock_quantity = $1, 
           in_stock = $1 > 0
       WHERE id = $2`,
      [quantity, productId]
    );
  },

  // Track analytics
  async trackView(productId: string): Promise<void> {
    await query(
      'UPDATE products SET view_count = view_count + 1 WHERE id = $1',
      [productId]
    );
    
    // Also update daily analytics
    await query(
      `INSERT INTO product_analytics (product_id, date, views)
       VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (product_id, date)
       DO UPDATE SET views = product_analytics.views + 1`,
      [productId]
    );
  }
};

// Audit logging
export async function logAudit(
  vendorId: string,
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  changes?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await query(
    `INSERT INTO vendor_audit_log 
     (vendor_id, user_id, action, entity_type, entity_id, changes, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [vendorId, userId, action, entityType, entityId, JSON.stringify(changes), ipAddress, userAgent]
  );
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if tables exist
    const { rows } = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendors'
      )`
    );

    if (!rows[0].exists) {
      console.log('Creating database schema...');
      const { schema } = await import('./schema');
      await query(schema);
      console.log('Database schema created successfully');
    } else {
      console.log('Database schema already exists');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Export pool for direct access if needed
export { pool };