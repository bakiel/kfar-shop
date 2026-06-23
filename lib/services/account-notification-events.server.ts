import { query } from '@/lib/db/postgres-client';
import { createNotification } from '@/lib/services/notification-service.server';
import type { CreateNotificationData } from '@/lib/services/notification-service';

type NotificationPayload = Omit<CreateNotificationData, 'userId' | 'customerId'>;

async function createSafeNotification(data: CreateNotificationData) {
  try {
    await createNotification(data);
  } catch (error) {
    console.error('[account-notifications] failed to create notification:', error);
  }
}

export async function notifyUsers(userIds: string[], payload: NotificationPayload) {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  await Promise.all(uniqueIds.map((userId) => createSafeNotification({ ...payload, userId })));
}

export async function notifyVendorOwners(vendorId: string, payload: NotificationPayload) {
  const { rows } = await query(
    "SELECT id FROM users WHERE role = 'vendor' AND vendor_id = $1 AND is_active = true",
    [vendorId]
  );
  await notifyUsers(rows.map((row: any) => row.id), payload);
}

export async function notifyCustomerAccount(customerId: string | null | undefined, payload: NotificationPayload) {
  if (!customerId) return;

  const { rows } = await query(
    "SELECT id, customer_id FROM users WHERE role = 'customer' AND customer_id = $1 AND is_active = true",
    [customerId]
  );

  await Promise.all(rows.map((row: any) => createSafeNotification({
    ...payload,
    userId: row.id,
    customerId: row.customer_id,
  })));
}

export async function notifyActiveCustomers(payload: NotificationPayload, limit = 250) {
  const { rows } = await query(
    `SELECT id, customer_id
       FROM users
      WHERE role = 'customer'
        AND is_active = true
        AND customer_id IS NOT NULL
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit]
  );

  await Promise.all(rows.map((row: any) => createSafeNotification({
    ...payload,
    userId: row.id,
    customerId: row.customer_id,
  })));
}

export async function getVendorDisplayName(vendorId: string) {
  try {
    const { rows } = await query('SELECT name FROM vendors WHERE id = $1', [vendorId]);
    return rows[0]?.name || vendorId;
  } catch {
    return vendorId;
  }
}
