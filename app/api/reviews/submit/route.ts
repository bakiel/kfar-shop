import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    // Require a valid customer JWT — prevents anonymous loyalty-point farming
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const user = token ? verifyAccessToken(token) : null;
    if (!user || user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, rating, title, comment, images } = body;

    // Validate required fields
    if (!productId || !rating || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate points earned based on review quality
    const pointsEarned = images?.length > 0 ? 150 : comment?.length > 50 ? 100 : 50;

    // For now, return mock response
    // TODO: Store reviews in PostgreSQL when reviews table is created
    return NextResponse.json({
      success: true,
      reviewId: `review_${Date.now()}`,
      pointsEarned,
      message: 'Review submitted successfully!'
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
