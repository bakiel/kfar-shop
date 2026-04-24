import { query } from '@/lib/db/postgres-client';
import { REWARD_TIERS, POINTS_CONFIG, type RewardTier } from '@/lib/constants/rewards-constants';

// Re-export for backward compatibility
export { REWARD_TIERS, POINTS_CONFIG, type RewardTier };

export class RewardsService {
  // Award points for various actions
  static async awardPoints(
    userId: string,
    amount: number,
    reason: string,
    referenceType?: string,
    referenceId?: string
  ): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
      // Update points in database
      await query(
        `UPDATE rewards_points
         SET points = points + $1,
             lifetime_points = lifetime_points + $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [amount, userId]
      );

      // Record transaction
      await query(
        `INSERT INTO points_transactions (user_id, type, amount, reason, reference_type, reference_id, created_at)
         VALUES ($1, 'earned', $2, $3, $4, $5, NOW())`,
        [userId, amount, reason, referenceType, referenceId]
      );

      // Get updated balance
      const { rows } = await query(
        `SELECT points, tier FROM rewards_points WHERE user_id = $1`,
        [userId]
      );

      return { success: true, newBalance: rows[0]?.points || 0 };
    } catch (error) {
      console.error('Error awarding points:', error);
      return { success: false, error: 'Failed to award points' };
    }
  }

  // Award points for review submission
  static async awardReviewPoints(
    userId: string,
    reviewData: {
      hasText: boolean;
      textLength: number;
      hasPhotos: boolean;
      photosCount: number;
      isVerifiedPurchase: boolean;
    }
  ): Promise<{ pointsEarned: number }> {
    let points = POINTS_CONFIG.review.basic;

    if (reviewData.isVerifiedPurchase) {
      points = POINTS_CONFIG.review.verified;
    } else if (reviewData.hasPhotos && reviewData.photosCount > 0) {
      points = POINTS_CONFIG.review.withPhotos;
    } else if (reviewData.hasText && reviewData.textLength >= 50) {
      points = POINTS_CONFIG.review.detailed;
    }

    await this.awardPoints(
      userId,
      points,
      'Review submission',
      'review',
      new Date().toISOString()
    );

    return { pointsEarned: points };
  }

  // Award points for purchase
  static async awardPurchasePoints(
    userId: string,
    purchaseAmount: number,
    orderId: string
  ): Promise<{ pointsEarned: number }> {
    // Get user tier
    let tier = 'bronze';
    try {
      const { rows } = await query(
        `SELECT tier FROM rewards_points WHERE user_id = $1`,
        [userId]
      );
      tier = rows[0]?.tier || 'bronze';
    } catch (error) {
      console.log('Could not fetch user tier, using bronze');
    }

    const multiplier = POINTS_CONFIG.purchase.multiplier[tier as keyof typeof POINTS_CONFIG.purchase.multiplier];
    const basePoints = Math.floor(purchaseAmount * POINTS_CONFIG.purchase.rate);
    const totalPoints = Math.floor(basePoints * multiplier);

    await this.awardPoints(
      userId,
      totalPoints,
      `Purchase points (${tier} tier)`,
      'purchase',
      orderId
    );

    return { pointsEarned: totalPoints };
  }

  // Get user rewards data
  static async getUserRewards(userId: string) {
    try {
      // Get points and tier
      const { rows: pointsRows } = await query(
        `SELECT * FROM rewards_points WHERE user_id = $1`,
        [userId]
      );
      const points = pointsRows[0];

      // Get recent transactions
      const { rows: transactions } = await query(
        `SELECT * FROM points_transactions
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId]
      );

      // Get available rewards
      const { rows: catalog } = await query(
        `SELECT * FROM rewards_catalog
         WHERE active = true AND points_required <= $1
         ORDER BY points_required ASC`,
        [points?.points || 0]
      );

      // Get redeemed rewards
      const { rows: redeemed } = await query(
        `SELECT r.*, rc.* FROM redeemed_rewards r
         LEFT JOIN rewards_catalog rc ON r.reward_id = rc.id
         WHERE r.user_id = $1 AND r.status = 'active'
         ORDER BY r.created_at DESC`,
        [userId]
      );

      return {
        points: points?.points || 0,
        lifetimePoints: points?.lifetime_points || 0,
        tier: points?.tier || 'bronze',
        tierInfo: REWARD_TIERS[points?.tier || 'bronze'],
        nextTier: this.getNextTier(points?.lifetime_points || 0),
        transactions: transactions || [],
        availableRewards: catalog || [],
        redeemedRewards: redeemed || []
      };
    } catch (error) {
      console.error('Error getting user rewards:', error);
      // Return default data if database unavailable
      return {
        points: 0,
        lifetimePoints: 0,
        tier: 'bronze',
        tierInfo: REWARD_TIERS['bronze'],
        nextTier: this.getNextTier(0),
        transactions: [],
        availableRewards: [],
        redeemedRewards: []
      };
    }
  }

  // Calculate points needed for next tier
  static getNextTier(lifetimePoints: number): { tier: string; pointsNeeded: number } | null {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];

    for (const tier of tiers) {
      const tierInfo = REWARD_TIERS[tier];
      if (lifetimePoints < tierInfo.minPoints) {
        return {
          tier,
          pointsNeeded: tierInfo.minPoints - lifetimePoints
        };
      }
    }

    return null; // Already at highest tier
  }

  // Redeem a reward
  static async redeemReward(
    userId: string,
    rewardId: string
  ): Promise<{ success: boolean; redemptionCode?: string; error?: string }> {
    try {
      // Get reward details
      const { rows: rewardRows } = await query(
        `SELECT * FROM rewards_catalog WHERE id = $1 AND active = true`,
        [rewardId]
      );
      const reward = rewardRows[0];

      if (!reward) {
        return { success: false, error: 'Reward not found' };
      }

      // Check user points
      const { rows: userRows } = await query(
        `SELECT points, tier FROM rewards_points WHERE user_id = $1`,
        [userId]
      );
      const userPoints = userRows[0];

      if (!userPoints || userPoints.points < reward.points_required) {
        return { success: false, error: 'Insufficient points' };
      }

      // Check tier requirement
      if (reward.tier_required && !this.isTierEligible(userPoints.tier, reward.tier_required)) {
        return { success: false, error: 'Tier requirement not met' };
      }

      // Generate redemption code
      const redemptionCode = this.generateRedemptionCode();

      // Create redemption record
      await query(
        `INSERT INTO redeemed_rewards (user_id, reward_id, points_spent, redemption_code, expires_at, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [userId, rewardId, reward.points_required, redemptionCode, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
      );

      // Deduct points
      await query(
        `UPDATE rewards_points SET points = points - $1, updated_at = NOW() WHERE user_id = $2`,
        [reward.points_required, userId]
      );

      // Record transaction
      await query(
        `INSERT INTO points_transactions (user_id, type, amount, reason, reference_type, reference_id, created_at)
         VALUES ($1, 'redeemed', $2, $3, 'redemption', $4, NOW())`,
        [userId, -reward.points_required, `Redeemed: ${reward.name}`, redemptionCode]
      );

      return { success: true, redemptionCode };
    } catch (error) {
      console.error('Error redeeming reward:', error);
      return { success: false, error: 'Failed to redeem reward' };
    }
  }

  // Check if user tier meets requirement
  private static isTierEligible(userTier: string, requiredTier: string): boolean {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
    const userIndex = tierOrder.indexOf(userTier);
    const requiredIndex = tierOrder.indexOf(requiredTier);
    return userIndex >= requiredIndex;
  }

  // Generate unique redemption code
  private static generateRedemptionCode(): string {
    const prefix = 'KFAR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  // Check and award special bonuses
  static async checkSpecialBonuses(userId: string): Promise<void> {
    try {
      // Check for welcome bonus
      const { rows } = await query(
        `SELECT id FROM points_transactions WHERE user_id = $1 AND reason = 'Welcome bonus'`,
        [userId]
      );

      if (rows.length === 0) {
        await this.awardPoints(
          userId,
          POINTS_CONFIG.special.welcome,
          'Welcome bonus',
          'bonus',
          'welcome'
        );
      }
    } catch (error) {
      console.error('Error checking special bonuses:', error);
    }

    // Birthday bonus would check user profile for birthday
    // Anniversary bonus would check account creation date
  }
}
