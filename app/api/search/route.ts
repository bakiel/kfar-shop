import { NextRequest, NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category') || undefined;
  const vendor = searchParams.get('vendor') || undefined;

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], query: q, total: 0 }, { headers: NO_STORE_HEADERS });
  }

  const feed = await getProductFeed({
    search: q,
    limit,
    category,
    vendorId: vendor,
  });

  return NextResponse.json({
    success: feed.success,
    source: feed.source,
    stale: feed.stale,
    results: feed.products.map(product => ({
      id: product.id,
      name: product.name,
      nameHe: product.nameHe,
      description: product.description,
      price: product.price,
      category: product.category,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      image: product.image,
      searchScore: 1,
      matchType: feed.source,
    })),
    query: q,
    total: feed.products.length,
  }, {
    status: feed.success ? 200 : 503,
    headers: NO_STORE_HEADERS,
  });
}
