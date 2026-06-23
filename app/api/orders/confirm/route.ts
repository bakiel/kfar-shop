import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'This legacy order confirmation endpoint is disabled. Use /api/orders/create for Cash on Delivery orders.',
    },
    { status: 410 }
  );
}
