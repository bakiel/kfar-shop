import { NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';
import { getVendorFeed } from '@/lib/services/live-vendor-feed';

export async function GET() {
  try {
    const [vendorFeed, productFeed] = await Promise.all([
      getVendorFeed(),
      getProductFeed(),
    ]);

    return NextResponse.json({
      success: productFeed.success && vendorFeed.success,
      source: productFeed.source,
      stale: productFeed.stale || vendorFeed.stale,
      vendorCount: vendorFeed.count,
      totalProducts: productFeed.count,
      vendors: vendorFeed.vendors.map(vendor => vendor.id),
      sampleProduct: productFeed.products[0] || null
    }, { status: productFeed.success && vendorFeed.success ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
}
