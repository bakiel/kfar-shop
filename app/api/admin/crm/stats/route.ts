import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { getCustomerStats } from '@/lib/services/crm/crm-service';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stats = await getCustomerStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('CRM stats GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CRM stats' },
      { status: 500 }
    );
  }
}
