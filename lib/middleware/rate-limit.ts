import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export function rateLimit(config: RateLimitConfig = { windowMs: 60000, max: 100 }) {
  return async (request: NextRequest) => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    const userLimit = rateLimitMap.get(ip);
    
    if (!userLimit || now > userLimit.resetTime) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return null; // Allow request
    }
    
    if (userLimit.count >= config.max) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((userLimit.resetTime - now) / 1000).toString()
          }
        }
      );
    }
    
    userLimit.count++;
    return null; // Allow request
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, limit] of rateLimitMap.entries()) {
    if (now > limit.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Clean every minute