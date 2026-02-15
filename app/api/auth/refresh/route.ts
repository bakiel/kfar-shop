import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
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
