import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rate-limit';
import { validateBody, schemas } from '@/lib/middleware/validate';
import { supabaseAdmin } from '@/lib/supabase/server';

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const rateLimitResult = await limiter(request);
  if (rateLimitResult) return rateLimitResult;

  // 2. Authentication
  const authResult = await authenticateRequest(request);
  if (authResult instanceof NextResponse) return authResult;

  // 3. Input validation
  const validationResult = await validateBody(schemas.createOrder)(request);
  if (validationResult instanceof NextResponse) return validationResult;

  try {
    // 4. Get validated data and user
    const user = (authResult as any).user;
    const orderData = (request as any).validatedBody;

    // 5. Business logic with database
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        ...orderData,
        customer_id: user.id,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // 6. Success response
    return NextResponse.json({
      success: true,
      order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Example of a public endpoint with just rate limiting
export async function GET(request: NextRequest) {
  // Only rate limiting for public endpoints
  const rateLimitResult = await limiter(request);
  if (rateLimitResult) return rateLimitResult;

  return NextResponse.json({
    message: 'This is a public endpoint',
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    }
  });
}