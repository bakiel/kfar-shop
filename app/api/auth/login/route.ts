import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/services/auth-service';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = checkRateLimit(`login:${ip}`, RATE_LIMITS.login);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const result = await login(email, password);

    if (!result.success || !result.tokens || !result.user) {
      return NextResponse.json({ error: result.error || 'Login failed' }, { status: 401 });
    }

    // Set refresh token as httpOnly cookie
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
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
