'use client';

import React from 'react';
import { getAverageRating, getProductReviews } from '@/lib/data/review-mock-data';

interface ReviewSummaryProps {
  productId: string;
  showCount?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function ReviewSummary({ 
  productId, 
  showCount = true, 
  size = 'medium' 
}: ReviewSummaryProps) {
  const reviews = getProductReviews(productId);
  const averageRating = getAverageRating(productId);
  
  if (reviews.length === 0) {
    return null;
  }

  const starSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }[size];

  const textSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  }[size];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${starSize} ${
              star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {renderStars(averageRating)}
      {showCount && (
        <span className={`${textSize} text-gray-600`}>
          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}