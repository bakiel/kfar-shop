import { NextRequest, NextResponse } from 'next/server';

// Payment gateway selection is intentionally launch-blocked. Checkout may show
// non-COD methods as coming soon, but no payment session can be created yet.
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Only Cash on Delivery is enabled' },
    { status: 400 }
  );
}
