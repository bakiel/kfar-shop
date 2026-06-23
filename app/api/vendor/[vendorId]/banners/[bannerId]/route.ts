import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { deleteVendorBanner } from '@/lib/services/vendor-banner-service';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

export async function DELETE(
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

    const deleted = await deleteVendorBanner(vendorId, bannerId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
      deletedId: bannerId,
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
