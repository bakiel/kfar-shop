import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/services/auth-service';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = checkRateLimit(`refresh:${ip}`, RATE_LIMITS.refresh);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ authenticated: false });
    }

    const result = await refreshAccessToken(refreshToken);

    if (!result.success || !result.tokens || !result.user) {
      const response = NextResponse.json({ error: result.error || 'Token refresh failed' }, { status: 401 });
      response.cookies.delete('refreshToken');
      return response;
    }

    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        vendorId: result.user.vendorId,
        customerId: result.user.customerId,
        displayName: result.user.displayName,
      },
      accessToken: result.tokens.accessToken,
    });

    response.cookies.set('refreshToken', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
}
