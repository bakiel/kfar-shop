import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { query, transaction } from '@/lib/db/postgres-client';
import {
  AuthUser,
  getUserById,
  requestPasswordReset,
  verifyAccessToken,
} from '@/lib/services/auth-service';

export type AdminAccountType = 'customers' | 'vendors' | 'admins' | 'all';
export type AdminAccountStatus = 'active' | 'inactive' | 'all';

export class AdminAccountError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AdminAccountError';
    this.status = status;
  }
}

let setupPromise: Promise<void> | null = null;

export async function ensureAdminAccountTables() {
  if (!setupPromise) {
    setupPromise = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS admin_audit_log (
          id UUID PRIMARY KEY,
          actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          action VARCHAR(50) NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Password reset uses the existing auth table and flow. The migration
      // creates it where needed, but runtime list/detail requests should not
      // attempt ownership-sensitive DDL on an auth table they may not own.
    })().catch((error) => {
      setupPromise = null;
      throw error;
    });
  }

  return setupPromise;
}

export async function requireActiveAdmin(request: NextRequest): Promise<AuthUser | null> {
  const raw = request.headers.get('authorization') || '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw.replace('Bearer ', '');
  const tokenUser = token ? verifyAccessToken(token) : null;
  if (!tokenUser || tokenUser.role !== 'admin') return null;

  const dbUser = await getUserById(tokenUser.id);
  if (!dbUser || dbUser.role !== 'admin' || !dbUser.isActive) return null;

  return dbUser;
}

function isoDate(value: unknown) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dateOnly(value: unknown) {
  const iso = isoDate(value);
  return iso ? iso.split('T')[0] : '';
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function intValue(value: unknown) {
  const parsed = parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeRoleLabel(role: string) {
  if (role === 'admin') return 'Super Admin';
  if (role === 'vendor') return 'Vendor Owner';
  return 'Customer';
}

function normalizeAccount(row: any) {
  const role = row.role as 'admin' | 'vendor' | 'customer';
  const customerId = row.customer_id || row.c_id || null;
  const vendorId = row.vendor_id || row.v_id || null;
  const customerName = row.c_name || row.customer_name || null;
  const vendorName = row.v_name || row.vendor_name || null;
  const displayName = row.display_name || customerName || vendorName || row.email?.split('@')[0] || 'Account';
  const isActive = row.is_active !== false;
  const status = isActive ? 'active' : 'inactive';

  const profile =
    role === 'vendor'
      ? {
          id: vendorId,
          name: vendorName,
          nameHe: row.v_name_he || vendorName,
          email: row.v_email || row.email,
          phone: row.v_phone || null,
          status: row.v_status || null,
          storeActive: row.v_status !== 'suspended',
          rating: numberValue(row.v_rating),
          productCount: intValue(row.product_count),
          totalOrders: intValue(row.vendor_order_count),
          totalRevenue: numberValue(row.vendor_revenue),
        }
      : role === 'customer'
        ? {
            id: customerId,
            name: customerName || displayName,
            email: row.c_email || row.email,
            phone: row.c_phone || null,
            status: null,
            points: intValue(row.c_points),
            loyaltyTier: row.c_loyalty_tier || null,
            totalOrders: intValue(row.c_total_orders ?? row.customer_order_count),
            totalSpent: numberValue(row.c_total_spent ?? row.customer_revenue),
          }
        : {
            id: row.id,
            name: displayName,
            email: row.email,
            role: 'admin',
          };

  return {
    id: row.id,
    userId: row.id,
    email: row.email,
    role,
    roleLabel: normalizeRoleLabel(role),
    displayName,
    name: displayName,
    nameHe: displayName,
    isActive,
    status,
    vendorId,
    vendor_id: vendorId,
    customerId,
    customer_id: customerId,
    lastLoginAt: isoDate(row.last_login_at),
    lastLogin: dateOnly(row.last_login_at),
    createdAt: isoDate(row.created_at),
    activeSessionCount: intValue(row.active_session_count),
    profile,

    // Backwards-compatible fields consumed by existing admin screens.
    storeName: vendorName || displayName,
    storeNameHe: row.v_name_he || vendorName || displayName,
    products: intValue(row.product_count),
    productCount: intValue(row.product_count),
    revenue: numberValue(row.vendor_revenue),
    totalRevenue: numberValue(row.vendor_revenue),
    totalOrders: role === 'vendor' ? intValue(row.vendor_order_count) : intValue(row.customer_order_count),
    rating: numberValue(row.v_rating),
    averageRating: numberValue(row.v_rating),
    orders: intValue(row.customer_order_count ?? row.c_total_orders),
    points: intValue(row.c_points),
    loyaltyPoints: intValue(row.c_points),
  };
}

function accountTypeToRole(type: AdminAccountType | null) {
  if (type === 'customers') return 'customer';
  if (type === 'vendors') return 'vendor';
  if (type === 'admins') return 'admin';
  return null;
}

const accountSelect = `
  WITH product_stats AS (
    SELECT vendor_id, COUNT(*)::int AS product_count
    FROM products
    WHERE COALESCE(status, 'published') <> 'archived'
    GROUP BY vendor_id
  ),
  vendor_order_stats AS (
    SELECT vendor_id, COUNT(*)::int AS order_count, COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE vendor_id IS NOT NULL
    GROUP BY vendor_id
  ),
  customer_order_stats AS (
    SELECT customer_id, COUNT(*)::int AS order_count, COALESCE(SUM(total), 0) AS revenue
    FROM orders
    WHERE customer_id IS NOT NULL
    GROUP BY customer_id
  ),
  session_stats AS (
    SELECT user_id, COUNT(*)::int AS active_session_count
    FROM user_sessions
    WHERE expires_at > NOW()
    GROUP BY user_id
  )
  SELECT
    u.id::text,
    u.email,
    u.role,
    u.vendor_id,
    u.customer_id::text,
    u.display_name,
    u.is_active,
    u.last_login_at,
    u.created_at,
    c.id::text AS c_id,
    c.name AS c_name,
    c.email AS c_email,
    c.phone AS c_phone,
    c.points AS c_points,
    c.loyalty_tier AS c_loyalty_tier,
    c.total_orders AS c_total_orders,
    c.total_spent AS c_total_spent,
    v.id AS v_id,
    v.name AS v_name,
    v.name_he AS v_name_he,
    v.email AS v_email,
    v.phone AS v_phone,
    v.status AS v_status,
    v.rating AS v_rating,
    COALESCE(ps.product_count, 0)::int AS product_count,
    COALESCE(vos.order_count, 0)::int AS vendor_order_count,
    COALESCE(vos.revenue, 0) AS vendor_revenue,
    COALESCE(cos.order_count, 0)::int AS customer_order_count,
    COALESCE(cos.revenue, 0) AS customer_revenue,
    COALESCE(ss.active_session_count, 0)::int AS active_session_count
  FROM users u
  LEFT JOIN customers c ON c.id = u.customer_id
  LEFT JOIN vendors v ON v.id = u.vendor_id
  LEFT JOIN product_stats ps ON ps.vendor_id = u.vendor_id
  LEFT JOIN vendor_order_stats vos ON vos.vendor_id = u.vendor_id
  LEFT JOIN customer_order_stats cos ON cos.customer_id = u.customer_id
  LEFT JOIN session_stats ss ON ss.user_id = u.id
`;

export async function listAdminAccounts(options: {
  type?: AdminAccountType | null;
  status?: AdminAccountStatus | null;
  search?: string | null;
}) {
  const params: unknown[] = [];
  const where: string[] = [];
  const role = accountTypeToRole(options.type || 'all');

  if (role) {
    params.push(role);
    where.push(`u.role = $${params.length}`);
  }

  if (options.status && options.status !== 'all') {
    params.push(options.status === 'active');
    where.push(`u.is_active = $${params.length}`);
  }

  const search = options.search?.trim().toLowerCase();
  if (search) {
    params.push(`%${search}%`);
    where.push(`(
      LOWER(u.email) LIKE $${params.length}
      OR LOWER(COALESCE(u.display_name, '')) LIKE $${params.length}
      OR LOWER(COALESCE(c.name, '')) LIKE $${params.length}
      OR LOWER(COALESCE(c.email, '')) LIKE $${params.length}
      OR LOWER(COALESCE(c.phone, '')) LIKE $${params.length}
      OR LOWER(COALESCE(v.name, '')) LIKE $${params.length}
      OR LOWER(COALESCE(v.email, '')) LIKE $${params.length}
      OR LOWER(COALESCE(v.phone, '')) LIKE $${params.length}
    )`);
  }

  const { rows } = await query(
    `${accountSelect}
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY u.created_at DESC`,
    params
  );

  return rows.map(normalizeAccount);
}

export async function getAdminAccountDetail(userId: string) {
  const { rows } = await query(`${accountSelect} WHERE u.id = $1`, [userId]);
  if (rows.length === 0) {
    throw new AdminAccountError('Account not found', 404);
  }

  const account = normalizeAccount(rows[0]);
  const orders = await getRecentOrdersForAccount(account);
  const sessions = await getActiveSessions(userId);
  const audit = await getAuditEntries(userId);

  return {
    account,
    profile: account.profile,
    orders,
    sessions,
    audit,
  };
}

async function getRecentOrdersForAccount(account: any) {
  if (!account.customerId && !account.vendorId) return [];

  const params: unknown[] = [];
  const where: string[] = [];
  if (account.customerId) {
    params.push(account.customerId);
    where.push(`o.customer_id = $${params.length}`);
  }
  if (account.vendorId) {
    params.push(account.vendorId);
    where.push(`o.vendor_id = $${params.length}`);
  }

  const { rows } = await query(
    `SELECT
       o.id::text,
       o.order_number,
       o.status,
       o.payment_status,
       o.total,
       o.customer_name,
       o.customer_email,
       o.vendor_id,
       v.name AS vendor_name,
       o.created_at
     FROM orders o
     LEFT JOIN vendors v ON v.id = o.vendor_id
     WHERE ${where.join(' OR ')}
     ORDER BY o.created_at DESC
     LIMIT 10`,
    params
  );

  return rows.map((order: any) => ({
    id: order.id,
    orderNumber: order.order_number || order.id,
    status: order.status || 'pending',
    paymentStatus: order.payment_status || null,
    total: numberValue(order.total),
    customerName: order.customer_name || order.customer_email || 'Customer',
    vendorId: order.vendor_id || null,
    vendorName: order.vendor_name || order.vendor_id || '',
    createdAt: isoDate(order.created_at),
  }));
}

async function getActiveSessions(userId: string) {
  const { rows } = await query(
    `SELECT id::text, device_info, ip_address, expires_at, created_at
     FROM user_sessions
     WHERE user_id = $1 AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map((session: any) => ({
    id: session.id,
    deviceInfo: session.device_info || {},
    ipAddress: session.ip_address || null,
    expiresAt: isoDate(session.expires_at),
    createdAt: isoDate(session.created_at),
  }));
}

async function getAuditEntries(userId: string) {
  try {
    await ensureAdminAccountTables();
    const { rows } = await query(
      `SELECT
         l.id::text,
         l.action,
         l.metadata,
         l.created_at,
         actor.email AS actor_email,
         actor.display_name AS actor_display_name
       FROM admin_audit_log l
       LEFT JOIN users actor ON actor.id = l.actor_user_id
       WHERE l.target_user_id = $1
       ORDER BY l.created_at DESC
       LIMIT 20`,
      [userId]
    );

    return rows.map((entry: any) => ({
      id: entry.id,
      action: entry.action,
      metadata: entry.metadata || {},
      actor: entry.actor_display_name || entry.actor_email || 'System',
      createdAt: isoDate(entry.created_at),
    }));
  } catch (error) {
    console.warn('Admin audit history unavailable:', error instanceof Error ? error.message : error);
    return [];
  }
}

async function logAudit(
  client: { query: (text: string, params?: unknown[]) => Promise<unknown> },
  actorUserId: string,
  targetUserId: string,
  action: string,
  metadata: Record<string, unknown> = {}
) {
  try {
    await ensureAdminAccountTables();
    await client.query(
      `INSERT INTO admin_audit_log (id, actor_user_id, target_user_id, action, metadata)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [randomUUID(), actorUserId, targetUserId, action, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.warn('Admin audit write skipped:', error instanceof Error ? error.message : error);
  }
}

export async function setAdminAccountActive(actor: AuthUser, userId: string, isActive: boolean) {
  await transaction(async (client) => {
    const { rows } = await client.query(
      'SELECT id::text, email, role, is_active FROM users WHERE id = $1 FOR UPDATE',
      [userId]
    );

    if (rows.length === 0) {
      throw new AdminAccountError('Account not found', 404);
    }

    const target = rows[0];

    if (!isActive && target.id === actor.id) {
      throw new AdminAccountError('You cannot deactivate your own admin account.', 409);
    }

    if (!isActive && target.role === 'admin') {
      const { rows: adminRows } = await client.query(
        `SELECT COUNT(*)::int AS count
         FROM users
         WHERE role = 'admin' AND is_active = true AND id <> $1`,
        [userId]
      );
      if ((adminRows[0]?.count || 0) < 1) {
        throw new AdminAccountError('Cannot deactivate the last active admin account.', 409);
      }
    }

    await client.query(
      'UPDATE users SET is_active = $2, updated_at = NOW() WHERE id = $1',
      [userId, isActive]
    );

    if (!isActive) {
      await client.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
    }

    await logAudit(client, actor.id, userId, isActive ? 'reactivate' : 'deactivate', {
      role: target.role,
      email: target.email,
      clearedSessions: !isActive,
    });
  });

  return getAdminAccountDetail(userId);
}

export async function revokeAdminAccountSessions(actor: AuthUser, userId: string) {
  if (userId === actor.id) {
    throw new AdminAccountError('Use logout to end your own current session.', 409);
  }

  await transaction(async (client) => {
    const { rows } = await client.query('SELECT id::text, email, role FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
      throw new AdminAccountError('Account not found', 404);
    }

    const result = await client.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
    await logAudit(client, actor.id, userId, 'revoke-sessions', {
      role: rows[0].role,
      email: rows[0].email,
      revokedSessions: result.rowCount || 0,
    });
  });

  return getAdminAccountDetail(userId);
}

export async function sendAdminAccountPasswordReset(actor: AuthUser, userId: string) {
  const { rows } = await query(
    'SELECT id::text, email, role, is_active FROM users WHERE id = $1',
    [userId]
  );

  if (rows.length === 0) {
    throw new AdminAccountError('Account not found', 404);
  }

  const target = rows[0];
  if (!target.is_active) {
    throw new AdminAccountError('Activate the account before sending a password reset.', 409);
  }

  const result = await requestPasswordReset(target.email);
  if (!result.success) {
    throw new AdminAccountError(result.error || 'Failed to send password reset.', 500);
  }

  await logAudit(
    { query },
    actor.id,
    userId,
    'reset-password',
    { role: target.role, email: target.email }
  );

  return getAdminAccountDetail(userId);
}
