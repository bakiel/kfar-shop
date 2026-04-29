import { NextRequest, NextResponse } from 'next/server';
import { listVendorBanners } from '@/lib/services/vendor-banner-service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const params = await context.params;
    const vendorId = params.vendorId;

    const banners = await listVendorBanners(vendorId, true);
    return NextResponse.json({
      banners,
      total: banners.length,
    });
  } catch (error) {
    console.error('Error fetching active banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}
