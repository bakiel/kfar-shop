import { NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';
import { getVendorById } from '@/lib/services/live-vendor-feed';

export async function GET() {
  const [vendor, feed] = await Promise.all([
    getVendorById('teva-deli', false),
    getProductFeed({ vendorId: 'teva-deli' }),
  ]);

  if (!vendor) {
    return NextResponse.json({
      error: 'Teva Deli not found',
      source: feed.source,
      stale: feed.stale,
    }, { status: 404 });
  }

  return NextResponse.json({
    vendor: vendor.name,
    vendorId: vendor.id,
    source: feed.source,
    stale: feed.stale,
    totalProducts: feed.count,
    categories: [...new Set(feed.products.map(p => p.category))],
    products: feed.products.slice(0, 5).map(p => ({
      id: p.id,
      name: p.name,
      nameHe: p.nameHe,
      price: p.price,
      category: p.category,
      hasImage: !!p.image
    }))
  }, { status: feed.success ? 200 : 503 });
}
