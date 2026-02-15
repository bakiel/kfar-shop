import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/services/auth-service';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/customer/login?error=missing_token', request.url));
  }

  const result = await verifyEmail(token);

  if (result.success) {
    // Redirect to login page with success message
    return NextResponse.redirect(new URL('/customer/login?verified=true', request.url));
  }

  // Redirect to login page with error
  return NextResponse.redirect(
    new URL(`/customer/login?error=verification_failed&message=${encodeURIComponent(result.error || 'Verification failed')}`, request.url)
  );
}
