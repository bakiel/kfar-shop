import { query } from '@/lib/db/postgres-client';

// ── Types ──────────────────────────────────────────────────────────────

export interface CRMCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  loyalty_tier: string;
  points: number;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  tags: string[];
  notes: string | null;
  addresses: any;
  created_at: string;
  updated_at: string;
}

export interface CRMActivity {
  id: string;
  customer_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  performed_by: string | null;
  metadata: any;
  created_at: string;
}

export interface CRMSegment {
  id: string;
  name: string;
  description: string | null;
  segment_type: 'manual' | 'auto';
  rules: any;
  customer_count: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerListOptions {
  page?: number;
  limit?: number;
  search?: string;
  tier?: string;
  segment?: string;
  tag?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CustomerStats {
  totalCustomers: number;
  newThisMonth: number;
  activeShoppers: number;
  byTier: { tier: string; count: number }[];
}

// ── Customer Queries ───────────────────────────────────────────────────

export async function getCustomers(opts: CustomerListOptions = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    tier,
    segment,
    tag,
    sortBy = 'created_at',
    sortDir = 'desc',
  } = opts;

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(
      `(c.name ILIKE $${paramIdx} OR c.email ILIKE $${paramIdx} OR c.phone ILIKE $${paramIdx})`
    );
    params.push(`%${search}%`);
    paramIdx++;
  }

  if (tier) {
    conditions.push(`c.loyalty_tier = $${paramIdx}`);
    params.push(tier);
    paramIdx++;
  }

  if (tag) {
    conditions.push(`$${paramIdx} = ANY(c.tags)`);
    params.push(tag);
    paramIdx++;
  }

  // Segment filter uses a subquery
  let segmentJoin = '';
  if (segment) {
    segmentJoin = `INNER JOIN customer_segment_members csm ON csm.customer_id = c.id AND csm.segment_id = $${paramIdx}`;
    params.push(segment);
    paramIdx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort column to prevent SQL injection
  const allowedSorts = ['created_at', 'name', 'email', 'loyalty_tier', 'points', 'total_orders', 'total_spent'];
  const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
  const safeDir = sortDir === 'asc' ? 'ASC' : 'DESC';

  // Count query
  const countSql = `
    SELECT COUNT(DISTINCT c.id)::int as total
    FROM customers c
    ${segmentJoin}
    ${whereClause}
  `;
  const { rows: countRows } = await query(countSql, params);
  const total = countRows[0]?.total || 0;

  // Data query
  const offset = (page - 1) * limit;
  const dataSql = `
    SELECT DISTINCT c.id, c.name, c.email, c.phone, c.loyalty_tier,
           c.points, c.total_orders, c.total_spent, c.last_order_at,
           c.tags, c.notes, c.addresses, c.created_at, c.updated_at
    FROM customers c
    ${segmentJoin}
    ${whereClause}
    ORDER BY c.${safeSort} ${safeDir}
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;
  const dataParams = [...params, limit, offset];
  const { rows } = await query<CRMCustomer>(dataSql, dataParams);

  return {
    customers: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerById(id: string): Promise<CRMCustomer | null> {
  const { rows } = await query<CRMCustomer>(
    `SELECT c.id, c.name, c.email, c.phone, c.loyalty_tier,
            c.points, c.total_orders, c.total_spent, c.last_order_at,
            c.tags, c.notes, c.addresses, c.created_at, c.updated_at
     FROM customers c
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] || null;
}

// ── Activity Log ───────────────────────────────────────────────────────

export async function getCustomerActivity(
  customerId: string,
  limit: number = 50
): Promise<CRMActivity[]> {
  const { rows } = await query<CRMActivity>(
    `SELECT id, customer_id, activity_type, title, description,
            performed_by, metadata, created_at
     FROM crm_activity_log
     WHERE customer_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [customerId, limit]
  );
  return rows;
}

export async function logActivity(
  customerId: string,
  type: string,
  title: string,
  description?: string,
  performedBy?: string,
  metadata?: any
): Promise<CRMActivity> {
  const { rows } = await query<CRMActivity>(
    `INSERT INTO crm_activity_log (customer_id, activity_type, title, description, performed_by, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [customerId, type, title, description || null, performedBy || null, metadata ? JSON.stringify(metadata) : null]
  );
  return rows[0];
}

// ── Notes ──────────────────────────────────────────────────────────────

export async function addNote(
  customerId: string,
  note: string,
  performedBy?: string
): Promise<CRMActivity> {
  // Append note to customer's notes field
  await query(
    `UPDATE customers
     SET notes = CASE
       WHEN notes IS NULL OR notes = '' THEN $2
       ELSE notes || E'\n---\n' || $2
     END,
     updated_at = NOW()
     WHERE id = $1`,
    [customerId, `[${new Date().toISOString().split('T')[0]}] ${note}`]
  );

  // Log activity
  return logActivity(
    customerId,
    'note_added',
    'Note added',
    note,
    performedBy
  );
}

// ── Tags ───────────────────────────────────────────────────────────────

export async function addTag(
  customerId: string,
  tag: string,
  performedBy?: string
): Promise<string[]> {
  const { rows } = await query<{ tags: string[] }>(
    `UPDATE customers
     SET tags = array_append(
       CASE WHEN tags IS NULL THEN ARRAY[]::text[] ELSE tags END,
       $2
     ),
     updated_at = NOW()
     WHERE id = $1
     AND NOT ($2 = ANY(COALESCE(tags, ARRAY[]::text[])))
     RETURNING tags`,
    [customerId, tag]
  );

  if (rows.length > 0) {
    await logActivity(customerId, 'tag_added', `Tag added: ${tag}`, undefined, performedBy);
  }

  // Return current tags even if no update happened (tag already existed)
  if (rows.length === 0) {
    const { rows: current } = await query<{ tags: string[] }>(
      'SELECT tags FROM customers WHERE id = $1',
      [customerId]
    );
    return current[0]?.tags || [];
  }

  return rows[0].tags;
}

export async function removeTag(
  customerId: string,
  tag: string
): Promise<string[]> {
  const { rows } = await query<{ tags: string[] }>(
    `UPDATE customers
     SET tags = array_remove(COALESCE(tags, ARRAY[]::text[]), $2),
         updated_at = NOW()
     WHERE id = $1
     RETURNING tags`,
    [customerId, tag]
  );
  return rows[0]?.tags || [];
}

// ── Segments ───────────────────────────────────────────────────────────

export async function getSegments(): Promise<CRMSegment[]> {
  const { rows } = await query<CRMSegment>(
    `SELECT cs.id, cs.name, cs.description, cs.type as segment_type, cs.rules,
            cs.created_at, cs.updated_at,
            COUNT(csm.customer_id)::int as customer_count
     FROM customer_segments cs
     LEFT JOIN customer_segment_members csm ON csm.segment_id = cs.id
     GROUP BY cs.id, cs.name, cs.description, cs.type, cs.rules, cs.created_at, cs.updated_at
     ORDER BY cs.created_at DESC`
  );
  return rows;
}

export async function getSegmentCustomers(
  segmentId: string,
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit;

  const { rows: countRows } = await query(
    'SELECT COUNT(*)::int as total FROM customer_segment_members WHERE segment_id = $1',
    [segmentId]
  );
  const total = countRows[0]?.total || 0;

  const { rows } = await query<CRMCustomer>(
    `SELECT c.id, c.name, c.email, c.phone, c.loyalty_tier,
            c.points, c.total_orders, c.total_spent, c.last_order_at,
            c.tags, c.notes, c.addresses, c.created_at, c.updated_at
     FROM customers c
     INNER JOIN customer_segment_members csm ON csm.customer_id = c.id
     WHERE csm.segment_id = $1
     ORDER BY c.name ASC
     LIMIT $2 OFFSET $3`,
    [segmentId, limit, offset]
  );

  return {
    customers: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createSegment(data: {
  name: string;
  description?: string;
  segment_type: 'manual' | 'auto';
  rules?: any;
}): Promise<CRMSegment> {
  const { rows } = await query<CRMSegment>(
    `INSERT INTO customer_segments (name, description, type, rules)
     VALUES ($1, $2, $3, $4)
     RETURNING *, type as segment_type, 0 as customer_count`,
    [data.name, data.description || null, data.segment_type, data.rules ? JSON.stringify(data.rules) : null]
  );
  return rows[0];
}

// ── Stats ──────────────────────────────────────────────────────────────

export async function getCustomerStats(): Promise<CustomerStats> {
  // Total customers
  const { rows: totalRows } = await query<{ count: number }>(
    'SELECT COUNT(*)::int as count FROM customers'
  );

  // New this month
  const { rows: newRows } = await query<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM customers
     WHERE created_at >= date_trunc('month', CURRENT_DATE)`
  );

  // Active shoppers (ordered in last 30 days)
  const { rows: activeRows } = await query<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM customers
     WHERE last_order_at >= CURRENT_DATE - INTERVAL '30 days'`
  );

  // By tier
  const { rows: tierRows } = await query<{ tier: string; count: number }>(
    `SELECT COALESCE(loyalty_tier, 'bronze') as tier, COUNT(*)::int as count
     FROM customers
     GROUP BY loyalty_tier
     ORDER BY count DESC`
  );

  return {
    totalCustomers: totalRows[0]?.count || 0,
    newThisMonth: newRows[0]?.count || 0,
    activeShoppers: activeRows[0]?.count || 0,
    byTier: tierRows,
  };
}
