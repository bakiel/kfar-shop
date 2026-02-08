import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { rewardId, userId } = await request.json();

    // For now, just return success
    // In production, handle reward redemption
    return NextResponse.json({
      success: true,
      redemption: {
        id: Date.now().toString(),
        rewardId,
        userId,
        redeemedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem reward' },
      { status: 500 }
    );
  }
}