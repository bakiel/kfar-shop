import { NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const { searchParams } = new URL(request.url);
  const feed = await getProductFeed({
    vendorId,
    category: searchParams.get('category'),
    search: searchParams.get('search'),
    limit: searchParams.get('limit') || '50',
  });

  return NextResponse.json({
    success: feed.success,
    source: feed.source,
    stale: feed.stale,
    products: feed.products,
    pagination: {
      total: feed.count,
      page: 1,
      limit: parseInt(searchParams.get('limit') || '50', 10),
    },
    error: feed.error,
  }, {
    status: feed.success ? 200 : 503,
    headers: NO_STORE_HEADERS,
  });
}
