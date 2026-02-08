import { Pool, PoolClient } from 'pg';

// PostgreSQL connection pool for KFAR Marketplace
// Migrated from Supabase to Hostinger VPS

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '72.61.201.237',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'kfar_marketplace',
  user: process.env.POSTGRES_USER || 'kfar',
  password: process.env.POSTGRES_PASSWORD || 'kfar_secure_2025',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 800,
});

// Fast DB availability check -- caches result for 60s to avoid repeated timeouts
let _dbAvailable: boolean | null = null;
let _dbCheckTime = 0;
const DB_CHECK_TTL = 60_000; // 60 seconds

export async function isDbAvailable(): Promise<boolean> {
  if (_dbAvailable !== null && Date.now() - _dbCheckTime < DB_CHECK_TTL) {
    return _dbAvailable;
  }
  try {
    await pool.query('SELECT 1');
    _dbAvailable = true;
  } catch {
    _dbAvailable = false;
  }
  _dbCheckTime = Date.now();
  return _dbAvailable;
}

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected to kfar_marketplace');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

// Query helper with proper typing
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  // Skip DB if we already know it's unreachable (avoids repeated timeouts)
  if (_dbAvailable === false && Date.now() - _dbCheckTime < DB_CHECK_TTL) {
    throw new Error('Database unavailable (cached)');
  }
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    _dbAvailable = true;
    _dbCheckTime = Date.now();
    if (duration > 100) {
      console.log(`Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return { rows: result.rows, rowCount: result.rowCount || 0 };
  } catch (error) {
    // Mark DB unavailable on connection errors
    if ((error as any)?.code === 'ECONNREFUSED' || (error as any)?.message?.includes('timeout')) {
      _dbAvailable = false;
      _dbCheckTime = Date.now();
    }
    throw error;
  }
}

// Get a client for transactions
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Transaction helper
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
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

// Database service object (similar to Supabase API pattern)
export const db = {
  // Vendors
  vendors: {
    async findAll() {
      const { rows } = await query('SELECT * FROM vendors WHERE is_active = true ORDER BY name');
      return rows;
    },
    async findById(id: string) {
      const { rows } = await query('SELECT * FROM vendors WHERE id = $1', [id]);
      return rows[0] || null;
    },
    async findBySlug(slug: string) {
      const { rows } = await query('SELECT * FROM vendors WHERE slug = $1', [slug]);
      return rows[0] || null;
    },
    async findByEmail(email: string) {
      const { rows } = await query('SELECT * FROM vendors WHERE email = $1', [email]);
      return rows[0] || null;
    },
    async create(data: any) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await query(
        `INSERT INTO vendors (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    },
    async update(id: string, data: any) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const { rows } = await query(
        `UPDATE vendors SET ${sets} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return rows[0];
    }
  },

  // Products
  products: {
    async findAll(vendorId?: string) {
      if (vendorId) {
        const { rows } = await query(
          'SELECT * FROM products WHERE vendor_id = $1 AND status = $2 ORDER BY name',
          [vendorId, 'published']
        );
        return rows;
      }
      const { rows } = await query("SELECT * FROM products WHERE status = 'published' ORDER BY name");
      return rows;
    },
    async findById(id: string) {
      const { rows } = await query('SELECT * FROM products WHERE id = $1', [id]);
      return rows[0] || null;
    },
    async findByCategory(category: string) {
      const { rows } = await query(
        "SELECT * FROM products WHERE category = $1 AND status = 'published' ORDER BY name",
        [category]
      );
      return rows;
    },
    async create(data: any) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await query(
        `INSERT INTO products (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    },
    async update(id: string, data: any) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const { rows } = await query(
        `UPDATE products SET ${sets} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return rows[0];
    },
    async incrementViews(id: string) {
      await query('UPDATE products SET view_count = view_count + 1 WHERE id = $1', [id]);
    }
  },

  // Customers
  customers: {
    async findAll() {
      const { rows } = await query('SELECT * FROM customers ORDER BY created_at DESC');
      return rows;
    },
    async findById(id: string) {
      const { rows } = await query('SELECT * FROM customers WHERE id = $1', [id]);
      return rows[0] || null;
    },
    async findByPhone(phone: string) {
      const { rows } = await query('SELECT * FROM customers WHERE phone = $1', [phone]);
      return rows[0] || null;
    },
    async findByEmail(email: string) {
      const { rows } = await query('SELECT * FROM customers WHERE email = $1', [email]);
      return rows[0] || null;
    },
    async create(data: any) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await query(
        `INSERT INTO customers (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    },
    async update(id: string, data: any) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const { rows } = await query(
        `UPDATE customers SET ${sets} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );
      return rows[0];
    }
  },

  // Orders
  orders: {
    async findAll(filters?: { vendorId?: string; customerId?: string; status?: string }) {
      let sql = 'SELECT * FROM orders WHERE 1=1';
      const params: any[] = [];

      if (filters?.vendorId) {
        params.push(filters.vendorId);
        sql += ` AND vendor_id = $${params.length}`;
      }
      if (filters?.customerId) {
        params.push(filters.customerId);
        sql += ` AND customer_id = $${params.length}`;
      }
      if (filters?.status) {
        params.push(filters.status);
        sql += ` AND status = $${params.length}`;
      }

      sql += ' ORDER BY created_at DESC';
      const { rows } = await query(sql, params);
      return rows;
    },
    async findById(id: string) {
      const { rows } = await query('SELECT * FROM orders WHERE id = $1', [id]);
      return rows[0] || null;
    },
    async findByOrderNumber(orderNumber: string) {
      const { rows } = await query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
      return rows[0] || null;
    },
    async create(data: any) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await query(
        `INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    },
    async updateStatus(id: string, status: string) {
      const { rows } = await query(
        'UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
        [id, status]
      );
      return rows[0];
    }
  },

  // Health check
  async healthCheck() {
    try {
      const { rows } = await query('SELECT NOW() as time, current_database() as database');
      return {
        connected: true,
        database: rows[0].database,
        time: rows[0].time
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

export { pool };
export default db;
