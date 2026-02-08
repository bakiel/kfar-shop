'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, Wand2, Package, Eye, ArrowRight, Lightbulb, Clock, PiggyBank, Leaf } from 'lucide-react';

interface PersonalizedShoppingProps {
  customerId: string;
  customerName: string;
}

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  vendor: string;
  vendorId: string;
  image: string;
  category: string;
  reason: string;
  discount?: number;
}

interface PersonalizedDeal {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: Date;
  vendorId: string;
  vendorName: string;
}

export default function PersonalizedShopping({ customerId, customerName }: PersonalizedShoppingProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [deals, setDeals] = useState<PersonalizedDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalizedContent();
  }, [customerId]);

  const loadPersonalizedContent = async () => {
    try {
      // Mock personalized recommendations
      // In production, this would call the personalization service
      const mockRecommendations: RecommendedProduct[] = [
        {
          id: 'prod-1',
          name: 'Organic Almond Butter',
          price: 45,
          vendor: 'Teva Deli',
          vendorId: 'teva-deli',
          image: '/images/products/almond-butter.jpg',
          category: 'Spreads',
          reason: 'Based on your love for healthy spreads',
          discount: 10
        },
        {
          id: 'prod-2',
          name: 'Gluten-Free Challah',
          price: 28,
          vendor: 'Gahn Delight',
          vendorId: 'gahn-delight',
          image: '/images/products/gf-challah.jpg',
          category: 'Bakery',
          reason: 'Perfect for your gluten-free diet'
        },
        {
          id: 'prod-3',
          name: 'Vegan Cheese Platter',
          price: 65,
          vendor: "Queen's Cuisine",
          vendorId: 'queens-cuisine',
          image: '/images/products/vegan-cheese.jpg',
          category: 'Dairy Alternatives',
          reason: 'New arrival matching your preferences'
        },
        {
          id: 'prod-4',
          name: 'Organic Date Syrup',
          price: 32,
          vendor: 'VOP Shop',
          vendorId: 'vop-shop',
          image: '/images/products/date-syrup.jpg',
          category: 'Sweeteners',
          reason: 'Frequently bought by similar customers'
        }
      ];

      const mockDeals: PersonalizedDeal[] = [
        {
          id: 'deal-1',
          title: '20% Off Your Favorites',
          description: 'Special discount on all dairy alternatives at Teva Deli',
          discount: 20,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          vendorId: 'teva-deli',
          vendorName: 'Teva Deli'
        },
        {
          id: 'deal-2',
          title: 'Buy 2 Get 1 Free',
          description: 'On all gluten-free products this week',
          discount: 33,
          validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          vendorId: 'gahn-delight',
          vendorName: 'Gahn Delight'
        }
      ];

      setRecommendations(mockRecommendations);
      setDeals(mockDeals);
    } catch (error) {
      console.error('Error loading personalized content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: RecommendedProduct) => {
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Personalized Deals */}
      {deals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white"
        >
          <h3 className="text-xl font-bold mb-4">
            <Sparkles className="w-5 h-5 stroke-[1.5] mr-2 inline" />
            Exclusive Deals for You
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {deals.map((deal) => (
              <motion.div
                key={deal.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg">{deal.title}</h4>
                  <span className="bg-white/30 px-2 py-1 rounded-full text-sm">
                    {deal.discount}% OFF
                  </span>
                </div>
                <p className="text-sm opacity-90 mb-3">{deal.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs opacity-75">
                    Valid until {deal.validUntil.toLocaleDateString()}
                  </span>
                  <Link
                    href={`/store/${deal.vendorId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    Shop Now →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Products */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            <Wand2 className="w-5 h-5 stroke-[1.5] mr-2 text-purple-600 inline" />
            Recommended for {customerName.split(' ')[0]}
          </h3>
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            Refresh Suggestions
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {recommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-10 h-10 stroke-[1.5] text-gray-400" />
                  </div>
                  
                  {product.discount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">{product.vendor}</p>
                  
                  {/* Reason */}
                  <p className="text-xs text-purple-600 mb-3 italic">
                    {product.reason}
                  </p>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {product.discount ? (
                        <>
                          <span className="text-lg font-bold text-green-600">
                            ₪{(product.price * (1 - product.discount / 100)).toFixed(0)}
                          </span>
                          <span className="text-sm text-gray-400 line-through ml-2">
                            ₪{product.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold">₪{product.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <Link
                      href={`/product/${product.id}`}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 stroke-[1.5] text-gray-600" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More */}
        <div className="mt-8 text-center">
          <Link
            href="/shop?personalized=true"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <span>View All Personalized Recommendations</span>
            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </Link>
        </div>
      </div>

      {/* Shopping Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">
          <Lightbulb className="w-5 h-5 stroke-[1.5] text-yellow-500 mr-2 inline" />
          Smart Shopping Tips
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 stroke-[1.5] text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Best Time to Shop</h4>
              <p className="text-gray-600">Sunday mornings have the freshest products</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <PiggyBank className="w-5 h-5 stroke-[1.5] text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Save More</h4>
              <p className="text-gray-600">Bundle similar items for extra discounts</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Leaf className="w-5 h-5 stroke-[1.5] text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Go Green</h4>
              <p className="text-gray-600">Choose vendors with eco-friendly packaging</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}