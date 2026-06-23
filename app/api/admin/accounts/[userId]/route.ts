export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable } from '@/lib/db/postgres-client';
import {
  AdminAccountError,
  getAdminAccountDetail,
  requireActiveAdmin,
  setAdminAccountActive,
} from '@/lib/services/admin-account-service';

function errorResponse(error: unknown) {
  if (error instanceof AdminAccountError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }

  console.error('Admin account detail/action error:', error);
  return NextResponse.json(
    { success: false, error: 'Failed to process account request' },
    { status: 500 }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const user = await requireActiveAdmin(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const detail = await getAdminAccountDetail(userId);
    return NextResponse.json({ success: true, ...detail });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json({ success: false, error: 'Database unavailable' }, { status: 503 });
    }

    const user = await requireActiveAdmin(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isActive boolean is required' },
        { status: 400 }
      );
    }

    const { userId } = await params;
    const detail = await setAdminAccountActive(user, userId, body.isActive);
    return NextResponse.json({ success: true, ...detail });
  } catch (error) {
    return errorResponse(error);
  }
}
