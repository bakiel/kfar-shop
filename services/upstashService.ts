// Upstash Service for KFAR Marketplace
import { Redis } from '@upstash/redis';
import { Kafka } from '@upstash/kafka';

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Initialize Upstash Kafka (if needed)
const kafka = new Kafka({
  url: process.env.UPSTASH_KAFKA_REST_URL!,
  username: process.env.UPSTASH_KAFKA_REST_USERNAME!,
  password: process.env.UPSTASH_KAFKA_REST_PASSWORD!,
});

export class UpstashService {
  // Cache management
  static async cacheSet(key: string, value: any, expirationInSeconds?: number) {
    try {
      if (expirationInSeconds) {
        await redis.setex(key, expirationInSeconds, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error('Upstash cache set error:', error);
      return false;
    }
  }

  static async cacheGet(key: string) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value as string) : null;
    } catch (error) {
      console.error('Upstash cache get error:', error);
      return null;
    }
  }

  // Shopping cart management
  static async saveCart(userId: string, cart: any) {
    const key = `cart:${userId}`;
    return await this.cacheSet(key, cart, 86400); // 24 hour expiration
  }

  static async getCart(userId: string) {
    const key = `cart:${userId}`;
    return await this.cacheGet(key);
  }

  static async clearCart(userId: string) {
    const key = `cart:${userId}`;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Clear cart error:', error);
      return false;
    }
  }

  // Session management
  static async createSession(sessionId: string, userData: any) {
    const key = `session:${sessionId}`;
    return await this.cacheSet(key, userData, 3600); // 1 hour expiration
  }

  static async getSession(sessionId: string) {
    const key = `session:${sessionId}`;
    return await this.cacheGet(key);
  }

  // Product views tracking
  static async incrementProductView(productId: string) {
    const key = `views:${productId}`;
    try {
      const views = await redis.incr(key);
      return views;
    } catch (error) {
      console.error('Increment view error:', error);
      return 0;
    }
  }

  // Real-time inventory updates
  static async updateInventory(productId: string, quantity: number) {
    const key = `inventory:${productId}`;
    try {
      await redis.set(key, quantity);
      
      // Publish to Kafka for real-time updates
      await kafka.producer.produce({
        topic: 'inventory-updates',
        messages: [{
          key: productId,
          value: JSON.stringify({ productId, quantity, timestamp: Date.now() })
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Update inventory error:', error);
      return false;
    }
  }

  static async getInventory(productId: string): Promise<number> {
    const key = `inventory:${productId}`;
    try {
      const quantity = await redis.get(key);
      return quantity ? parseInt(quantity as string) : 0;
    } catch (error) {
      console.error('Get inventory error:', error);
      return 0;
    }
  }

  // Rate limiting
  static async checkRateLimit(identifier: string, limit: number = 100, window: number = 3600) {
    const key = `rate:${identifier}`;
    try {
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, window);
      }
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        reset: window
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      return { allowed: true, remaining: limit, reset: window };
    }
  }

  // Popular products tracking
  static async trackPopularProduct(productId: string) {
    const key = 'popular:products';
    try {
      await redis.zincrby(key, 1, productId);
      return true;
    } catch (error) {
      console.error('Track popular error:', error);
      return false;
    }
  }

  static async getPopularProducts(limit: number = 10) {
    const key = 'popular:products';
    try {
      const products = await redis.zrevrange(key, 0, limit - 1, { withScores: true });
      return products;
    } catch (error) {
      console.error('Get popular error:', error);
      return [];
    }
  }

  // Search suggestions caching
  static async cacheSearchSuggestion(query: string, results: any[]) {
    const key = `search:${query.toLowerCase()}`;
    return await this.cacheSet(key, results, 3600); // 1 hour cache
  }

  static async getSearchSuggestion(query: string) {
    const key = `search:${query.toLowerCase()}`;
    return await this.cacheGet(key);
  }
}

export default UpstashService;
