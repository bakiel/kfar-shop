/**
 * Database Client - Provides a unified interface for database access
 * This wraps the database.ts functionality with a simpler API
 */

import { pool, query, transaction, vendorDb, productDb } from './database';

// Simple database interface that matches the expected API
export async function getDB() {
  return {
    query: async (sql: string, params?: any[]) => {
      try {
        // Try to execute the query against the real database
        return await query(sql, params);
      } catch (error) {
        console.error('Database query error:', error);
        return { rows: [], rowCount: 0 };
      }
    }
  };
}

// Export database utilities for direct use
export { pool, query, transaction, vendorDb, productDb };

// Check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Initialize database with fallback
export async function initializeDatabaseWithFallback(): Promise<void> {
  try {
    const connected = await checkDatabaseConnection();
    if (!connected) {
      console.log('Database not available');
    }
  } catch (error) {
    console.log('Database initialization skipped');
  }
}
