import { NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';

export async function GET() {
  try {
    const feed = await getProductFeed();
    const sampleProducts = feed.products.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      hasVendorName: !!p.vendorName
    }));

    const stats = {
      totalProducts: feed.count,
      source: feed.source,
      stale: feed.stale,
      withVendorName: feed.products.filter(p => p.vendorName).length,
      withoutVendorName: feed.products.filter(p => !p.vendorName).length,
      missingVendorNames: feed.products
        .filter(p => !p.vendorName)
        .slice(0, 10)
        .map(p => ({ id: p.id, name: p.name, vendorId: p.vendorId }))
    };

    return NextResponse.json({
      success: feed.success,
      stats,
      sampleProducts,
      timestamp: new Date().toISOString()
    }, { status: feed.success ? 200 : 503 });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
