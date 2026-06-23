import { NextRequest, NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';
import { applyVoiceCorrections } from '@/lib/utils/string-matching';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawSearch = searchParams.get('search') || '';
  const search = applyVoiceCorrections(rawSearch).toLowerCase();
  const vendorIdFilter = searchParams.get('vendorId') || searchParams.get('vendor_id') || '';
  const limit = searchParams.get('limit') || (search ? '10' : null);

  const feed = await getProductFeed({
    search: search || null,
    vendorId: vendorIdFilter || null,
    limit,
  });

  const products = feed.products.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    vendor: product.vendorName,
    vendorId: product.vendorId,
    category: product.category,
    image: product.image,
    description: product.description,
  }));

  return NextResponse.json({
    success: feed.success,
    source: feed.source,
    stale: feed.stale,
    products,
    total: products.length,
  }, {
    status: feed.success ? 200 : 503,
    headers: NO_STORE_HEADERS,
  });
}
