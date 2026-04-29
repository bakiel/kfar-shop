import { NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';
import { getVendorFeed } from '@/lib/services/live-vendor-feed';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendor') || 'teva-deli';

  const [vendorFeed, productFeed] = await Promise.all([
    getVendorFeed({ vendorId }),
    getProductFeed({ vendorId }),
  ]);

  const vendor = vendorFeed.vendors[0] || null;

  return NextResponse.json({
    vendorId,
    source: productFeed.source,
    stale: productFeed.stale,
    vendorExists: !!vendor,
    vendorName: vendor?.name,
    productsFromStore: vendor?.productCount || 0,
    productsFromFunction: productFeed.products.length,
    allVendorIds: vendorFeed.vendors.map(v => v.id),
    firstThreeProducts: productFeed.products.slice(0, 3).map(p => ({ id: p.id, name: p.name }))
  }, { status: productFeed.success ? 200 : 503 });
}
