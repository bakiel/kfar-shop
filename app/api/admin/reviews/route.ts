import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const { rows: columnRows } = await query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'product_reviews'`,
      []
    ).catch(() => ({ rows: [] as { column_name: string }[] }));
    const columns = new Set(columnRows.map(row => row.column_name));
    if (columns.size === 0) {
      return NextResponse.json({ success: true, reviews: [], count: 0 });
    }

    const statusExpr = columns.has('status') ? `COALESCE(pr.status, 'pending')` : `'pending'`;
    const titleExpr = columns.has('title') ? `COALESCE(pr.title, '')` : `''`;
    const customerNameExpr = columns.has('customer_name') ? `COALESCE(pr.customer_name, c.name, 'Customer')` : `COALESCE(c.name, 'Customer')`;
    const verifiedExpr = columns.has('is_verified_purchase') ? `COALESCE(pr.is_verified_purchase, false)` : `false`;
    const helpfulExpr = columns.has('helpful_count') ? `COALESCE(pr.helpful_count, 0)` : `0`;

    const { rows: reviews } = await query(
      `SELECT
         pr.id::text,
         pr.product_id::text AS product_id,
         COALESCE(p.name, 'Unknown product') AS product_name,
         pr.customer_id::text AS user_id,
         ${customerNameExpr} AS user_name,
         COALESCE(c.email, '') AS user_email,
         COALESCE(pr.rating, 0) AS rating,
         ${titleExpr} AS title,
         COALESCE(pr.comment, '') AS comment,
         ARRAY[]::text[] AS images,
         ${statusExpr} AS status,
         ${verifiedExpr} AS verified_purchase,
         pr.created_at,
         ${helpfulExpr} AS helpful_count
       FROM product_reviews pr
       LEFT JOIN products p ON p.id::text = pr.product_id::text
       LEFT JOIN customers c ON c.id::text = pr.customer_id::text
       WHERE ($1::text = 'all' OR ${statusExpr} = $1::text)
       ORDER BY created_at DESC
       LIMIT 100`,
      [status]
    ).catch(() => ({ rows: [] as any[] }));

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
      count: reviews?.length || 0,
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({
      success: true,
      reviews: [],
      count: 0,
    });
  }
}

export async function PATCH(request: NextRequest) {
  const user = getUser(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = body.id || body.reviewId;
    const nextStatus = body.status || (body.action === 'approve' ? 'approved' : body.action === 'reject' ? 'rejected' : null);
    if (!id || !nextStatus) {
      return NextResponse.json({ error: 'Review ID and status required' }, { status: 400 });
    }
    if (!['pending', 'approved', 'rejected'].includes(nextStatus)) {
      return NextResponse.json({ error: 'Invalid review status' }, { status: 400 });
    }

    const { rows: columnRows } = await query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'product_reviews'
         AND column_name = 'status'`,
      []
    ).catch(() => ({ rows: [] as { column_name: string }[] }));
    if (columnRows.length === 0) {
      return NextResponse.json({ error: 'Review status column unavailable' }, { status: 503 });
    }

    await query('UPDATE product_reviews SET status = $1 WHERE id = $2', [nextStatus, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reviews update error:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
