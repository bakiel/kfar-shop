import { NextRequest, NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/services/auth-service';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = checkRateLimit(`register:${ip}`, RATE_LIMITS.register);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const result = await registerCustomer({ email, password, name, phone });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Registration failed' }, { status: 400 });
    }

    // Registration now requires email verification before login
    return NextResponse.json({
      success: true,
      message: result.message || 'Registration successful. Please check your email to verify your account.',
      requiresVerification: true,
    });
  } catch (error) {
    console.error('Registration route error:', error);
    return NextResponse.json({ error: 'Registration service unavailable. Please try again.' }, { status: 500 });
  }
}
