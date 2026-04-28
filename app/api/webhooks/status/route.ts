import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = Object.fromEntries(new URLSearchParams(body));

    const { MessageSid, MessageStatus, To, From, ErrorCode, ErrorMessage } = params;

    const statusEmoji: Record<string, string> = {
      queued: 'queued',
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
      undelivered: 'undelivered',
    };

    console.log('WhatsApp Status Update:', {
      sid: MessageSid,
      status: statusEmoji[MessageStatus] || MessageStatus,
      to: To,
      from: From,
      errorCode: ErrorCode || null,
      errorMessage: ErrorMessage || null,
    });

    return new NextResponse('Status received', { status: 200 });
  } catch (error) {
    console.error('Error processing status update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
