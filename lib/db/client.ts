/**
 * Database Client - Provides a unified interface for database access
 * This wraps the database.ts functionality with a simpler API
 */

import { pool, query, transaction, vendorDb, productDb } from './database';
import { completeProductCatalog, getAllProducts } from '../data/complete-catalog';

// Simple database interface that matches the expected API
export async function getDB() {
  return {
    query: async (sql: string, params?: any[]) => {
      try {
        // Try to execute the query against the real database
        return await query(sql, params);
      } catch (error) {
        console.error('Database query error, falling back to static data:', error);
        
        // Fallback to static data for product queries
        if (sql.includes('FROM products')) {
          return fallbackProductQuery(sql, params);
        }
        
        // For other queries, return empty results
        return { rows: [], rowCount: 0 };
      }
    }
  };
}

// Fallback query handler for products using static data
function fallbackProductQuery(sql: string, params?: any[]): { rows: any[]; rowCount: number } {
  const allProducts = getAllProducts();
  
  // Extract category filter from SQL/params
  let filteredProducts = allProducts;
  
  if (sql.includes('category') && params && params[0]) {
    const category = params[0].toLowerCase();
    filteredProducts = allProducts.filter(p => 
      p.category.toLowerCase() === category
    );
  }
  
  // If this is an aggregate query (for pricing stats)
  if (sql.includes('MIN(p.price)') || sql.includes('AVG(p.price)')) {
    const prices = filteredProducts
      .filter(p => p.price > 0)
      .map(p => p.price);
    
    if (prices.length === 0) {
      return {
        rows: [{
          category: params?.[0] || 'all',
          product_count: 0,
          min_price: 0,
          max_price: 0,
          avg_price: 0,
          median_price: 0,
          price_stddev: 0
        }],
        rowCount: 1
      };
    }
    
    const stats = {
      category: params?.[0] || 'all',
      product_count: prices.length,
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
      avg_price: prices.reduce((a, b) => a + b, 0) / prices.length,
      median_price: getMedian(prices),
      price_stddev: getStandardDeviation(prices)
    };
    
    return { rows: [stats], rowCount: 1 };
  }
  
  // For product search queries
  if (sql.includes('LIKE')) {
    const searchTerm = params?.[params.length - 1]?.replace(/%/g, '') || '';
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const rows = filteredProducts.slice(0, 10).map(p => ({
      name: p.name,
      price: p.price,
      category: p.category,
      vendor_name: p.vendorName || p.vendorId,
      rating: p.rating || 4.5,
      review_count: 0
    }));
    
    return { rows, rowCount: rows.length };
  }
  
  // Default: return products as rows
  return {
    rows: filteredProducts.map(p => ({
      ...p,
      vendor_id: p.vendorId,
      is_active: true,
      in_stock: p.inStock !== false
    })),
    rowCount: filteredProducts.length
  };
}

// Helper functions for statistics
function getMedian(numbers: number[]): number {
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function getStandardDeviation(numbers: number[]): number {
  const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squareDiffs = numbers.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  return Math.sqrt(avgSquareDiff);
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
      console.log('Database not available, using static data fallback');
    }
  } catch (error) {
    console.log('Database initialization skipped, using static data');
  }
}