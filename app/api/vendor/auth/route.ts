import { NextRequest, NextResponse } from 'next/server';

// In production, check against DB. For now, env-based.
const VENDOR_PASSWORD = process.env.VENDOR_PASSWORD || 'vendor2024';

const vendorNames: Record<string, string> = {
  'teva-deli': 'Teva Deli',
  'queens-cuisine': "Queen's Cuisine",
  'gahn-delight': 'Gahn Delight',
  'people-store': "People's Store",
  'vop-shop': 'VOP Shop',
  'garden-of-light': 'Garden of Light',
};

export async function POST(request: NextRequest) {
  try {
    const { vendorId, password } = await request.json();

    if (!vendorId || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    if (password !== VENDOR_PASSWORD || !vendorNames[vendorId]) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({
      vendorId,
      name: vendorNames[vendorId],
      token: `vendor-${vendorId}-${Date.now()}`,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
