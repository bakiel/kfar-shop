import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { getProductFeed } from '@/lib/services/live-product-feed';

export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const user = token ? verifyAccessToken(token) : null;
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const limit = searchParams.get('limit') || '20';
  const feed = await getProductFeed({ search, limit, publicOnly: false });

  return NextResponse.json({
    products: feed.products.map(product => ({
      id: product.id,
      name: product.name,
      vendorName: product.vendorName,
      price: product.price,
      image: product.image,
    })),
    total: feed.count,
    source: feed.source,
    stale: feed.stale,
  });
}
