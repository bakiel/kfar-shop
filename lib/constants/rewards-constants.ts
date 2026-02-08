// Rewards constants - client-safe (no database imports)

export interface RewardTier {
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}

export const REWARD_TIERS: Record<string, RewardTier> = {
  bronze: {
    name: 'Bronze',
    minPoints: 0,
    benefits: ['5% off purchases', 'Birthday bonus'],
    color: '#CD7F32'
  },
  silver: {
    name: 'Silver',
    minPoints: 2000,
    benefits: ['10% off purchases', 'Free shipping on orders over $50', 'Early sale access'],
    color: '#C0C0C0'
  },
  gold: {
    name: 'Gold',
    minPoints: 5000,
    benefits: ['15% off purchases', 'Free shipping on all orders', 'VIP customer support', 'Exclusive products'],
    color: '#FFD700'
  },
  platinum: {
    name: 'Platinum',
    minPoints: 10000,
    benefits: ['20% off purchases', 'Free express shipping', 'Personal shopping assistant', 'First access to new products'],
    color: '#E5E4E2'
  }
};

export const POINTS_CONFIG = {
  review: {
    basic: 50,        // Just rating
    detailed: 100,    // Rating + text (50+ chars)
    withPhotos: 150,  // Rating + text + photos
    verified: 200     // Verified purchase review
  },
  purchase: {
    rate: 0.1,        // 10% of purchase amount as points
    multiplier: {
      bronze: 1,
      silver: 1.5,
      gold: 2,
      platinum: 2.5
    }
  },
  referral: {
    signup: 100,
    firstPurchase: 500
  },
  social: {
    share: 25,
    follow: 50
  },
  special: {
    welcome: 100,
    birthday: 200,
    anniversary: 150
  }
};
