import { NextRequest, NextResponse } from 'next/server';
import { ensureVendorBannersTable, normalizeVendorBanner } from '@/lib/services/vendor-banner-service';
import { query } from '@/lib/db/postgres-client';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string; bannerId: string }> }
) {
  try {
    const { vendorId, bannerId } = await context.params;

    await ensureVendorBannersTable();
    const { rows } = await query(
      `UPDATE vendor_banners
       SET clicks = clicks + 1, updated_at = NOW()
       WHERE id = $1 AND vendor_id = $2
       RETURNING *`,
      [bannerId, vendorId]
    );

    if (!rows[0]) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully',
      banner: normalizeVendorBanner(rows[0]),
    });
  } catch (error) {
    console.error('Error tracking banner click:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
