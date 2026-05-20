import { NextResponse } from 'next/server';
import { getAllBundles } from '@/lib/services/landing-data-service';

// GET /api/bundles/promoted
//
// Returns the promoted bundle plus the active bundle list for the marketplace
// package showcase. The first bundle remains in `bundle` for existing callers.
export async function GET() {
  try {
    const bundles = (await getAllBundles()).map((bundle) => ({
      id: bundle.id,
      name: bundle.name,
      nameHe: bundle.nameHe,
      description: bundle.description,
      price: bundle.bundlePrice,
      bundlePrice: bundle.bundlePrice,
      originalPrice: bundle.originalPrice,
      image: bundle.image,
      products: bundle.products,
      discount: bundle.savingsPercent,
      savingsPercent: bundle.savingsPercent,
      loyaltyPointsBonus: bundle.loyaltyPointsBonus,
    }));

    return NextResponse.json({
      bundle: bundles[0] || null,
      bundles,
      total: bundles.length,
    });
  } catch (err) {
    console.error('promoted bundle GET error', err);
    return NextResponse.json({ bundle: null, bundles: [], total: 0 });
  }
}
