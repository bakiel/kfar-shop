import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

async function ensureScanLogTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS vendor_customer_scans (
      id VARCHAR(80) PRIMARY KEY,
      vendor_id VARCHAR(50) NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      scanned_by UUID REFERENCES users(id) ON DELETE SET NULL,
      scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'
    )
  `);
  await query('CREATE INDEX IF NOT EXISTS idx_vendor_customer_scans_vendor ON vendor_customer_scans(vendor_id, scanned_at DESC)');
  await query('CREATE INDEX IF NOT EXISTS idx_vendor_customer_scans_customer ON vendor_customer_scans(customer_id, scanned_at DESC)');
}

function scanId() {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json({ success: false, error: 'Vendor access required' }, { status: 403 });
    }

    const body = await request.json();
    const customerId = String(body.customerId || '').trim();
    const vendorId = String(body.vendorId || '').trim();

    if (!customerId || !vendorId) {
      return NextResponse.json({ success: false, error: 'Customer ID and vendor ID are required' }, { status: 400 });
    }
    if (vendorId !== user.vendorId) {
      return NextResponse.json({ success: false, error: 'Cannot log scans for another vendor' }, { status: 403 });
    }

    await ensureScanLogTable();

    const { rows: customerRows } = await query('SELECT id FROM customers WHERE id::text = $1', [customerId]);
    if (!customerRows[0]) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const { rows } = await query(
      `INSERT INTO vendor_customer_scans (id, vendor_id, customer_id, scanned_by, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        scanId(),
        user.vendorId,
        customerRows[0].id,
        user.id,
        { clientTimestamp: body.timestamp || null },
      ]
    );

    return NextResponse.json({ success: true, scan: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Customer scan log error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log customer scan' },
      { status: 500 }
    );
  }
}
