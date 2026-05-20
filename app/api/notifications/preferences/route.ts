import { NextResponse } from 'next/server';

const DEFAULT_PREFERENCES = {
  email: true,
  sms: false,
  push: false,
  inApp: true,
  categories: {
    orders: true,
    rewards: true,
    products: true,
    vendors: true,
    promotions: true,
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json(
      { error: 'Customer ID is required' },
      { status: 400 }
    );
  }

  return NextResponse.json(DEFAULT_PREFERENCES);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.customerId || !body?.preferences) {
    return NextResponse.json(
      { error: 'Customer ID and preferences are required' },
      { status: 400 }
    );
  }

  // Preferences persistence can be added once a dedicated table is introduced.
  // For now this endpoint stays stable and confirms the in-app defaults.
  return NextResponse.json({ success: true, preferences: { ...DEFAULT_PREFERENCES, ...body.preferences } });
}
