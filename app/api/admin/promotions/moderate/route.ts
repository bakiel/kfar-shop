import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { promotionId, action, priority } = await request.json();

    // Validate input
    if (!promotionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // In production, this would update the database
    console.log(`Promotion ${promotionId} ${action}d with priority ${priority}`);

    // Simulate database update
    const updatedPromotion = {
      id: promotionId,
      status: action === 'approve' ? 'approved' : 'rejected',
      priority: priority || 5,
      moderated_at: new Date().toISOString(),
      moderated_by: 'admin' // In production, get from auth
    };

    // If approved, schedule it to go active
    if (action === 'approve') {
      // In production, you might want to check start_date
      // and set up a cron job or trigger to activate it
      console.log('Scheduling promotion to go active...');
    }

    return NextResponse.json({
      success: true,
      promotion: updatedPromotion,
      message: `Promotion ${action}d successfully`
    });
  } catch (error) {
    console.error('Error moderating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to moderate promotion' },
      { status: 500 }
    );
  }
}