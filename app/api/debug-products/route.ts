import { NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';

export async function GET() {
  try {
    const feed = await getProductFeed();

    const productsByVendor: Record<string, any[]> = {};
    feed.products.forEach(product => {
      const vendorId = product.vendorId || 'unknown';
      if (!productsByVendor[vendorId]) {
        productsByVendor[vendorId] = [];
      }
      productsByVendor[vendorId].push({
        id: product.id,
        name: product.name
      });
    });

    const featuredProducts = feed.products.filter(product => product.isFeatured).slice(0, 12);
    const tevaDeliProducts = productsByVendor['teva-deli'] || [];

    return NextResponse.json({
      success: feed.success,
      source: feed.source,
      stale: feed.stale,
      totalProducts: feed.count,
      featuredCount: featuredProducts.length,
      tevaDeliProductIds: tevaDeliProducts.slice(0, 10),
      allVendors: Object.keys(productsByVendor),
      sampleProductIds: feed.products.slice(0, 20).map(p => ({
        id: p.id,
        name: p.name,
        vendorId: p.vendorId,
        vendorName: p.vendorName
      })),
      timestamp: new Date().toISOString()
    }, { status: feed.success ? 200 : 503 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}
