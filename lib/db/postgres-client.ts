import { Pool, PoolClient } from 'pg';

// PostgreSQL connection pool for KFAR Marketplace
// Migrated from Supabase to Hostinger VPS

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 5000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      }
    : {
        host: process.env.POSTGRES_HOST || '127.0.0.1',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
        database: process.env.POSTGRES_DB || 'kfar_marketplace',
        user: process.env.POSTGRES_USER || process.env.USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || '',
        max: 10,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 5000,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      }
);

// Fast DB availability check -- caches result to avoid repeated timeouts
// Success cached 5min, failure cached only 5s (allows quick recovery after restart)
let _dbAvailable: boolean | null = null;
let _dbCheckTime = 0;
let _dbCheckPromise: Promise<boolean> | null = null;
const DB_CHECK_TTL_OK = 300_000;  // 5 minutes when DB is up
const DB_CHECK_TTL_FAIL = 5_000;  // 5 seconds when DB is down (retry quickly)
const DB_CHECK_TIMEOUT_MS = 3_000;

export async function isDbAvailable(): Promise<boolean> {
  const ttl = _dbAvailable === false ? DB_CHECK_TTL_FAIL : DB_CHECK_TTL_OK;
  if (_dbAvailable !== null && Date.now() - _dbCheckTime < ttl) {
    return _dbAvailable;
  }

  if (_dbCheckPromise) {
    return _dbCheckPromise;
  }

  const dbCheck = pool.query('SELECT 1');
  _dbCheckPromise = new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => {
      _dbAvailable = false;
      _dbCheckTime = Date.now();
      resolve(false);
    }, DB_CHECK_TIMEOUT_MS);

    dbCheck
      .then(() => {
        clearTimeout(timeout);
        _dbAvailable = true;
        _dbCheckTime = Date.now();
        resolve(true);
      })
      .catch(() => {
        clearTimeout(timeout);
        _dbAvailable = false;
        _dbCheckTime = Date.now();
        resolve(false);
      });
  }).finally(() => {
    _dbCheckPromise = null;
  });

  return _dbCheckPromise;
}

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected to kfar_marketplace');
});

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL pool error:', err);
});

// Query helper with proper typing
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  // Skip DB if we recently confirmed it's unreachable (retry after 5s)
  if (_dbAvailable === false && Date.now() - _dbCheckTime < DB_CHECK_TTL_FAIL) {
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
    // Mark DB unavailable on connection errors (do not crash the process)
    const msg = (error as any)?.message || '';
    const code = (error as any)?.code || '';
    if (code === 'ECONNREFUSED' || msg.includes('timeout') || msg.includes('terminated') || msg.includes('Connection terminated')) {
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
