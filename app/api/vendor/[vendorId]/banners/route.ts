import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import {
  createVendorBanner,
  listVendorBanners,
  updateVendorBanner,
  validateVendorBanner,
} from '@/lib/services/vendor-banner-service';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

function canAccessVendor(request: NextRequest, vendorId: string) {
  const user = getUser(request);
  if (!user) return { user: null, response: NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 }) };
  if (user.role !== 'vendor' || user.vendorId !== vendorId) {
    return { user, response: NextResponse.json({ success: false, error: 'Vendor access required' }, { status: 403 }) };
  }
  return { user, response: null };
}

function normalizeBody(body: any) {
  const content = body.content || {};
  return {
    template: body.template || 'custom',
    content,
    isActive: body.isActive ?? body.is_active ?? true,
    orderPosition: body.orderPosition ?? body.order_position ?? 0,
    startDate: body.startDate ?? body.start_date ?? content.startDate ?? null,
    endDate: body.endDate ?? body.end_date ?? content.endDate ?? null,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await context.params;
    const auth = canAccessVendor(request, vendorId);
    if (auth.response) return auth.response;

    const banners = await listVendorBanners(vendorId);
    return NextResponse.json({ success: true, banners, total: banners.length });
  } catch (error) {
    console.error('Error fetching vendor banners:', error);
    return NextResponse.json(
      { success: false, banners: [], total: 0, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await context.params;
    const auth = canAccessVendor(request, vendorId);
    if (auth.response) return auth.response;

    const input = normalizeBody(await request.json());
    const validation = validateVendorBanner(input);
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const banner = await createVendorBanner(vendorId, input);
    return NextResponse.json({ success: true, banner, message: 'Banner created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await context.params;
    const auth = canAccessVendor(request, vendorId);
    if (auth.response) return auth.response;

    const body = await request.json();
    const bannerId = body.bannerId || body.id;
    if (!bannerId) {
      return NextResponse.json({ success: false, error: 'Banner ID is required' }, { status: 400 });
    }

    const banner = await updateVendorBanner(vendorId, String(bannerId), normalizeBody(body));
    if (!banner) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, banner, message: 'Banner updated successfully' });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update banner' },
      { status: 500 }
    );
  }
}
