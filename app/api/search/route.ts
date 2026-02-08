import { NextRequest, NextResponse } from 'next/server';
import { hybridSearch } from '@/lib/search/semantic-search';
import { getAllProducts } from '@/lib/data/wordpress-style-data-layer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category') || undefined;
  const vendor = searchParams.get('vendor') || undefined;

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], query: q, total: 0 });
  }

  const products = getAllProducts();
  const results = hybridSearch(q, products, { limit, category, vendor });

  return NextResponse.json({
    results: results.map(r => ({
      id: r.product.id,
      name: r.product.name,
      nameHe: r.product.nameHe,
      description: r.product.description,
      price: r.product.price,
      category: r.product.category,
      vendorId: r.product.vendorId,
      vendorName: r.product.vendorName,
      image: r.product.image,
      searchScore: r.score,
      matchType: r.matchType,
    })),
    query: q,
    total: results.length,
  });
}
