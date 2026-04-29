import { NextResponse } from 'next/server';
import { getVendorFeed } from '@/lib/services/live-vendor-feed';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

export async function GET() {
  const feed = await getVendorFeed();

  return NextResponse.json({
    success: feed.success,
    source: feed.source,
    stale: feed.stale,
    vendors: feed.vendors,
    total: feed.count,
    error: feed.error,
  }, {
    status: feed.success ? 200 : 503,
    headers: NO_STORE_HEADERS,
  });
}
