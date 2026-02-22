import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/services/auth-service';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kfarapp.com';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/customer/login?error=missing_token`);
  }

  const result = await verifyEmail(token);

  if (result.success) {
    // Redirect to login page with success message
    return NextResponse.redirect(`${baseUrl}/customer/login?verified=true`);
  }

  // Redirect to login page with error
  return NextResponse.redirect(
    `${baseUrl}/customer/login?error=verification_failed&message=${encodeURIComponent(result.error || 'Verification failed')}`
  );
}
