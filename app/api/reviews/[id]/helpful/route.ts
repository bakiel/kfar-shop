import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const reviewId = params.id;

    // For now, return mock response
    // TODO: Track helpful votes in PostgreSQL when reviews table is created
    return NextResponse.json({
      success: true,
      message: 'Review marked as helpful'
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    return NextResponse.json(
      { error: 'Failed to mark review as helpful' },
      { status: 500 }
    );
  }
}
