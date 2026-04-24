import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to import the data layer
    const dataLayer = await import('@/lib/data/wordpress-style-data-layer');
    
    return NextResponse.json({
      success: true,
      vendorCount: dataLayer.VENDOR_COUNT,
      totalProducts: dataLayer.TOTAL_PRODUCTS,
      vendors: Object.keys(dataLayer.vendorStores),
      sampleProduct: dataLayer.getAllProducts()[0] || null
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}