import { NextResponse } from 'next/server';
import { getAllProducts, vendorStores } from '@/lib/data/wordpress-style-data-layer';

export async function GET() {
  try {
    const vendors = Object.keys(vendorStores);
    const vendorDetails = vendors.map(id => ({
      id,
      name: vendorStores[id].name,
      productCount: vendorStores[id].products?.length || 0
    }));
    
    const allProducts = getAllProducts();
    
    return NextResponse.json({
      success: true,
      vendorCount: vendors.length,
      vendors: vendorDetails,
      totalProducts: allProducts.length,
      sampleProducts: allProducts.slice(0, 3).map(p => ({
        id: p.id,
        name: p.name,
        vendorId: p.vendorId,
        vendorName: p.vendorName
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}