import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Support both new (email+password) and legacy (vendorId+password) login
    let email = body.email;
    let password = body.password;

    // Legacy vendor login: vendorId maps to vendor email
    if (body.vendorId && !email) {
      const vendorEmails: Record<string, string> = {
        'teva-deli': 'teva@kfarapp.com',
        'queens-cuisine': 'queens@kfarapp.com',
        'gahn-delight': 'gahn@kfarapp.com',
        'people-store': 'people@kfarapp.com',
        'vop-shop': 'vop@kfarapp.com',
        'garden-of-light': 'garden@kfarapp.com',
      };
      email = vendorEmails[body.vendorId];
      if (!email) {
        return NextResponse.json({ error: 'Invalid vendor ID' }, { status: 401 });
      }
    }

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const result = await login(email, password);

    if (!result.success || !result.user || !result.tokens) {
      return NextResponse.json({ error: result.error || 'Invalid credentials' }, { status: 401 });
    }

    if (result.user.role !== 'vendor') {
      return NextResponse.json({ error: 'Not a vendor account' }, { status: 403 });
    }

    // Return in legacy format for backward compat + new JWT format
    const response = NextResponse.json({
      vendorId: result.user.vendorId,
      name: result.user.displayName,
      token: result.tokens.accessToken,
      accessToken: result.tokens.accessToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        vendorId: result.user.vendorId,
        displayName: result.user.displayName,
      },
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
