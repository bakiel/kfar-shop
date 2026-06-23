import { NextRequest, NextResponse } from 'next/server';
import { db, isDbAvailable, query } from '@/lib/db/postgres-client';
import { requireActiveAdmin } from '@/lib/services/admin-account-service';
import {
  createVendorAccount,
  VendorOnboardingError,
} from '@/lib/services/vendor-onboarding.server';

// ---------------------------------------------------------------------------
// Admin vendor management.
//
// POST   — admin-assisted onboarding: create a store on a vendor's behalf and
//          return the login credentials for the admin to hand over.
// PATCH  — enable/disable a vendor by setting its `status` (active/suspended).
//
// Auth uses requireActiveAdmin (DB-backed) so a demoted/disabled admin cannot
// create or suspend vendors with a still-valid token.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  if (!(await requireActiveAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUp = await isDbAvailable();
  if (!dbUp) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const data = await request.json();
    const { vendorId, slug, userId } = await createVendorAccount(data);

    console.log('✅ Admin onboarded vendor:', { vendorId, storeName: data.storeName, slug });

    // No JWT/refresh cookie here — the admin stays logged in as admin. The plaintext
    // password is echoed back ONCE so the admin can hand it to the store owner; it is
    // never stored in plaintext (only the bcrypt hash is persisted).
    return NextResponse.json({
      success: true,
      vendorId,
      slug,
      storeUrl: `/store/${slug}`,
      userId,
      credentials: { email: data.email, password: data.password },
      message: 'Vendor created. Share the credentials with the store owner.',
    });
  } catch (error: any) {
    console.error('Admin vendor create error:', error);
    if (error instanceof VendorOnboardingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

const VALID_VENDOR_STATUSES = ['active', 'suspended', 'pending'];

export async function PATCH(request: NextRequest) {
  if (!(await requireActiveAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUp = await isDbAvailable();
  if (!dbUp) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { vendorId } = body;
    // Accept either an explicit status or an enable/disable action.
    let status: string | undefined = body.status;
    if (!status && body.action) {
      status = body.action === 'enable' ? 'active' : 'suspended';
    }

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
    }
    if (!status || !VALID_VENDOR_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_VENDOR_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await query('SELECT id FROM vendors WHERE id = $1', [vendorId]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: `Vendor ${vendorId} not found` }, { status: 404 });
    }

    const active = status === 'active';

    // is_active mirrors status so legacy queries that filter on it stay consistent.
    const updated = await db.vendors.update(vendorId, { status, is_active: active });
    if (!updated) {
      // Vendor disappeared between the check and the update.
      return NextResponse.json({ error: `Vendor ${vendorId} not found` }, { status: 404 });
    }

    // Disabling the store must also block the owner's login. Vendor auth is gated on
    // users.is_active, so flip it for every login row tied to this vendor.
    await query('UPDATE users SET is_active = $2, updated_at = NOW() WHERE vendor_id = $1', [
      vendorId,
      active,
    ]).catch((err) => console.error('Failed to sync vendor user is_active:', err));

    return NextResponse.json({
      success: true,
      vendor: { id: updated.id, status: updated.status },
      message: `Vendor ${vendorId} is now ${status}`,
    });
  } catch (error: any) {
    console.error('Admin vendor status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update vendor' },
      { status: 500 }
    );
  }
}
