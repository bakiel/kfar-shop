import { Pool, PoolClient } from 'pg';

// PostgreSQL connection pool for KFAR Marketplace
// Migrated from Supabase to Hostinger VPS

function envInt(name: string, fallback: number) {
  const parsed = parseInt(process.env[name] || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const DB_CONNECT_TIMEOUT_MS = envInt('POSTGRES_CONNECT_TIMEOUT_MS', 2_000);
const DB_QUERY_TIMEOUT_MS = envInt('POSTGRES_QUERY_TIMEOUT_MS', 8_000);
const DB_CHECK_TIMEOUT_MS = envInt('POSTGRES_HEALTH_TIMEOUT_MS', 1_500);

// Defer env validation to runtime (not build time) so Next.js build succeeds
// without DB credentials in the CI/build environment.
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'kfar_marketplace',
  user: process.env.POSTGRES_USER || 'kfar',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: DB_CONNECT_TIMEOUT_MS,
  statement_timeout: DB_QUERY_TIMEOUT_MS,
  query_timeout: DB_QUERY_TIMEOUT_MS,
  idle_in_transaction_session_timeout: DB_QUERY_TIMEOUT_MS,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  keepAliveIntervalMillis: 30000,
} as any);

// Fast DB availability check -- caches result to avoid repeated timeouts
// Success cached 5min, failure cached only 5s (allows quick recovery after restart)
let _dbAvailable: boolean | null = null;
let _dbCheckTime = 0;
let _dbCheckPromise: Promise<boolean> | null = null;
const DB_CHECK_TTL_OK = 300_000;  // 5 minutes when DB is up
const DB_CHECK_TTL_FAIL = 5_000;  // 5 seconds when DB is down (retry quickly)

function markDbAvailability(available: boolean) {
  _dbAvailable = available;
  _dbCheckTime = Date.now();
}

function isTransientDbError(error: unknown) {
  const msg = (error as any)?.message || '';
  const code = (error as any)?.code || '';
  return code === 'ECONNREFUSED'
    || code === 'ETIMEDOUT'
    || code === '57P01'
    || code === '53300'
    || msg.includes('timeout')
    || msg.includes('terminated')
    || msg.includes('Connection terminated');
}

export async function isDbAvailable(): Promise<boolean> {
  const ttl = _dbAvailable === false ? DB_CHECK_TTL_FAIL : DB_CHECK_TTL_OK;
  if (_dbAvailable !== null && Date.now() - _dbCheckTime < ttl) {
    return _dbAvailable;
  }

  if (_dbCheckPromise) {
    return _dbCheckPromise;
  }

  const dbCheck = pool.query({
    text: 'SELECT 1',
    statement_timeout: DB_CHECK_TIMEOUT_MS,
    query_timeout: DB_CHECK_TIMEOUT_MS,
  } as any);
  _dbCheckPromise = new Promise<boolean>((resolve) => {
    let timeout: ReturnType<typeof setTimeout>;
    let settled = false;
    const finish = (available: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      markDbAvailability(available);
      resolve(available);
    };

    timeout = setTimeout(() => {
      finish(false);
    }, DB_CHECK_TIMEOUT_MS);

    dbCheck
      .then(() => {
        finish(true);
      })
      .catch(() => {
        finish(false);
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

pool.on('error', (err) => {
  markDbAvailability(false);
  console.error('❌ PostgreSQL pool error:', err?.message || err);
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
    const result = await pool.query({
      text,
      values: params || [],
      statement_timeout: DB_QUERY_TIMEOUT_MS,
      query_timeout: DB_QUERY_TIMEOUT_MS,
    } as any);
    const duration = Date.now() - start;
    markDbAvailability(true);
    if (duration > 100) {
      console.log(`Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return { rows: result.rows, rowCount: result.rowCount || 0 };
  } catch (error) {
    // Mark DB unavailable on connection errors (do not crash the process)
    if (isTransientDbError(error)) {
      markDbAvailability(false);
    }
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL statement_timeout = ${DB_QUERY_TIMEOUT_MS}`);
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

// Column allowlists — only these names are permitted in dynamic INSERT/UPDATE
// column positions. Values are always parameterized; this blocks injection via key names.
const VENDOR_COLUMNS = new Set([
  'id', 'name', 'slug', 'email', 'phone', 'password_hash',
  'logo_url', 'banner_url', 'primary_color', 'secondary_color', 'accent_color',
  'description', 'short_description', 'established_year', 'location', 'address',
  'theme', 'layout', 'features', 'payment_methods', 'shipping_methods',
  'return_policy', 'minimum_order', 'status', 'verified', 'featured',
  'total_products', 'total_sales', 'total_orders', 'average_rating',
  'review_count', 'follower_count', 'tags', 'certifications',
  'created_at', 'updated_at', 'is_active',
]);

const PRODUCT_COLUMNS = new Set([
  'id', 'vendor_id', 'sku', 'slug', 'name', 'name_he',
  'description', 'short_description', 'long_description',
  'category', 'subcategory', 'tags', 'price', 'original_price', 'cost', 'currency',
  'in_stock', 'stock_quantity', 'track_inventory', 'low_stock_threshold',
  'primary_image', 'image_gallery', 'thumbnails', 'video_urls',
  'weight', 'dimensions', 'specifications', 'nutritional_info',
  'features', 'benefits', 'ingredients', 'allergens', 'certifications',
  'meta_title', 'meta_description', 'meta_keywords',
  'status', 'is_featured', 'is_vegan', 'is_kosher', 'is_organic', 'is_gluten_free',
  'view_count', 'purchase_count', 'wishlist_count', 'rating', 'review_count',
  'published_at', 'created_at', 'updated_at',
]);

const CUSTOMER_COLUMNS = new Set([
  'id', 'name', 'email', 'phone', 'points', 'loyalty_tier',
  'language_preference', 'dietary_restrictions', 'location', 'preferences',
  'lifetime_points', 'tags', 'notes', 'segment', 'addresses',
  'total_orders', 'total_spent', 'last_order_at', 'avatar_url',
  'phone_verified', 'email_verified', 'status', 'last_activity',
  'updated_at', 'created_at',
]);

/**
 * Filter an object's keys to only those present in the allowlist.
 * Throws if no valid keys remain so callers get an early, clear error.
 */
function filterColumns(data: Record<string, any>, allowlist: Set<string>, table: string) {
  const filtered: Record<string, any> = {};
  for (const [k, v] of Object.entries(data)) {
    if (allowlist.has(k)) {
      filtered[k] = v;
    } else {
      console.warn(`[db] Rejected unknown column "${k}" for table "${table}"`);
    }
  }
  if (Object.keys(filtered).length === 0) {
    throw new Error(`No valid columns provided for table "${table}"`);
  }
  return filtered;
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
      const safe = filterColumns(data, VENDOR_COLUMNS, 'vendors');
      const keys = Object.keys(safe);
      const values = Object.values(safe);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await query(
        `INSERT INTO vendors (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    },
    async update(id: string, data: any) {
      const safe = filterColumns(data, VENDOR_COLUMNS, 'vendors');
      const keys = Object.keys(safe);
      const values = Object.values(safe);
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
      const safe = filterColumns(data, PRODUCT_COLUMNS, 'products');
      const keys = Object.keys(safe);
      const values = Object.values(safe);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await query(
        `INSERT INTO products (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    },
    async update(id: string, data: any) {
      const safe = filterColumns(data, PRODUCT_COLUMNS, 'products');
      const keys = Object.keys(safe);
      const values = Object.values(safe);
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
      const safe = filterColumns(data, CUSTOMER_COLUMNS, 'customers');
      const keys = Object.keys(safe);
      const values = Object.values(safe);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await query(
        `INSERT INTO customers (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return rows[0];
    },
    async update(id: string, data: any) {
      const safe = filterColumns(data, CUSTOMER_COLUMNS, 'customers');
      const keys = Object.keys(safe);
      const values = Object.values(safe);
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
