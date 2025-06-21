import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { validateBody, schemas } from '@/lib/middleware/validate';
import { aiService } from '@/lib/services/ai-service';

// Stricter rate limiting for AI endpoints (more expensive)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30 // 30 requests per minute
});

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const rateLimitResult = await limiter(request);
  if (rateLimitResult) return rateLimitResult;

  // 2. Validate input
  const validationResult = await validateBody(schemas.aiCommand)(request);
  if (validationResult instanceof NextResponse) return validationResult;

  try {
    const { input, context } = (request as any).validatedBody;

    // 3. Call AI service (API key is server-side only)
    const result = await aiService.enhanceCommand(input, context);

    // 4. Log usage for monitoring
    console.log('AI API called:', {
      timestamp: new Date().toISOString(),
      input: input.substring(0, 50) + '...', // Log partial input
      intent: result.intent,
      confidence: result.confidence
    });

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable' },
      { status: 503 }
    );
  }
}