import { NextRequest, NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/services/auth-service';
import { sendTransactional } from '@/lib/services/email/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const result = await registerCustomer({ email, password, name, phone });

    if (!result.success || !result.tokens || !result.user) {
      return NextResponse.json({ error: result.error || 'Registration failed' }, { status: 400 });
    }

    // Send welcome email (fire-and-forget)
    sendTransactional(email, 'welcome_customer', {
      customer_name: name,
      points_earned: '50',
    }).catch(err => console.error('Failed to send welcome email:', err));

    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
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
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
