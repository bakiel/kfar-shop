import { NextResponse } from 'next/server';
import { query, isDbAvailable } from '@/lib/db/postgres-client';
import {
  getBundleRecordOriginalPrice,
  getBundleRecordPrice,
  getBundleRecordProductIds,
  getBundleSavingsPercent,
  isBundleRecordActive,
  sortBundleRecords,
} from '@/lib/db/bundles';
import { getProductFeed } from '@/lib/services/live-product-feed';

// GET /api/bundles/promoted
//
// Returns the single bundle currently marked `is_promoted = true` in the
// bundles table, enriched with resolved product details. Public endpoint —
// consumed by the marketplace home page to render the promotion slot.
// Returns { bundle: null } when no bundle is promoted.
export async function GET() {
  try {
    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json({ bundle: null });
    }

    const { rows } = await query('SELECT * FROM bundles');

    const bundle = sortBundleRecords(rows).find((row) => row.is_promoted === true && isBundleRecordActive(row));

    if (!bundle) {
      return NextResponse.json({ bundle: null });
    }

    const productIds = getBundleRecordProductIds(bundle);
    const price = getBundleRecordPrice(bundle);
    const originalPrice = getBundleRecordOriginalPrice(bundle);
    const productFeed = await getProductFeed();
    const productMap = new Map(productFeed.products.map((product) => [product.id, product]));

    const resolvedProducts = productIds.map((pid) => {
      const product = productMap.get(pid);
      if (product) {
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          vendorName: product.vendorName,
        };
      }
      return { id: pid, name: pid, price: 0 };
    });

    return NextResponse.json({
      bundle: {
        id: bundle.id,
        name: bundle.name,
        nameHe: bundle.name_he,
        description: bundle.description,
        price,
        originalPrice,
        image: bundle.image,
        products: resolvedProducts,
        discount: getBundleSavingsPercent(originalPrice, price),
      },
    });
  } catch (err) {
    console.error('promoted bundle GET error', err);
    return NextResponse.json({ bundle: null });
  }
}
