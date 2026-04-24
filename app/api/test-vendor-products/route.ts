import { NextResponse } from 'next/server';
import { vendorStores, getProductsByVendor } from '@/lib/data/wordpress-style-data-layer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendor') || 'teva-deli';

  const vendor = vendorStores[vendorId];
  const products = getProductsByVendor(vendorId);

  return NextResponse.json({
    vendorId,
    vendorExists: !!vendor,
    vendorName: vendor?.name,
    productsFromStore: vendor?.products?.length || 0,
    productsFromFunction: products.length,
    allVendorIds: Object.keys(vendorStores),
    firstThreeProducts: products.slice(0, 3).map(p => ({ id: p.id, name: p.name }))
  });
}
