import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/postgres-client';
import { verifyAccessToken } from '@/lib/services/auth-service';

export async function GET(request: NextRequest) {
  // Require admin authentication — this endpoint exposes all customer PII
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || '';
  const user = token ? verifyAccessToken(token) : null;
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  }

  try {
    const customers = await db.customers.findAll();
    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if customer exists
    const existing = await db.customers.findByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }

    const customer = await db.customers.create({
      email,
      name,
      phone,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
