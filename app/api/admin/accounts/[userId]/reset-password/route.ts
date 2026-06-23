export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable } from '@/lib/db/postgres-client';
import {
  AdminAccountError,
  requireActiveAdmin,
  sendAdminAccountPasswordReset,
} from '@/lib/services/admin-account-service';

export async function POST(
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
    const detail = await sendAdminAccountPasswordReset(user, userId);
    return NextResponse.json({ success: true, ...detail });
  } catch (error) {
    if (error instanceof AdminAccountError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    console.error('Admin account reset-password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send password reset' },
      { status: 500 }
    );
  }
}
