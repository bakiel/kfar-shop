'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Reply, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface VendorResponseFormProps {
  reviewId: string;
  customerName: string;
  onClose: () => void;
  onSuccess: (response: string) => void;
}

export default function VendorResponseForm({ 
  reviewId, 
  customerName,
  onClose, 
  onSuccess 
}: VendorResponseFormProps) {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templates = [
    {
      label: 'Thank you',
      text: 'Thank you for your review! We appreciate your feedback and are glad you enjoyed our product.'
    },
    {
      label: 'Apologize',
      text: 'We apologize for your experience. We take all feedback seriously and will work to improve.'
    },
    {
      label: 'Clarification',
      text: "Thank you for your feedback. We'd like to clarify that..."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (response.trim().length < 10) {
      toast({
        title: "Response too short",
        description: "Please write a more detailed response",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews/vendor-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          response: response.trim()
        })
      });

      if (res.ok) {
        toast({
          title: "Response posted",
          description: "Your response has been added to the review",
        });
        onSuccess(response.trim());
      } else {
        throw new Error('Failed to post response');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post response. Please try again.",
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Reply className="w-7 h-7 text-[#478c0b] stroke-[1.5]" />
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                  Respond to Review
                </h2>
                <p className="text-sm text-gray-600">
                  Replying to {customerName}'s review
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Quick Templates */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
              Quick templates:
            </p>
            <div className="flex gap-2 flex-wrap">
              {templates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setResponse(template.text)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label 
                htmlFor="response" 
                className="block text-sm font-medium mb-2" 
                style={{ color: '#3a3a1d' }}
              >
                Your Response
              </label>
              <textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write a thoughtful response to the customer's review..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{response.length}/500</p>
            </div>

            {/* Best Practices */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#fef9ef' }}>
              <p className="text-sm font-medium mb-2" style={{ color: '#3a3a1d' }}>
                Response Tips:
              </p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Be professional and courteous</li>
                <li>• Address specific concerns mentioned</li>
                <li>• Thank the customer for their feedback</li>
                <li>• Offer solutions when appropriate</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || response.trim().length < 10}
                className="flex-1 px-6 py-3 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#478c0b' }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Posting...
                  </span>
                ) : (
                  'Post Response'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}