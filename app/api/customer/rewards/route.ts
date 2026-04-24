import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';
import { query } from '@/lib/db/postgres-client';

function getUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  return token ? verifyAccessToken(token) : null;
}

// GET - Retrieve rewards data for authenticated customer
export async function GET(request: NextRequest) {
  try {
    const user = getUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (user.role !== 'customer' || !user.customerId) {
      return NextResponse.json(
        { error: 'Customer access required' },
        { status: 403 }
      );
    }

    // Get rewards data
    const { rows } = await query(
      'SELECT * FROM rewards_points WHERE customer_id = $1',
      [user.customerId]
    );

    if (rows.length === 0) {
      // No rewards record yet - return defaults
      return NextResponse.json({
        success: true,
        rewards: {
          customerId: user.customerId,
          balance: 0,
          lifetimeEarned: 0,
          lifetimeRedeemed: 0,
          tier: 'bronze',
          nextTier: 'silver',
          pointsToNextTier: 500,
        },
      });
    }

    const rewards = rows[0];

    // Calculate tier progression
    const tierThresholds: Record<string, { next: string | null; pointsNeeded: number }> = {
      bronze: { next: 'silver', pointsNeeded: 500 },
      silver: { next: 'gold', pointsNeeded: 2000 },
      gold: { next: 'platinum', pointsNeeded: 5000 },
      platinum: { next: null, pointsNeeded: 0 },
    };

    const currentTier = rewards.tier || 'bronze';
    const tierInfo = tierThresholds[currentTier] || tierThresholds.bronze;
    const lifetimeEarned = parseFloat(rewards.lifetime_earned || '0');
    const pointsToNextTier = tierInfo.next
      ? Math.max(0, tierInfo.pointsNeeded - lifetimeEarned)
      : 0;

    return NextResponse.json({
      success: true,
      rewards: {
        customerId: user.customerId,
        balance: parseFloat(rewards.balance || '0'),
        lifetimeEarned,
        lifetimeRedeemed: parseFloat(rewards.lifetime_redeemed || '0'),
        tier: currentTier,
        nextTier: tierInfo.next,
        pointsToNextTier,
        createdAt: rewards.created_at,
        updatedAt: rewards.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
