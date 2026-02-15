import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

// GET - Retrieve customer profile
export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'customer' || !user.customerId) {
      return NextResponse.json(
        { error: 'Customer access required' },
        { status: 403 }
      );
    }

    const { rows } = await query(
      'SELECT * FROM customers WHERE id = $1',
      [user.customerId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      );
    }

    const customer = rows[0];

    // Parse JSON fields if stored as strings
    const parseJsonField = (value: any) => {
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return value; }
      }
      return value;
    };

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar || null,
        addresses: parseJsonField(customer.addresses) || [],
        preferences: parseJsonField(customer.preferences) || {},
        points: parseInt(customer.points || '0'),
        loyaltyTier: customer.loyalty_tier || 'bronze',
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update customer profile
export async function PUT(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'customer' || !user.customerId) {
      return NextResponse.json(
        { error: 'Customer access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build dynamic update - only update allowed fields
    const allowedFields = ['name', 'phone', 'avatar', 'addresses', 'preferences'];
    const updateFields: string[] = [];
    const values: any[] = [user.customerId]; // $1 is always the customer ID
    let paramIndex = 2;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        let value = body[field];
        // Serialize objects/arrays to JSON
        if (field === 'addresses' || field === 'preferences') {
          value = JSON.stringify(value);
        }
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateFields.push('updated_at = NOW()');

    const { rows } = await query(
      `UPDATE customers SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      );
    }

    const customer = rows[0];

    // Parse JSON fields
    const parseJsonField = (value: any) => {
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return value; }
      }
      return value;
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar || null,
        addresses: parseJsonField(customer.addresses) || [],
        preferences: parseJsonField(customer.preferences) || {},
        points: parseInt(customer.points || '0'),
        loyaltyTier: customer.loyalty_tier || 'bronze',
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
      },
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
