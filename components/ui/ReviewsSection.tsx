'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  product: string;
  vendor: string;
  vendorLogo: string;
  comment: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  location: string;
}

const ReviewsSection = () => {
  const [activeReview, setActiveReview] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % featuredReviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const featuredReviews: Review[] = [
    {
      id: 1,
      name: 'Sarah M.',
      avatar: '/images/hero/13.jpg',
      rating: 5,
      date: '2 weeks ago',
      product: 'Classic Seitan Schnitzel',
      vendor: 'Teva Deli',
      vendorLogo: '/images/vendors/teva_deli_logo_vegan_factory.jpg',
      comment: 'The best vegan schnitzel I\'ve ever had! Crispy on the outside, tender inside. My whole family loved it. This brings back memories of traditional Israeli comfort food.',
      verified: true,
      helpful: 45,
      location: 'Tel Aviv',
      images: ['/images/vendors/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg']
    },
    {
      id: 2,
      name: 'David L.',
      avatar: '/images/hero/14.jpg',
      rating: 5,
      date: '1 month ago',
      product: 'Chocolate Tahini Swirl',
      vendor: 'Gahn Delight',
      vendorLogo: '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg',
      comment: 'Absolutely divine! The combination of chocolate and tahini is perfection. You\'d never believe it\'s dairy-free. My kids ask for it every Shabbat!',
      verified: true,
      helpful: 38,
      location: 'Jerusalem',
      images: ['/images/vendors/gahn_delight_ice_cream_chocolate_tahini_swirl_cup_with_cacao_nibs.jpeg']
    },
    {
      id: 3,
      name: 'Rachel K.',
      avatar: '/images/hero/15.jpg',
      rating: 5,
      date: '3 weeks ago',
      product: 'Middle Eastern Shawarma',
      vendor: "Queen's Cuisine",
      vendorLogo: '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg',
      comment: 'Had this at my daughter\'s wedding - everyone was amazed it was vegan! The spices are authentic and the texture is incredible. Professional catering at its finest.',
      verified: true,
      helpful: 67,
      location: 'Haifa',
      images: ['/images/vendors/queens_cuisine_middle_eastern_shawarma_pita_wrap_plant_based_meat_alternative.jpg']
    }
  ];

  const allReviews: Review[] = [
    {
      id: 4,
      name: 'Michael B.',
      avatar: '/images/hero/16.jpg',
      rating: 5,
      date: '1 week ago',
      product: 'Pistachio Rose Dream',
      vendor: 'Gahn Delight',
      vendorLogo: '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg',
      comment: 'Luxurious flavors that transport you to the Middle East. Worth every shekel!',
      verified: true,
      helpful: 23,
      location: 'Dimona'
    },
    {
      id: 5,
      name: 'Lisa T.',
      avatar: '/images/hero/17.jpg',
      rating: 5,
      date: '2 months ago',
      product: 'Smoothie Bowl Mix',
      vendor: 'Garden of Light',
      vendorLogo: '/images/vendors/Garden of Light Logo.jpg',
      comment: 'Perfect breakfast solution! Nutritious, delicious, and supports our community values.',
      verified: true,
      helpful: 19,
      location: 'Beer Sheva'
    },
    {
      id: 6,
      name: 'Joseph H.',
      avatar: '/images/hero/18.jpg',
      rating: 5,
      date: '1 month ago',
      product: 'Traditional Kubeh',
      vendor: 'Teva Deli',
      vendorLogo: '/images/vendors/teva_deli_logo_vegan_factory.jpg',
      comment: 'Authentic taste that reminds me of my grandmother\'s cooking. Amazing that it\'s vegan!',
      verified: true,
      helpful: 34,
      location: 'Eilat'
    }
  ];

  const stats = [
    { value: '4.9', label: 'Average Rating', icon: 'fa-star' },
    { value: '2,847', label: 'Verified Reviews', icon: 'fa-check-circle' },
    { value: '98%', label: 'Satisfaction Rate', icon: 'fa-smile' },
    { value: '100%', label: 'Vegan Products', icon: 'fa-leaf' }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`fas fa-star text-sm ${
              i < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/images/backgrounds/3.jpg')`,
            backgroundAttachment: 'fixed'
          }}
        />
        {/* Multi-layer overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-cream-base/90 to-white/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-sun-gold/10 via-transparent to-leaf-green/10" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full blur-3xl" style={{ backgroundColor: '#f6af0d', opacity: 0.2 }} />
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: '#478c0b', opacity: 0.2 }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg" style={{ backgroundColor: '#478c0b' }}>
              <i className="fas fa-comments mr-2"></i>
              Community Voice
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
            What Our Customers Say
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#4b5563' }}>
            Real experiences from our Village of Peace community and customers worldwide
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className={`text-center p-6 bg-white rounded-xl shadow-lg transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <i className={`fas ${stat.icon} text-3xl mb-3`} style={{ color: '#f6af0d' }}></i>
              <div className="text-3xl font-bold mb-1" style={{ color: '#3a3a1d' }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: '#6b7280' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Review Carousel */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {featuredReviews.map((review, index) => (
              <div
                key={review.id}
                className={`grid md:grid-cols-2 transition-all duration-500 ${
                  index === activeReview ? 'block' : 'hidden'
                }`}
              >
                {/* Review Content */}
                <div className="p-8 md:p-12 order-2 md:order-1">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative w-16 h-16">
                      <Image
                        src={review.avatar}
                        alt={review.name || "Image"}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>
                          {review.name}
                        </h3>
                        {review.verified && (
                          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: '#cfe7c1', color: '#478c0b' }}>
                            <i className="fas fa-check-circle mr-1"></i>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm" style={{ color: '#6b7280' }}>
                        {renderStars(review.rating)}
                        <span>•</span>
                        <span>{review.date}</span>
                        <span>•</span>
                        <span><i className="fas fa-map-marker-alt mr-1"></i>{review.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-xl" style={{ backgroundColor: '#f9fafb' }}>
                    <div className="relative w-12 h-12">
                      <Image
                        src={review.vendorLogo}
                        alt={review.vendor || "Image"}
                        fill
                        className="object-cover rounded-full border-2"
                        style={{ borderColor: '#e5e7eb' }}
                      />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#3a3a1d' }}>
                        {review.product}
                      </p>
                      <p className="text-sm" style={{ color: '#f6af0d' }}>
                        {review.vendor}
                      </p>
                    </div>
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-lg leading-relaxed mb-6" style={{ color: '#4b5563' }}>
                    <i className="fas fa-quote-left mr-2" style={{ color: '#f6af0d', opacity: 0.3 }}></i>
                    {review.comment}
                    <i className="fas fa-quote-right ml-2" style={{ color: '#f6af0d', opacity: 0.3 }}></i>
                  </blockquote>

                  {/* Helpful Counter */}
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-md" style={{ backgroundColor: '#f3f4f6' }}>
                      <i className="fas fa-thumbs-up" style={{ color: '#478c0b' }}></i>
                      <span className="text-sm font-semibold" style={{ color: '#3a3a1d' }}>
                        Helpful ({review.helpful})
                      </span>
                    </button>
                    <button className="text-sm font-medium" style={{ color: '#6b7280' }}>
                      <i className="fas fa-share-alt mr-1"></i>
                      Share
                    </button>
                  </div>
                </div>

                {/* Product Image */}
                {review.images && (
                  <div className="relative h-full min-h-[400px] order-1 md:order-2">
                    <Image
                      src={review.images[0]}
                      alt={review.product || "Image"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Carousel Navigation */}
          <div className="flex justify-center gap-2 mt-6">
            {featuredReviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveReview(index)}
                className={`transition-all duration-300 ${
                  index === activeReview 
                    ? 'w-12 h-3 rounded-full' 
                    : 'w-3 h-3 rounded-full opacity-50 hover:opacity-75'
                }`}
                style={{ backgroundColor: index === activeReview ? '#478c0b' : '#6b7280' }}
              />
            ))}
          </div>
        </div>

        {/* Recent Reviews Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>
            Recent Reviews
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {allReviews.map((review, index) => (
              <div
                key={review.id}
                className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${(index + 4) * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={review.avatar}
                      alt={review.name || "Image"}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>
                        {review.name}
                      </h4>
                      {review.verified && (
                        <i className="fas fa-check-circle text-sm" style={{ color: '#478c0b' }}></i>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: '#6b7280' }}>
                      {renderStars(review.rating)}
                      <span>{review.date}</span>
                    </div>
                  </div>
                </div>

                {/* Product */}
                <div className="mb-3">
                  <p className="font-semibold text-sm" style={{ color: '#3a3a1d' }}>
                    {review.product}
                  </p>
                  <p className="text-xs" style={{ color: '#f6af0d' }}>
                    {review.vendor}
                  </p>
                </div>

                {/* Comment */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#4b5563' }}>
                  {review.comment}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: '#6b7280' }}>
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {review.location}
                  </span>
                  <button className="font-medium hover:underline" style={{ color: '#478c0b' }}>
                    <i className="far fa-thumbs-up mr-1"></i>
                    {review.helpful}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-lg mb-6" style={{ color: '#4b5563' }}>
            Join thousands of satisfied customers from the Village of Peace community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300" style={{ backgroundColor: '#478c0b' }}>
              <i className="fas fa-star mr-2"></i>
              Write a Review
            </button>
            <button className="px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-2" style={{ borderColor: '#478c0b', color: '#478c0b', backgroundColor: 'white' }}>
              <i className="fas fa-comments mr-2"></i>
              View All Reviews
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;