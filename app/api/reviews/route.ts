import { NextRequest, NextResponse } from 'next/server';
import { productReviews } from '@/lib/data/review-mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const sort = searchParams.get('sort') || 'recent';
  const rating = searchParams.get('rating');

  // If no productId, return all reviews or recent reviews
  if (!productId) {
    try {
      // Return recent reviews across all products
      const allReviews = productReviews
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20); // Return last 20 reviews

      return NextResponse.json({
        reviews: allReviews,
        stats: {
          total: productReviews.length,
          average: 4.5,
          message: 'Showing recent reviews across all products'
        }
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }
  }

  try {
    // Use mock data for reviews
    const reviews = productReviews
      .filter(r => r.productId === productId)
      .filter(r => !rating || r.rating === parseInt(rating))
      .sort((a, b) => {
        switch (sort) {
          case 'helpful':
            return b.helpful - a.helpful;
          case 'rating':
            return b.rating - a.rating;
          case 'recent':
          default:
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
      });

    // Transform data for frontend
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      customerId: review.author?.id,
      customerName: review.author?.name || 'Anonymous',
      customerAvatar: review.author?.image,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images || [],
      helpfulCount: review.helpful || 0,
      verified: review.author?.verified || false,
      createdAt: review.date,
      loyaltyTier: review.author?.memberType
    }));

    // Calculate stats
    const totalReviews = transformedReviews.length;
    const averageRating = totalReviews > 0
      ? transformedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    return NextResponse.json({
      reviews: transformedReviews,
      stats: {
        total: totalReviews,
        average: Math.round(averageRating * 10) / 10
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
