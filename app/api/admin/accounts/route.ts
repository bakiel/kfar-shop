export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { isDbAvailable } from '@/lib/db/postgres-client';
import {
  AdminAccountStatus,
  AdminAccountType,
  listAdminAccounts,
  requireActiveAdmin,
} from '@/lib/services/admin-account-service';

const accountTypes = new Set(['customers', 'vendors', 'admins', 'all']);
const accountStatuses = new Set(['active', 'inactive', 'all']);

export async function GET(request: NextRequest) {
  try {
    const dbUp = await isDbAvailable();
    if (!dbUp) {
      return NextResponse.json(
        { success: false, error: 'Database unavailable', accounts: [], customers: [], vendors: [], admins: [] },
        { status: 503 }
      );
    }

    const user = await requireActiveAdmin(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawType = searchParams.get('type') || 'all';
    const rawStatus = searchParams.get('status') || 'all';
    const search = searchParams.get('search');

    const type = (accountTypes.has(rawType) ? rawType : 'all') as AdminAccountType;
    const status = (accountStatuses.has(rawStatus) ? rawStatus : 'all') as AdminAccountStatus;

    const accounts = await listAdminAccounts({ type, status, search });
    const customers = accounts.filter((account) => account.role === 'customer');
    const vendors = accounts.filter((account) => account.role === 'vendor');
    const admins = accounts.filter((account) => account.role === 'admin');

    return NextResponse.json({
      success: true,
      accounts,
      customers,
      vendors,
      admins,
      count: accounts.length,
      accountCount: accounts.length,
      customerCount: customers.length,
      vendorCount: vendors.length,
      adminCount: admins.length,
    });
  } catch (error) {
    console.error('Accounts API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch accounts', accounts: [], customers: [], vendors: [], admins: [] },
      { status: 500 }
    );
  }
}
