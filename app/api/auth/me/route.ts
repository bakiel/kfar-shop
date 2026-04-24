import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, getUserById } from '@/lib/services/auth-service';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const tokenUser = verifyAccessToken(token);
    if (!tokenUser) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await getUserById(tokenUser.id);
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        vendorId: user.vendorId,
        customerId: user.customerId,
        displayName: user.displayName,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
