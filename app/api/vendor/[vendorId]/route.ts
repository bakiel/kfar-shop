import { NextResponse } from 'next/server';
import { getVendorById } from '@/lib/services/live-vendor-feed';
import { verifyAccessToken } from '@/lib/services/auth-service';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params;
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const user = token ? verifyAccessToken(token) : null;

  if (!user || (user.role !== 'admin' && user.vendorId !== vendorId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const vendor = await getVendorById(vendorId, true);

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404, headers: NO_STORE_HEADERS });
  }

  return NextResponse.json({
    vendor: {
      ...vendor,
      products: vendor.products || [],
    },
  }, { headers: NO_STORE_HEADERS });
}
