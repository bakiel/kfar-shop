import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { setVendorBannerActive } from '@/lib/services/vendor-banner-service';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string; bannerId: string }> }
) {
  try {
    const { vendorId, bannerId } = await context.params;
    const user = getUser(request);

    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'vendor' || user.vendorId !== vendorId) {
      return NextResponse.json({ success: false, error: 'Vendor access required' }, { status: 403 });
    }

    const { isActive } = await request.json();
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, error: 'isActive must be boolean' }, { status: 400 });
    }

    const banner = await setVendorBannerActive(vendorId, bannerId, isActive);
    if (!banner) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Banner ${isActive ? 'activated' : 'deactivated'} successfully`,
      banner,
    });
  } catch (error) {
    console.error('Error toggling banner status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner status' },
      { status: 500 }
    );
  }
}
