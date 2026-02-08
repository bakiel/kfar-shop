'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { Star, Camera, X, Gift, Loader2 } from 'lucide-react';

interface ReviewSubmissionFormProps {
  productId: string;
  productName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewSubmissionForm({ 
  productId, 
  productName, 
  onClose, 
  onSuccess 
}: ReviewSubmissionFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRewardPreview, setShowRewardPreview] = useState(false);

  const pointsForReview = {
    basic: 50, // Just rating
    detailed: 100, // Rating + text
    withPhotos: 150 // Rating + text + photos
  };

  const calculatePoints = () => {
    if (images.length > 0) return pointsForReview.withPhotos;
    if (comment.length > 50) return pointsForReview.detailed;
    return pointsForReview.basic;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size < 5 * 1024 * 1024 // 5MB limit
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were skipped",
        description: "Only images under 5MB are allowed",
      });
    }

    setImages(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 images

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
      });
      return;
    }

    if (title.trim().length < 3) {
      toast({
        title: "Title too short",
        description: "Please write a longer title (min 3 characters)",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert images to base64 for API submission
      const imageUrls: string[] = [];
      for (const image of images) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(image);
        });
        imageUrls.push(base64);
      }

      // Submit review
      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
          images: imageUrls
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Show success with points earned
        toast({
          title: "Review submitted successfully!",
          description: `You earned ${result.pointsEarned} KFAR points! 🎉`,
        });

        // Show reward animation
        setShowRewardPreview(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#3a3a1d' }}>
              Write a Review
            </h2>
            <p className="text-sm text-gray-600 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Points Preview */}
        <div className="px-6 py-4 bg-gradient-to-r from-leaf-green/10 to-sun-gold/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-7 h-7 text-[#478c0b] stroke-[1.5]" />
              <div>
                <p className="font-semibold" style={{ color: '#3a3a1d' }}>
                  Earn KFAR Points!
                </p>
                <p className="text-sm text-gray-600">
                  You'll earn {calculatePoints()} points for this review
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Current balance</p>
              <p className="font-bold" style={{ color: '#478c0b' }}>1,250 pts</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
              Overall Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 stroke-[1.5] ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-gray-600 self-center">
                {rating > 0 && (
                  <span className="font-medium">
                    {rating === 5 && 'Excellent!'}
                    {rating === 4 && 'Good'}
                    {rating === 3 && 'Average'}
                    {rating === 2 && 'Below Average'}
                    {rating === 1 && 'Poor'}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label 
              htmlFor="title" 
              className="block text-sm font-medium mb-2" 
              style={{ color: '#3a3a1d' }}
            >
              Review Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Review Comment */}
          <div>
            <label 
              htmlFor="comment" 
              className="block text-sm font-medium mb-2" 
              style={{ color: '#3a3a1d' }}
            >
              Your Review
              <span className="text-xs font-normal text-gray-600 ml-2">
                (Write 50+ characters to earn bonus points!)
              </span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience with this product..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">{comment.length}/1000</p>
              {comment.length >= 50 && (
                <p className="text-xs font-medium" style={{ color: '#478c0b' }}>
                  +50 bonus points unlocked!
                </p>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
              Add Photos
              <span className="text-xs font-normal text-gray-600 ml-2">
                (Add photos to earn extra points!)
              </span>
            </label>
            
            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mb-3">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={preview}
                      alt={`Upload ${index + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 stroke-[2]" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                <Camera className="w-5 h-5 text-gray-400 stroke-[1.5]" />
                <span className="text-gray-600">
                  Add photos ({images.length}/5)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}

            {images.length > 0 && (
              <p className="text-xs font-medium mt-2" style={{ color: '#478c0b' }}>
                +{images.length * 20} photo bonus points!
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || title.length < 3}
              className="flex-1 px-6 py-3 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#478c0b' }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span>Submit Review & Earn {calculatePoints()} Points</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Reward Animation */}
      <AnimatePresence>
        {showRewardPreview && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-60 pointer-events-none"
          >
            <motion.div
              animate={{
                y: [-50, -100, -150],
                opacity: [1, 1, 0]
              }}
              transition={{ duration: 2 }}
              className="bg-gradient-to-r from-leaf-green to-sun-gold text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl"
            >
              +{calculatePoints()} Points! 🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}