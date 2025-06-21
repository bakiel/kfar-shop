import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getProductsByVendor, searchProducts } from '@/lib/data/wordpress-style-data-layer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    
    let products = getAllProducts();
    
    // Filter by vendor
    if (vendorId) {
      products = getProductsByVendor(vendorId);
    }
    
    // Search
    if (search) {
      products = searchProducts(search);
    }
    
    // Filter by category
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    // Apply limit
    if (limit) {
      products = products.slice(0, parseInt(limit));
    }
    
    return NextResponse.json({
      success: true,
      count: products.length,
      products
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Admin endpoint for product updates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, updates } = body;
    
    // In production, this would update the database
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      productId,
      updates
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
