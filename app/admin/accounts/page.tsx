'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Power,
  RefreshCw,
  Shield,
  ShoppingCart,
  Star,
  Store,
  User,
  Users,
  X,
} from 'lucide-react';
import { PageHeader, DataTable, StatusBadge, LoadingState, ConfirmDialog } from '@/components/portal';
import type { Column } from '@/components/portal';
import { useLanguage } from '@/lib/context/LanguageContext';
import { useAuth } from '@/lib/context/AuthContext';

type AccountStatus = 'active' | 'inactive';
type AccountRole = 'customer' | 'vendor' | 'admin';
type TabId = 'customers' | 'vendors' | 'admins';

interface AccountRow extends Record<string, unknown> {
  id: string;
  userId: string;
  email: string;
  role: AccountRole;
  roleLabel?: string;
  displayName: string;
  isActive: boolean;
  status: AccountStatus;
  vendorId?: string | null;
  customerId?: string | null;
  lastLoginAt?: string | null;
  lastLogin?: string;
  createdAt?: string | null;
  activeSessionCount?: number;
  profile?: Record<string, unknown>;
}

interface CustomerAccount extends AccountRow {
  role: 'customer';
  name: string;
  nameHe: string;
  orders: number;
  points: number;
}

interface VendorAccount extends AccountRow {
  role: 'vendor';
  storeName: string;
  storeNameHe: string;
  products: number;
  revenue: number;
  rating: number;
}

interface AdminAccount extends AccountRow {
  role: 'admin';
  name: string;
  nameHe: string;
  adminRole: string;
  adminRoleHe: string;
}

interface AccountDetail {
  account: AccountRow;
  profile: Record<string, unknown> | null;
  orders: Array<Record<string, unknown>>;
  sessions: Array<Record<string, unknown>>;
  audit: Array<Record<string, unknown>>;
}

type ConfirmAction =
  | { type: 'activate'; account: AccountRow }
  | { type: 'deactivate'; account: AccountRow }
  | { type: 'reset'; account: AccountRow }
  | { type: 'revoke'; account: AccountRow };

type TableRowAction = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: unknown) {
  if (!value) return 'Never';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return 'Never';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: unknown) {
  return `₪${numberValue(value).toLocaleString()}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientAccountsError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  return message.includes('Database unavailable')
    || message.includes('HTTP 503')
    || message.includes('NetworkError')
    || message.includes('Failed to fetch');
}

function normalizeBase(raw: any): AccountRow {
  return {
    ...raw,
    id: raw.id || raw.userId,
    userId: raw.userId || raw.id,
    email: raw.email || '',
    role: raw.role,
    roleLabel: raw.roleLabel,
    displayName: raw.displayName || raw.name || raw.storeName || raw.email || 'Account',
    isActive: raw.isActive ?? raw.status !== 'inactive',
    status: raw.status === 'inactive' || raw.isActive === false ? 'inactive' : 'active',
    vendorId: raw.vendorId || raw.vendor_id || null,
    customerId: raw.customerId || raw.customer_id || null,
    lastLoginAt: raw.lastLoginAt || null,
    lastLogin: raw.lastLogin || '',
    createdAt: raw.createdAt || null,
    activeSessionCount: Number(raw.activeSessionCount || 0),
    profile: raw.profile || {},
  };
}

function normalizeCustomer(raw: any): CustomerAccount {
  const base = normalizeBase(raw);
  return {
    ...base,
    role: 'customer',
    name: raw.name || base.displayName,
    nameHe: raw.nameHe || raw.name || base.displayName,
    orders: Number(raw.orders ?? raw.totalOrders ?? 0),
    points: Number(raw.points ?? raw.loyaltyPoints ?? 0),
  };
}

function normalizeVendor(raw: any): VendorAccount {
  const base = normalizeBase(raw);
  return {
    ...base,
    role: 'vendor',
    storeName: raw.storeName || raw.name || base.displayName,
    storeNameHe: raw.storeNameHe || raw.name_he || raw.storeName || raw.name || base.displayName,
    products: Number(raw.products ?? raw.productCount ?? 0),
    revenue: Number(raw.revenue ?? raw.totalRevenue ?? 0),
    rating: Number(raw.rating ?? raw.averageRating ?? 0) || 0,
  };
}

function normalizeAdmin(raw: any): AdminAccount {
  const base = normalizeBase(raw);
  return {
    ...base,
    role: 'admin',
    name: raw.name || base.displayName,
    nameHe: raw.nameHe || raw.name || base.displayName,
    adminRole: raw.roleLabel || raw.adminRole || 'Super Admin',
    adminRoleHe: raw.adminRoleHe || 'מנהל ראשי',
  };
}

export default function AccountsPage() {
  const { language, t, isRTL } = useLanguage();
  const { accessToken, user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('customers');
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [vendorAccounts, setVendorAccounts] = useState<VendorAccount[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountRow | null>(null);
  const [detail, setDetail] = useState<AccountDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const authHeaders = useCallback((): Record<string, string> => (
    accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
  ), [accessToken]);

  const fetchAccounts = useCallback(async (showPageLoading = true) => {
    if (!accessToken) return;

    if (showPageLoading) setLoading(true);
    setError(null);

    try {
      let data: any = null;
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await fetch('/api/admin/accounts?type=all', {
            headers: authHeaders(),
            cache: 'no-store',
          });
          const payload = await response.json();
          if (!response.ok || payload.success === false) {
            throw new Error(payload.error || `Accounts: HTTP ${response.status}`);
          }
          data = payload;
          break;
        } catch (err) {
          lastError = err;
          if (attempt < 2 && isTransientAccountsError(err)) {
            await sleep(1200 * (attempt + 1));
            continue;
          }
          throw err;
        }
      }

      if (!data) throw lastError instanceof Error ? lastError : new Error('Failed to load accounts');

      setCustomers((data.customers || []).map(normalizeCustomer));
      setVendorAccounts((data.vendors || []).map(normalizeVendor));
      setAdmins((data.admins || []).map(normalizeAdmin));
    } catch (err) {
      console.error('Accounts fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
      if (showPageLoading) {
        setCustomers([]);
        setVendorAccounts([]);
        setAdmins([]);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, authHeaders]);

  useEffect(() => {
    if (authLoading) return;
    if (!accessToken) {
      setLoading(false);
      setError('Admin session expired. Please log in again.');
      return;
    }
    fetchAccounts();
  }, [accessToken, authLoading, fetchAccounts]);

  const openDetails = useCallback(async (account: AccountRow) => {
    if (!accessToken) return;
    setSelectedAccount(account);
    setDetail(null);
    setDetailLoading(true);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/accounts/${account.id}`, {
        headers: authHeaders(),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      setDetail({
        account: data.account,
        profile: data.profile || null,
        orders: data.orders || [],
        sessions: data.sessions || [],
        audit: data.audit || [],
      });
    } catch (err) {
      console.error('Account detail error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load account detail');
    } finally {
      setDetailLoading(false);
    }
  }, [accessToken, authHeaders]);

  const closeDetails = () => {
    setSelectedAccount(null);
    setDetail(null);
  };

  const runConfirmedAction = async () => {
    if (!confirmAction || !accessToken) return;
    setActionLoading(true);
    setNotice(null);
    setError(null);

    try {
      const account = confirmAction.account;
      let response: Response;

      if (confirmAction.type === 'activate' || confirmAction.type === 'deactivate') {
        response = await fetch(`/api/admin/accounts/${account.id}`, {
          method: 'PATCH',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: confirmAction.type === 'activate' }),
        });
      } else if (confirmAction.type === 'reset') {
        response = await fetch(`/api/admin/accounts/${account.id}/reset-password`, {
          method: 'POST',
          headers: authHeaders(),
        });
      } else {
        response = await fetch(`/api/admin/accounts/${account.id}/sessions`, {
          method: 'DELETE',
          headers: authHeaders(),
        });
      }

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setDetail({
        account: data.account,
        profile: data.profile || null,
        orders: data.orders || [],
        sessions: data.sessions || [],
        audit: data.audit || [],
      });
      setSelectedAccount(data.account);
      await fetchAccounts(false);

      const actionLabels: Record<ConfirmAction['type'], string> = {
        activate: 'Account activated.',
        deactivate: 'Account deactivated and sessions cleared.',
        reset: 'Password reset email queued.',
        revoke: 'Active sessions revoked.',
      };
      setNotice(actionLabels[confirmAction.type]);
    } catch (err) {
      console.error('Account action error:', err);
      setError(err instanceof Error ? err.message : 'Account action failed');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const tabs: { id: TabId; label: string; labelHe: string; icon: React.ReactNode; count: number }[] = [
    { id: 'customers', label: 'Customers', labelHe: 'לקוחות', icon: <Users className="w-4 h-4 stroke-[1.5]" />, count: customers.length },
    { id: 'vendors', label: 'Vendors', labelHe: 'ספקים', icon: <Store className="w-4 h-4 stroke-[1.5]" />, count: vendorAccounts.length },
    { id: 'admins', label: 'Admins', labelHe: 'מנהלים', icon: <Shield className="w-4 h-4 stroke-[1.5]" />, count: admins.length },
  ];

  const accountActions = (row: AccountRow): TableRowAction[] => {
    const isCurrentAdmin = row.id === user?.id;
    const actions: TableRowAction[] = [
      { label: t('View Details'), onClick: () => openDetails(row) },
    ];

    if (!isCurrentAdmin) {
      actions.push({
        label: row.status === 'active' ? (isRTL ? 'השבת' : 'Deactivate') : (isRTL ? 'הפעל' : 'Activate'),
        onClick: () => setConfirmAction({ type: row.status === 'active' ? 'deactivate' : 'activate', account: row }),
        destructive: row.status === 'active',
      });
    }

    actions.push({
      label: isRTL ? 'איפוס סיסמה' : 'Send Password Reset',
      onClick: () => setConfirmAction({ type: 'reset', account: row }),
    });

    if (!isCurrentAdmin) {
      actions.push({
        label: isRTL ? 'בטל הפעלות' : 'Revoke Sessions',
        onClick: () => setConfirmAction({ type: 'revoke', account: row }),
        destructive: true,
      });
    }

    return actions;
  };

  const customerColumns: Column<CustomerAccount>[] = [
    {
      key: 'name',
      header: t('Name'),
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900">{isRTL ? row.nameHe : row.name}</span>
          <p className="text-xs text-gray-500">{row.email}</p>
          {row.customerId && <p className="text-xs text-gray-400">Customer ID: {row.customerId}</p>}
        </div>
      ),
    },
    {
      key: 'orders',
      header: t('Orders'),
      sortable: true,
      render: (row) => <span className="font-medium">{row.orders}</span>,
    },
    {
      key: 'points',
      header: isRTL ? 'נקודות' : 'Points',
      sortable: true,
      render: (row) => <span className="text-[#C4A265] font-medium">{row.points}</span>,
    },
    {
      key: 'activeSessionCount',
      header: isRTL ? 'הפעלות' : 'Sessions',
      sortable: true,
      render: (row) => <span>{row.activeSessionCount || 0}</span>,
    },
    {
      key: 'status',
      header: t('Status'),
      render: (row) => <StatusBadge status={row.status} language={language} />,
    },
  ];

  const vendorColumns: Column<VendorAccount>[] = [
    {
      key: 'storeName',
      header: t('Store Name'),
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
          </div>
          <div>
            <span className="font-medium text-gray-900">{isRTL ? row.storeNameHe : row.storeName}</span>
            <p className="text-xs text-gray-500">{row.email}</p>
            {row.vendorId && <p className="text-xs text-gray-400">Vendor ID: {row.vendorId}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'products',
      header: t('Products'),
      sortable: true,
      render: (row) => <span>{row.products}</span>,
    },
    {
      key: 'revenue',
      header: isRTL ? 'הכנסות' : 'Revenue',
      sortable: true,
      render: (row) => <span className="font-semibold text-gray-900">{formatCurrency(row.revenue)}</span>,
    },
    {
      key: 'rating',
      header: t('Rating'),
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 stroke-[1.5]" />
          {row.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('Status'),
      render: (row) => <StatusBadge status={row.status} language={language} />,
    },
  ];

  const adminColumns: Column<AdminAccount>[] = [
    {
      key: 'name',
      header: t('Name'),
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900">{isRTL ? row.nameHe : row.name}</span>
          <p className="text-xs text-gray-500">{row.email}</p>
          {row.id === user?.id && <p className="text-xs text-[#2D5A27]">Current session</p>}
        </div>
      ),
    },
    {
      key: 'adminRole',
      header: isRTL ? 'תפקיד' : 'Role',
      render: (row) => <span className="text-sm">{isRTL ? row.adminRoleHe : row.adminRole}</span>,
    },
    {
      key: 'lastLogin',
      header: isRTL ? 'התחברות אחרונה' : 'Last Login',
      render: (row) => <span className="text-sm text-gray-500">{row.lastLogin || 'Never'}</span>,
    },
    {
      key: 'activeSessionCount',
      header: isRTL ? 'הפעלות' : 'Sessions',
      sortable: true,
      render: (row) => <span>{row.activeSessionCount || 0}</span>,
    },
    {
      key: 'status',
      header: t('Status'),
      render: (row) => <StatusBadge status={row.status} language={language} />,
    },
  ];

  const confirmText = (() => {
    if (!confirmAction) return null;
    const name = confirmAction.account.displayName || confirmAction.account.email;
    if (confirmAction.type === 'deactivate') {
      return {
        title: isRTL ? 'להשבית חשבון?' : 'Deactivate account?',
        description: `${name} will be blocked from login immediately. Public vendor stores and products stay unchanged.`,
        label: isRTL ? 'השבת' : 'Deactivate',
        destructive: true,
      };
    }
    if (confirmAction.type === 'activate') {
      return {
        title: isRTL ? 'להפעיל חשבון?' : 'Activate account?',
        description: `${name} will be able to log in again.`,
        label: isRTL ? 'הפעל' : 'Activate',
        destructive: false,
      };
    }
    if (confirmAction.type === 'reset') {
      return {
        title: isRTL ? 'לשלוח איפוס סיסמה?' : 'Send password reset?',
        description: `A secure reset link will be emailed to ${confirmAction.account.email}. No temporary password will be created.`,
        label: isRTL ? 'שלח' : 'Send Reset',
        destructive: false,
      };
    }
    return {
      title: isRTL ? 'לבטל הפעלות?' : 'Revoke sessions?',
      description: `${name} will be logged out everywhere and must sign in again.`,
      label: isRTL ? 'בטל הפעלות' : 'Revoke Sessions',
      destructive: true,
    };
  })();

  if (loading || authLoading) {
    return <LoadingState type="page" />;
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <PageHeader
          title={t('Accounts')}
          subtitle={isRTL
            ? `${customers.length} לקוחות, ${vendorAccounts.length} ספקים, ${admins.length} מנהלים`
            : `${customers.length} customers, ${vendorAccounts.length} vendors, ${admins.length} admins`
          }
          isRTL={isRTL}
        />
      </motion.div>

      {(error || notice || actionLoading) && (
        <motion.div variants={item} className="mb-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 stroke-[1.5]" />
              <span>{error}</span>
              <button
                onClick={() => fetchAccounts()}
                className="ml-auto text-red-800 font-medium hover:underline"
              >
                {isRTL ? 'נסה שוב' : 'Retry'}
              </button>
            </div>
          )}
          {notice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {notice}
            </div>
          )}
          {actionLoading && (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />
              {isRTL ? 'מעבד פעולה...' : 'Processing account action...'}
            </div>
          )}
        </motion.div>
      )}

      <motion.div variants={item} className="mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{isRTL ? tab.labelHe : tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-[#2D5A27]/10 text-[#2D5A27]' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        {activeTab === 'customers' && (
          <DataTable<CustomerAccount>
            columns={customerColumns}
            data={customers}
            searchable
            searchPlaceholder={isRTL ? 'חפש לקוחות...' : 'Search customers...'}
            pageSize={10}
            emptyTitle={isRTL ? 'אין לקוחות עדיין' : 'No customers yet'}
            emptyIcon="users"
            isRTL={isRTL}
            onRowClick={openDetails}
            rowActions={accountActions}
          />
        )}

        {activeTab === 'vendors' && (
          <DataTable<VendorAccount>
            columns={vendorColumns}
            data={vendorAccounts}
            searchable
            searchPlaceholder={isRTL ? 'חפש ספקים...' : 'Search vendors...'}
            pageSize={10}
            emptyTitle={isRTL ? 'אין ספקים עדיין' : 'No vendors yet'}
            emptyIcon="package"
            isRTL={isRTL}
            onRowClick={openDetails}
            rowActions={accountActions}
          />
        )}

        {activeTab === 'admins' && (
          <DataTable<AdminAccount>
            columns={adminColumns}
            data={admins}
            searchable
            searchPlaceholder={isRTL ? 'חפש מנהלים...' : 'Search admins...'}
            pageSize={10}
            emptyTitle={isRTL ? 'אין מנהלים' : 'No admins'}
            emptyIcon="users"
            isRTL={isRTL}
            onRowClick={openDetails}
            rowActions={accountActions}
          />
        )}
      </motion.div>

      <AccountDetailDrawer
        open={!!selectedAccount}
        account={selectedAccount}
        detail={detail}
        loading={detailLoading}
        isRTL={isRTL}
        currentUserId={user?.id}
        onClose={closeDetails}
        onAction={setConfirmAction}
      />

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => { void runConfirmedAction(); }}
        title={confirmText?.title || ''}
        description={confirmText?.description}
        confirmLabel={confirmText?.label || 'Confirm'}
        cancelLabel={isRTL ? 'ביטול' : 'Cancel'}
        destructive={confirmText?.destructive}
        isRTL={isRTL}
      />
    </motion.div>
  );
}

function AccountDetailDrawer({
  open,
  account,
  detail,
  loading,
  isRTL,
  currentUserId,
  onClose,
  onAction,
}: {
  open: boolean;
  account: AccountRow | null;
  detail: AccountDetail | null;
  loading: boolean;
  isRTL: boolean;
  currentUserId?: string;
  onClose: () => void;
  onAction: (action: ConfirmAction) => void;
}) {
  const activeAccount = detail?.account || account;
  if (!activeAccount) return null;

  const isCurrentAdmin = activeAccount.id === currentUserId;
  const profile = detail?.profile || activeAccount.profile || {};
  const orders = detail?.orders || [];
  const sessions = detail?.sessions || [];
  const audit = detail?.audit || [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ duration: 0.2 }}
            className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} z-40 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start gap-4 z-10">
              <div className="w-10 h-10 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center flex-shrink-0">
                {activeAccount.role === 'vendor' ? (
                  <Store className="w-5 h-5 text-[#2D5A27] stroke-[1.5]" />
                ) : activeAccount.role === 'admin' ? (
                  <Shield className="w-5 h-5 text-[#2D5A27] stroke-[1.5]" />
                ) : (
                  <User className="w-5 h-5 text-[#2D5A27] stroke-[1.5]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{activeAccount.displayName}</h2>
                <p className="text-sm text-gray-500 truncate">{activeAccount.email}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <X className="w-5 h-5 text-gray-400 stroke-[1.5]" />
              </button>
            </div>

            {loading ? (
              <div className="p-10 flex items-center justify-center text-gray-500 gap-2">
                <Loader2 className="w-5 h-5 animate-spin stroke-[1.5]" />
                {isRTL ? 'טוען פרטי חשבון...' : 'Loading account detail...'}
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={activeAccount.status} language={isRTL ? 'he' : 'en'} />
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                    {activeAccount.roleLabel || activeAccount.role}
                  </span>
                  {isCurrentAdmin && (
                    <span className="inline-flex items-center rounded-full bg-[#2D5A27]/10 px-2.5 py-1 text-xs font-medium text-[#2D5A27]">
                      Current session
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoBlock label="User ID" value={activeAccount.id} />
                  <InfoBlock label="Created" value={formatDate(activeAccount.createdAt)} />
                  <InfoBlock label="Last login" value={formatDate(activeAccount.lastLoginAt)} />
                  <InfoBlock label="Active sessions" value={String(activeAccount.activeSessionCount || sessions.length || 0)} />
                  {activeAccount.vendorId && <InfoBlock label="Linked vendor" value={activeAccount.vendorId} />}
                  {activeAccount.customerId && <InfoBlock label="Linked customer" value={activeAccount.customerId} />}
                </div>

                <div className="flex flex-wrap gap-2">
                  {!isCurrentAdmin && (
                    <button
                      onClick={() => onAction({ type: activeAccount.status === 'active' ? 'deactivate' : 'activate', account: activeAccount })}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        activeAccount.status === 'active'
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <Power className="w-4 h-4 stroke-[1.5]" />
                      {activeAccount.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                  <button
                    onClick={() => onAction({ type: 'reset', account: activeAccount })}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2D5A27] text-white text-sm font-medium hover:bg-[#234A1F] transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 stroke-[1.5]" />
                    Send Password Reset
                  </button>
                  {!isCurrentAdmin && (
                    <button
                      onClick={() => onAction({ type: 'revoke', account: activeAccount })}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 stroke-[1.5]" />
                      Revoke Sessions
                    </button>
                  )}
                </div>

                <Section title="Profile" icon={<Mail className="w-4 h-4 stroke-[1.5]" />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoBlock label="Name" value={String(profile.name || activeAccount.displayName || '')} />
                    <InfoBlock label="Email" value={String(profile.email || activeAccount.email || '')} />
                    <InfoBlock label="Phone" value={String(profile.phone || 'Not set')} />
                    <InfoBlock label="Profile status" value={String(profile.status || 'Not set')} />
                    {activeAccount.role === 'vendor' && (
                      <>
                        <InfoBlock label="Products" value={String(profile.productCount || 0)} />
                        <InfoBlock label="Revenue" value={formatCurrency(profile.totalRevenue)} />
                      </>
                    )}
                    {activeAccount.role === 'customer' && (
                      <>
                        <InfoBlock label="Orders" value={String(profile.totalOrders || 0)} />
                        <InfoBlock label="Points" value={String(profile.points || 0)} />
                      </>
                    )}
                  </div>
                </Section>

                <Section title="Recent Orders" icon={<ShoppingCart className="w-4 h-4 stroke-[1.5]" />}>
                  {orders.length === 0 ? (
                    <p className="text-sm text-gray-500">No linked orders found.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <div key={String(order.id)} className="py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{String(order.orderNumber || order.id)}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {String(order.customerName || '')} {order.vendorName ? `· ${String(order.vendorName)}` : ''}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</p>
                            <p className="text-xs text-gray-500">{String(order.status || '')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="Active Sessions" icon={<Clock className="w-4 h-4 stroke-[1.5]" />}>
                  {sessions.length === 0 ? (
                    <p className="text-sm text-gray-500">No active refresh sessions.</p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div key={String(session.id)} className="rounded-lg border border-gray-100 p-3">
                          <p className="text-sm font-medium text-gray-900">Session {String(session.id).slice(0, 8)}</p>
                          <p className="text-xs text-gray-500">Created {formatDate(session.createdAt)}</p>
                          <p className="text-xs text-gray-500">Expires {formatDate(session.expiresAt)}</p>
                          <p className="text-xs text-gray-500">IP {String(session.ipAddress || 'Not recorded')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="Audit History" icon={<RefreshCw className="w-4 h-4 stroke-[1.5]" />}>
                  {audit.length === 0 ? (
                    <p className="text-sm text-gray-500">No account audit entries yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {audit.map((entry) => (
                        <div key={String(entry.id)} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#2D5A27] mt-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{String(entry.action || '')}</p>
                            <p className="text-xs text-gray-500">
                              {String(entry.actor || 'System')} · {formatDate(entry.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 min-w-0">
      <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
      <p className="text-sm text-gray-900 break-words">{value}</p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-400">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}
