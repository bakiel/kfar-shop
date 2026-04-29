import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import {
  createVendorBanner,
  deleteVendorBanner,
  listVendorBanners,
  updateVendorBanner,
  validateVendorBanner,
} from '@/lib/services/vendor-banner-service';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

function requireVendor(request: NextRequest, vendorId: string | null) {
  const user = getUser(request);
  if (!user) return { user: null, response: NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }) };
  if (user.role !== 'vendor' || !user.vendorId || user.vendorId !== vendorId) {
    return { user, response: NextResponse.json({ success: false, error: 'Vendor access required' }, { status: 403 }) };
  }
  return { user, response: null };
}

function normalizeBody(body: any) {
  const content = body.content || {};
  return {
    template: body.template || 'custom',
    content: {
      ...content,
      title: content.title ?? body.title ?? '',
      subtitle: content.subtitle ?? body.subtitle ?? '',
    },
    isActive: body.isActive ?? body.is_active ?? true,
    orderPosition: body.orderPosition ?? body.order_position ?? 0,
    startDate: body.startDate ?? body.start_date ?? content.startDate ?? null,
    endDate: body.endDate ?? body.end_date ?? content.endDate ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const auth = requireVendor(request, vendorId);
    if (auth.response) return auth.response;

    const banners = await listVendorBanners(vendorId!);
    return NextResponse.json({ success: true, banners, total: banners.length });
  } catch (error) {
    console.error('Error fetching vendor banners:', error);
    return NextResponse.json(
      { success: false, banners: [], total: 0, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const vendorId = body.vendor_id || body.vendorId || null;
    const auth = requireVendor(request, vendorId);
    if (auth.response) return auth.response;

    const input = normalizeBody(body);
    const validation = validateVendorBanner(input);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const banner = await createVendorBanner(vendorId, input);
    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error) {
    console.error('Error creating vendor banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bannerId = searchParams.get('id');
    const body = await request.json();
    const vendorId = body.vendor_id || body.vendorId || null;
    const auth = requireVendor(request, vendorId);
    if (auth.response) return auth.response;

    if (!bannerId) {
      return NextResponse.json({ success: false, error: 'Banner ID is required' }, { status: 400 });
    }

    const banner = await updateVendorBanner(vendorId, bannerId, normalizeBody(body));
    if (!banner) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('Error updating vendor banner:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bannerId = searchParams.get('id');
    const vendorId = searchParams.get('vendorId');
    const auth = requireVendor(request, vendorId);
    if (auth.response) return auth.response;

    if (!bannerId) {
      return NextResponse.json({ success: false, error: 'Banner ID is required' }, { status: 400 });
    }

    const deleted = await deleteVendorBanner(vendorId!, bannerId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting vendor banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
