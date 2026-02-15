import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';
import { createNotification } from '@/lib/services/notification-service.server';
import { sendRaw, sendMarketing } from '@/lib/services/email/email-service';

// ---------------------------------------------------------------------------
// POST /api/admin/notifications/broadcast
//
// Admin-only: Send an announcement to all customers or a specific segment.
//
// Body:
//   title: string         - Notification title (EN)
//   titleHe?: string      - Title (HE)
//   message: string       - Notification message (EN)
//   messageHe?: string    - Message (HE)
//   channels: string[]    - ['in_app', 'email'] (one or both)
//   segmentId?: string    - If set, only send to customers in this segment
//   emailSubject?: string - Custom email subject (defaults to title)
// ---------------------------------------------------------------------------

function getAdminUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const user = verifyAccessToken(token);
  return user?.role === 'admin' ? user : null;
}

export async function POST(request: NextRequest) {
  try {
    const admin = getAdminUser(request);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, titleHe, message, messageHe, channels, segmentId, emailSubject } = body;

    if (!title || !message || !channels || channels.length === 0) {
      return NextResponse.json(
        { error: 'title, message, and channels are required' },
        { status: 400 }
      );
    }

    // Get target customers
    let customerQuery = 'SELECT id, email, first_name, last_name FROM customers WHERE email IS NOT NULL';
    const params: any[] = [];

    if (segmentId) {
      // Get customer IDs from segment (assumes customer_segments join table or segment rules)
      const { rows: segmentRows } = await query(
        'SELECT customer_ids FROM customer_segments WHERE id = $1',
        [segmentId]
      );
      if (segmentRows.length > 0 && segmentRows[0].customer_ids) {
        const ids = segmentRows[0].customer_ids;
        customerQuery += ` AND id = ANY($1)`;
        params.push(ids);
      }
    }

    const { rows: customers } = await query(customerQuery, params);

    let inAppCount = 0;
    let emailCount = 0;

    // Send in-app notifications
    if (channels.includes('in_app')) {
      for (const customer of customers) {
        await createNotification({
          customerId: customer.id,
          type: 'system',
          channel: 'in_app',
          title,
          titleHe,
          message,
          messageHe,
        });
        inAppCount++;
      }
    }

    // Send email notifications
    if (channels.includes('email')) {
      const recipients = customers
        .filter((c: any) => c.email)
        .map((c: any) => ({
          email: c.email,
          name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || undefined,
        }));

      if (recipients.length > 0) {
        const emailHtml = `
          <h2>${title}</h2>
          <div style="background:#f5f0e8;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #2D5A27;">
            <p style="white-space:pre-wrap;margin:0;line-height:1.6;">${message}</p>
          </div>
          <p style="margin-top:24px;font-size:13px;color:#777;">
            This announcement was sent to KFAR Marketplace customers.
          </p>
        `;

        for (const recipient of recipients) {
          sendRaw(recipient.email, emailSubject || title, emailHtml)
            .catch(err => console.error('Broadcast email failed for', recipient.email, err));
          emailCount++;
        }
      }
    }

    console.log(
      `Admin broadcast: "${title}" -> ${inAppCount} in-app, ${emailCount} emails`,
      segmentId ? `(segment: ${segmentId})` : '(all customers)'
    );

    return NextResponse.json({
      success: true,
      summary: {
        totalCustomers: customers.length,
        inAppSent: inAppCount,
        emailsSent: emailCount,
        channels,
        segmentId: segmentId || null,
      },
    });
  } catch (error: any) {
    console.error('Admin broadcast error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send broadcast' },
      { status: 500 }
    );
  }
}
