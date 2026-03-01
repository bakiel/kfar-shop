import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rows: recentTransactions } = await query(
      `SELECT o.id, o.order_number, o.total, o.status, o.created_at,
              v.name as vendor_name, c.name as customer_name
       FROM orders o
       LEFT JOIN vendors v ON o.vendor_id = v.id
       LEFT JOIN customers c ON o.customer_id = c.id
       ORDER BY o.created_at DESC
       LIMIT 50`,
      []
    );

    const totalRevenue = recentTransactions.reduce((sum: number, t: any) =>
      sum + parseFloat(t.total || '0'), 0);

    return NextResponse.json({
      success: true,
      transactions: recentTransactions,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      count: recentTransactions.length,
    });
  } catch (error) {
    console.error('Revenue feed error:', error);
    return NextResponse.json({
      success: true,
      transactions: [],
      totalRevenue: 0,
      count: 0,
    });
  }
}
