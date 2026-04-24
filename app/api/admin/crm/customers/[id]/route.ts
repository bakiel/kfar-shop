import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { getCustomerById } from '@/lib/services/crm/crm-service';
import { query } from '@/lib/db/postgres-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const customer = await getCustomerById(id);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Also fetch their orders summary
    let ordersSummary = { count: 0, totalSpent: 0 };
    try {
      const { rows } = await query(
        `SELECT COUNT(*)::int as count, COALESCE(SUM(total), 0)::numeric as total_spent
         FROM orders WHERE customer_id = $1`,
        [id]
      );
      if (rows[0]) {
        ordersSummary = {
          count: rows[0].count,
          totalSpent: parseFloat(rows[0].total_spent) || 0,
        };
      }
    } catch {
      // Ignore - orders table may not have matching data
    }

    return NextResponse.json({
      customer,
      ordersSummary,
    });
  } catch (error) {
    console.error('CRM customer GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = ['name', 'email', 'phone', 'loyalty_tier', 'points', 'notes', 'addresses'];
    const updates: string[] = [];
    const values: any[] = [id];
    let paramIdx = 2;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'addresses') {
          updates.push(`${field} = $${paramIdx}::jsonb`);
          values.push(JSON.stringify(body[field]));
        } else {
          updates.push(`${field} = $${paramIdx}`);
          values.push(body[field]);
        }
        paramIdx++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updates.push('updated_at = NOW()');

    const { rows } = await query(
      `UPDATE customers SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer: rows[0] });
  } catch (error) {
    console.error('CRM customer PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}
