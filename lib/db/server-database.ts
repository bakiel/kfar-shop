// This file should only be imported in server-side code (API routes, server components)
// Never import this in client components or hooks

import { Pool } from 'pg';

if (typeof window !== 'undefined') {
  throw new Error('Database connection should only be used on the server side');
}

// Database configuration
const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || process.env.POSTGRES_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432'),
      database: process.env.DB_NAME || process.env.POSTGRES_DB || 'kfar_marketplace',
      user: process.env.DB_USER || process.env.POSTGRES_USER || process.env.USER || 'postgres',
      password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

// Create connection pool
export const pool = new Pool(dbConfig);

// Database query helper
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return { rows: res.rows, rowCount: res.rowCount || 0 };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
