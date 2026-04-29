import { NextRequest, NextResponse } from 'next/server';
import { getProductFeed } from '@/lib/services/live-product-feed';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const feed = await getProductFeed({
    vendorId: searchParams.get('vendor'),
    search: searchParams.get('search'),
    category: searchParams.get('category'),
    limit: searchParams.get('limit'),
  });

  return NextResponse.json(feed, {
    status: feed.success ? 200 : 503,
    headers: NO_STORE_HEADERS,
  });
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: 'Use the authenticated vendor/admin product endpoints for product updates.',
    },
    { status: 405, headers: NO_STORE_HEADERS }
  );
}
