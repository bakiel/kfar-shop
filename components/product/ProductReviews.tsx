'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { productReviews, getProductReviews, getReviewStats } from '@/lib/data/review-mock-data';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const reviews = getProductReviews(productId);
  const stats = getReviewStats(productId);

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'helpful':
        return b.helpful - a.helpful;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star text-sm ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="mt-12 text-center py-8">
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
        Customer Reviews
      </h2>

      {/* Review Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span className="text-4xl font-bold" style={{ color: '#478c0b' }}>
                {stats.average}
              </span>
              <div>
                {renderStars(Math.round(stats.average))}
                <p className="text-sm text-gray-600 mt-1">
                  Based on {stats.total} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating as keyof typeof stats.distribution];
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-3">{rating}</span>
                  <i className="fas fa-star text-sm text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: '#478c0b'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Showing {reviews.length} reviews</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
          style={{ focusRingColor: '#478c0b' }}
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            {/* Review Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={review.author.image}
                  alt={review.author.name || "Image"}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = '/images/default-avatar.jpg';
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>
                      {review.author.name}
                      {review.author.verified && (
                        <i 
                          className="fas fa-check-circle text-sm ml-2" 
                          style={{ color: '#478c0b' }}
                          title="Verified Purchaser"
                        />
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {review.author.location}
                      {review.author.memberType === 'community' && (
                        <span className="ml-2 text-xs px-2 py-1 rounded-full" 
                              style={{ backgroundColor: '#cfe7c1', color: '#478c0b' }}>
                          Community Member
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    {renderStars(review.rating)}
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(review.date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <h5 className="font-semibold mb-2" style={{ color: '#3a3a1d' }}>
              {review.title}
            </h5>
            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Review Images */}
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2 mb-4">
                {review.images.map((image, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={index + 1 ? `Review image ${index + 1}` : "Image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Vendor Response */}
            {review.vendorResponse && (
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#fef9ef' }}>
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-store text-sm" style={{ color: '#478c0b' }} />
                  <span className="font-semibold text-sm" style={{ color: '#3a3a1d' }}>
                    Vendor Response
                  </span>
                  <span className="text-sm text-gray-500">
                    • {formatDate(review.vendorResponse.date)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{review.vendorResponse.message}</p>
              </div>
            )}

            {/* Helpful Button */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
                <i className="far fa-thumbs-up" />
                Helpful ({review.helpful})
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-800">
                <i className="far fa-flag" /> Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Write Review Button */}
      <div className="mt-8 text-center">
        <button 
          className="px-8 py-3 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          style={{ backgroundColor: '#478c0b' }}
        >
          <i className="fas fa-pen mr-2" />
          Write a Review
        </button>
      </div>
    </div>
  );
}