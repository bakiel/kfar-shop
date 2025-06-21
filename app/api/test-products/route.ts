import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/data/wordpress-style-data-layer';

export async function GET() {
  try {
    const products = getAllProducts();
    
    // Debug info
    const sampleProducts = products.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      hasVendorName: !!p.vendorName
    }));
    
    const stats = {
      totalProducts: products.length,
      withVendorName: products.filter(p => p.vendorName).length,
      withoutVendorName: products.filter(p => !p.vendorName).length,
      missingVendorNames: products
        .filter(p => !p.vendorName)
        .slice(0, 10)
        .map(p => ({ id: p.id, name: p.name, vendorId: p.vendorId }))
    };
    
    return NextResponse.json({
      success: true,
      stats,
      sampleProducts,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}