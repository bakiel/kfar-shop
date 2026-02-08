'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FaStar, 
  FaCheck, 
  FaTimes, 
  FaExclamationTriangle,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import { toast } from '@/components/ui/use-toast';

interface Review {
  id: string;
  product_id: string;
  product_name: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  verified_purchase: boolean;
  created_at: string;
  helpful_count: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerateReview = async (reviewId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/reviews/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Review ${action}d successfully`,
        });
        fetchReviews();
      } else {
        throw new Error('Failed to moderate review');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to moderate review",
      });
    }
  };

  const filteredReviews = reviews.filter(review => 
    review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
            size={16}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl mb-4" style={{ color: '#478c0b' }} />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Review Moderation
          </h1>
          <p className="text-gray-600">
            Manage and moderate customer reviews
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <FaStar className="text-3xl text-gray-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <FaExclamationTriangle className="text-3xl text-yellow-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <FaCheck className="text-3xl text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <FaTimes className="text-3xl text-red-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                  {stats.averageRating}
                </p>
              </div>
              <FaStar className="text-3xl" style={{ color: '#478c0b' }} />
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === status
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search reviews..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{ focusRingColor: '#478c0b' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Review Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-800">
                          {review.user_name}
                        </h3>
                        {review.verified_purchase && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          review.status === 'approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {review.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {review.user_email} • {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      Product: <span className="font-medium">{review.product_name}</span>
                    </p>
                  </div>

                  {/* Rating and Title */}
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(review.rating)}
                    <h4 className="font-semibold text-gray-800">{review.title}</h4>
                  </div>

                  {/* Review Content */}
                  <p className="text-gray-700 mb-4">{review.comment}</p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((image, index) => (
                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`Review image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Moderation Actions */}
                  {review.status === 'pending' && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleModerateReview(review.id, 'approve')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FaCheck />
                        Approve
                      </button>
                      <button
                        onClick={() => handleModerateReview(review.id, 'reject')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <FaTimes />
                        Reject
                      </button>
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>

                {/* Helpful Count */}
                <div className="text-center ml-4">
                  <p className="text-sm text-gray-600">Helpful</p>
                  <p className="text-xl font-bold" style={{ color: '#478c0b' }}>
                    {review.helpful_count}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}