import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const preferences = await notificationService.getPreferences(customerId);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { customerId, preferences } = body;
    
    if (!customerId || !preferences) {
      return NextResponse.json(
        { error: 'Customer ID and preferences are required' },
        { status: 400 }
      );
    }

    const success = await notificationService.updatePreferences(customerId, preferences);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}