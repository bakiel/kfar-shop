import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://us1-aware-chamois-36476.upstash.io',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'd16e3251-ce73-43ca-beb3-762fe42faa56',
});

export class UpstashRedisService {
  // Cache keys pattern
  private readonly CACHE_PREFIX = 'kfar:';
  private readonly TTL = {
    products: 3600, // 1 hour
    vendors: 7200,  // 2 hours
    orders: 300,    // 5 minutes
    cart: 86400,    // 24 hours
    popular: 1800,  // 30 minutes
  };

  // Product caching
  async cacheProduct(productId: string, data: any) {
    const key = `${this.CACHE_PREFIX}product:${productId}`;
    await redis.set(key, JSON.stringify(data), { ex: this.TTL.products });
  }

  async getProduct(productId: string) {
    const key = `${this.CACHE_PREFIX}product:${productId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached as string) : null;
  }

  // Vendor caching
  async cacheVendor(vendorId: string, data: any) {
    const key = `${this.CACHE_PREFIX}vendor:${vendorId}`;
    await redis.set(key, JSON.stringify(data), { ex: this.TTL.vendors });
  }

  async getVendor(vendorId: string) {
    const key = `${this.CACHE_PREFIX}vendor:${vendorId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached as string) : null;
  }

  // Order tracking
  async trackOrder(orderId: string, data: any) {
    const key = `${this.CACHE_PREFIX}order:${orderId}`;
    await redis.set(key, JSON.stringify({
      ...data,
      timestamp: new Date().toISOString()
    }), { ex: this.TTL.orders });
  }

  async getOrder(orderId: string) {
    const key = `${this.CACHE_PREFIX}order:${orderId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached as string) : null;
  }

  // Cart persistence
  async saveCart(userId: string, cart: any) {
    const key = `${this.CACHE_PREFIX}cart:${userId}`;
    await redis.set(key, JSON.stringify(cart), { ex: this.TTL.cart });
  }

  async getCart(userId: string) {
    const key = `${this.CACHE_PREFIX}cart:${userId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached as string) : null;
  }

  async clearCart(userId: string) {
    const key = `${this.CACHE_PREFIX}cart:${userId}`;
    await redis.del(key);
  }

  // Popular products tracking
  async incrementProductView(productId: string) {
    const key = `${this.CACHE_PREFIX}popular:products`;
    await redis.zincrby(key, 1, productId);
    await redis.expire(key, this.TTL.popular);
  }

  async getPopularProducts(limit: number = 10) {
    const key = `${this.CACHE_PREFIX}popular:products`;
    const popular = await redis.zrevrange(key, 0, limit - 1, { withScores: true });
    
    // Format the response
    const products = [];
    for (let i = 0; i < popular.length; i += 2) {
      products.push({
        productId: popular[i],
        views: popular[i + 1]
      });
    }
    
    return products;
  }

  // Rate limiting
  async checkRateLimit(identifier: string, limit: number, window: number) {
    const key = `${this.CACHE_PREFIX}ratelimit:${identifier}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    return {
      allowed: current <= limit,
      current,
      limit,
      remaining: Math.max(0, limit - current)
    };
  }

  // Vendor notifications tracking
  async trackNotification(vendorId: string, type: 'sms' | 'whatsapp' | 'email', orderId: string) {
    const key = `${this.CACHE_PREFIX}notifications:${vendorId}`;
    const notification = {
      type,
      orderId,
      timestamp: new Date().toISOString()
    };
    
    await redis.lpush(key, JSON.stringify(notification));
    await redis.ltrim(key, 0, 99); // Keep last 100 notifications
    await redis.expire(key, 86400); // 24 hours
  }

  async getVendorNotifications(vendorId: string) {
    const key = `${this.CACHE_PREFIX}notifications:${vendorId}`;
    const notifications = await redis.lrange(key, 0, -1);
    return notifications.map(n => JSON.parse(n as string));
  }

  // Analytics
  async trackPageView(page: string) {
    const today = new Date().toISOString().split('T')[0];
    const key = `${this.CACHE_PREFIX}analytics:pageviews:${today}`;
    await redis.hincrby(key, page, 1);
    await redis.expire(key, 86400 * 7); // Keep for 7 days
  }

  async getPageViews(date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const key = `${this.CACHE_PREFIX}analytics:pageviews:${targetDate}`;
    return await redis.hgetall(key);
  }

  // Session management
  async createSession(sessionId: string, userData: any, ttl: number = 3600) {
    const key = `${this.CACHE_PREFIX}session:${sessionId}`;
    await redis.set(key, JSON.stringify(userData), { ex: ttl });
  }

  async getSession(sessionId: string) {
    const key = `${this.CACHE_PREFIX}session:${sessionId}`;
    const session = await redis.get(key);
    return session ? JSON.parse(session as string) : null;
  }

  async deleteSession(sessionId: string) {
    const key = `${this.CACHE_PREFIX}session:${sessionId}`;
    await redis.del(key);
  }

  // Cache invalidation
  async invalidateVendorCache(vendorId: string) {
    const keys = [
      `${this.CACHE_PREFIX}vendor:${vendorId}`,
      `${this.CACHE_PREFIX}vendor:${vendorId}:products`,
    ];
    await redis.del(...keys);
  }

  async invalidateProductCache(productId: string) {
    const key = `${this.CACHE_PREFIX}product:${productId}`;
    await redis.del(key);
  }

  // Health check
  async ping() {
    try {
      await redis.ping();
      return { status: 'ok', service: 'redis' };
    } catch (error) {
      return { status: 'error', service: 'redis', error: error.message };
    }
  }
}

// Export singleton instance
export const redisService = new UpstashRedisService();