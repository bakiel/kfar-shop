import { NextRequest, NextResponse } from 'next/server';
import { generateTokensForUser } from '@/lib/services/auth-service';
import {
  createVendorAccount,
  VendorOnboardingError,
} from '@/lib/services/vendor-onboarding.server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Create vendor + login user + initial products (shared with the admin route).
    const { vendorId, slug, userId } = await createVendorAccount(data);

    // Issue a JWT so the self-serve vendor is immediately logged in.
    const tokens = await generateTokensForUser({
      id: userId,
      email: data.email,
      role: 'vendor',
      vendorId,
      displayName: data.storeName,
      isActive: true,
    });

    console.log('✅ New vendor onboarded:', { vendorId, storeName: data.storeName, slug, products: data.products?.length || 0 });

    const response = NextResponse.json({
      success: true,
      vendorId,
      slug,
      storeUrl: `/store/${slug}`,
      userId,
      accessToken: tokens.accessToken,
      message: 'Vendor successfully onboarded',
    });

    // Set refresh token cookie
    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Onboarding error:', error);
    if (error instanceof VendorOnboardingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to process onboarding' },
      { status: 500 }
    );
  }
}
