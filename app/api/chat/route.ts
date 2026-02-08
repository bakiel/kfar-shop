import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Create database connection for server-side only
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kfar_marketplace',
  user: process.env.DB_USER || 'kfar_user',
  password: process.env.DB_PASSWORD || 'kfar_password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function searchProducts(searchQuery: string) {
  try {
    const keywords = searchQuery.toLowerCase()
      .replace(/show|find|products?|מוצר|חפש/gi, '')
      .trim()
      .split(' ')
      .filter(word => word.length > 2);

    if (keywords.length === 0) return [];

    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.images[1] as image,
        p.vendor_id,
        v.name as vendor_name
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE 
        p.status = 'active' AND
        v.status = 'active' AND
        (
          LOWER(p.name) LIKE ANY($1) OR
          LOWER(p.description) LIKE ANY($1) OR
          LOWER(v.name) LIKE ANY($1)
        )
      ORDER BY p.featured DESC, p.created_at DESC
      LIMIT 6`,
      [keywords.map(k => `%${k}%`)]
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      image: row.image,
      vendor: row.vendor_name,
      vendorId: row.vendor_id,
      link: `/marketplace/${row.vendor_id}/products/${row.id}`
    }));
  } catch (error) {
    console.error('Product search error:', error);
    return [];
  }
}

async function getSuggestedProducts(excludeVendorId?: string) {
  try {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.price,
        p.images[1] as image,
        p.vendor_id,
        v.name as vendor_name
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE 
        p.status = 'active' AND
        v.status = 'active' AND
        ($1::varchar IS NULL OR p.vendor_id != $1)
      ORDER BY RANDOM()
      LIMIT 4`,
      [excludeVendorId]
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: row.price,
      image: row.image,
      vendor: row.vendor_name,
      vendorId: row.vendor_id,
      link: `/marketplace/${row.vendor_id}/products/${row.id}`
    }));
  } catch (error) {
    console.error('Suggested products error:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query: userQuery, includeProducts } = await request.json();

    let response = '';
    let products = [];
    let suggestedProducts = [];
    
    // Check for common queries
    if (userQuery.toLowerCase().includes('hello') || userQuery.toLowerCase().includes('שלום')) {
      response = "שלום! Welcome to KFAR Marketplace! I can help you find products, learn about vendors, or answer questions about our marketplace. What are you looking for today?";
    } else if (userQuery.toLowerCase().includes('vegan') || userQuery.toLowerCase().includes('טבעוני')) {
      response = "KFAR specializes in vegan and natural products! Let me show you some options:";
      if (includeProducts) {
        products = await searchProducts('vegan organic natural');
      }
    } else if (userQuery.toLowerCase().includes('vendor') || userQuery.toLowerCase().includes('store')) {
      response = "We have amazing local vendors offering fresh produce, artisanal products, and healthy foods. Each vendor has their own unique story and specialties.";
    } else if (userQuery.toLowerCase().includes('help') || userQuery.toLowerCase().includes('עזרה')) {
      response = "I'm here to help! You can:\n• Search for products by name or category\n• Browse vendors and their offerings\n• Ask about vegan/organic options\n• Learn about delivery and payment options";
    } else if (includeProducts && (
      userQuery.toLowerCase().includes('product') || 
      userQuery.toLowerCase().includes('מוצר') ||
      userQuery.toLowerCase().includes('find') ||
      userQuery.toLowerCase().includes('show')
    )) {
      products = await searchProducts(userQuery);
      if (products.length > 0) {
        response = `I found ${products.length} products matching your search:`;
      } else {
        response = "I couldn't find any products matching your search. Try different keywords or browse our categories.";
      }
    } else {
      response = "I can help you explore KFAR marketplace! Try searching for specific products, asking about vendors, or browsing our vegan and organic selections.";
    }

    // Get suggested products if we found products
    if (products.length > 0) {
      suggestedProducts = await getSuggestedProducts(products[0].vendorId);
    }

    return NextResponse.json({ 
      response,
      products,
      suggestedProducts,
      suggestions: ['Browse vegan products', 'View all vendors', 'Today\'s specials']
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        response: 'Sorry, I encountered an error. Please try again.',
        products: [],
        suggestedProducts: [],
        suggestions: []
      },
      { status: 500 }
    );
  }
}