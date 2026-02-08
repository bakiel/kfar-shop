import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const result = await notificationService.getNotifications(customerId, {
      unreadOnly,
      limit,
      offset
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, action, customerId } = body;

    if (!notificationId || !action) {
      return NextResponse.json(
        { error: 'Notification ID and action are required' },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case 'markAsRead':
        success = await notificationService.markAsRead(notificationId);
        break;
      case 'delete':
        success = await notificationService.deleteNotification(notificationId);
        break;
      case 'markAllAsRead':
        if (!customerId) {
          return NextResponse.json(
            { error: 'Customer ID is required for markAllAsRead' },
            { status: 400 }
          );
        }
        success = await notificationService.markAllAsRead(customerId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error processing notification action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}