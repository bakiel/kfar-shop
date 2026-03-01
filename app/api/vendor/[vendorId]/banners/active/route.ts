import { NextRequest, NextResponse } from 'next/server';
import { query, isDbAvailable } from '@/lib/db/postgres-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const vendorId = params.vendorId;

    // Query DB for active banners
    const dbUp = await isDbAvailable();
    if (dbUp) {
      try {
        const { rows: banners } = await query(
          `SELECT * FROM vendor_banners
           WHERE vendor_id = $1 AND is_active = true
           ORDER BY order_position ASC`,
          [vendorId]
        );

        return NextResponse.json({
          banners,
          total: banners.length
        });
      } catch {
        // Table may not exist -- fall through
      }
    }

    // DB unavailable -- return empty array
    return NextResponse.json({
      banners: [],
      total: 0
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}
