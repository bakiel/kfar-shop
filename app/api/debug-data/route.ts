import { NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';
import { getVendorFeed } from '@/lib/services/live-vendor-feed';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

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
      vendors: vendorFeed.vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        productCount: vendor.productCount
      })),
      totalProducts: productFeed.count,
      sampleProducts: productFeed.products.slice(0, 3).map(p => ({
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
    });
  }
}
