// In-memory rate limiter for Next.js API routes
// Tracks requests per IP with sliding window

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const MAX_ENTRIES = 10000; // Cap to prevent memory exhaustion from many unique IPs
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

// Default configs per route type
export const RATE_LIMITS = {
  login:    { windowMs: 15 * 60 * 1000, maxRequests: 10 },  // 10 attempts per 15 min
  register: { windowMs: 60 * 60 * 1000, maxRequests: 5 },   // 5 registrations per hour
  refresh:  { windowMs: 60 * 1000, maxRequests: 30 },        // 30 refreshes per minute
  order:    { windowMs: 60 * 60 * 1000, maxRequests: 20 },   // 20 orders per hour per IP
  api:      { windowMs: 60 * 1000, maxRequests: 60 },        // 60 requests per minute general
} as const;

/**
 * Check rate limit for a given key (typically IP + route).
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // Evict oldest entries if at capacity
    if (store.size >= MAX_ENTRIES) {
      let oldest: string | null = null;
      let oldestTime = Infinity;
      for (const [k, v] of store) {
        if (v.resetAt < oldestTime) {
          oldestTime = v.resetAt;
          oldest = k;
        }
      }
      if (oldest) store.delete(oldest);
    }
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Get client IP from Next.js request headers.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
