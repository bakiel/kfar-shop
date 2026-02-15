import { NextRequest, NextResponse } from 'next/server';
import { resendVerification } from '@/lib/services/auth-service';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const limit = checkRateLimit(`resend:${ip}`, RATE_LIMITS.register);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limit.retryAfterMs / 1000)) } }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await resendVerification(email);

    if (!result.success && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'If the account exists and is not yet verified, a new verification email has been sent.',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
