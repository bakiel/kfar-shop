import { NextRequest, NextResponse } from 'next/server';
import { logout, verifyAccessToken } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (accessToken) {
      const user = verifyAccessToken(accessToken);
      if (user) {
        await logout(user.id, refreshToken);
      }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('refreshToken');
    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('refreshToken');
    return response;
  }
}
