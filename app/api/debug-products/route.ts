import { NextResponse } from 'next/server';
import { getAllProducts, getFeaturedProducts } from '@/lib/data/wordpress-style-data-layer';

export async function GET() {
  try {
    const allProducts = getAllProducts();
    const featuredProducts = getFeaturedProducts(12);
    
    // Group products by vendor to see ID patterns
    const productsByVendor: Record<string, any[]> = {};
    
    allProducts.forEach(product => {
      const vendorId = product.vendorId || 'unknown';
      if (!productsByVendor[vendorId]) {
        productsByVendor[vendorId] = [];
      }
      productsByVendor[vendorId].push({
        id: product.id,
        name: product.name
      });
    });
    
    // Get Teva Deli products specifically
    const tevaDeliProducts = productsByVendor['teva-deli'] || [];
    
    return NextResponse.json({
      success: true,
      totalProducts: allProducts.length,
      featuredCount: featuredProducts.length,
      tevaDeliProductIds: tevaDeliProducts.slice(0, 10),
      allVendors: Object.keys(productsByVendor),
      sampleProductIds: allProducts.slice(0, 20).map(p => ({
        id: p.id,
        name: p.name,
        vendorId: p.vendorId,
        vendorName: p.vendorName
      })),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}