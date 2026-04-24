'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';
import { Sparkles, Wand2, Package, Eye, ArrowRight, Lightbulb, Clock, PiggyBank, Leaf, ShoppingBag } from 'lucide-react';

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
  originalPrice?: number;
}

interface PersonalizedDeal {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  vendorId?: string;
  vendorName: string;
}

const RECOMMENDATION_REASONS = [
  'Popular in the community',
  'Top rated product',
  'Trending this week',
  'Customers also love this',
  'Best seller',
  'Staff pick',
];

export default function PersonalizedShopping({ customerId, customerName }: PersonalizedShoppingProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [deals, setDeals] = useState<PersonalizedDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPersonalizedContent();
  }, [customerId]);

  const loadPersonalizedContent = async () => {
    try {
      // Fetch real products and promotions in parallel
      const [productsRes, landingRes] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/landing').catch(() => null),
      ]);

      // Parse real products
      if (productsRes && productsRes.ok) {
        const productsData = await productsRes.json();
        const allProducts = productsData.products || [];

        if (allProducts.length > 0) {
          // Pick a random selection of products as "recommendations"
          const shuffled = [...allProducts].sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, Math.min(4, allProducts.length));

          const realRecommendations: RecommendedProduct[] = selected.map((p: any, idx: number) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            vendor: p.vendor || 'KFAR Vendor',
            vendorId: p.vendorId || '',
            image: p.image || '/images/default_logo.svg',
            category: p.category || 'General',
            reason: RECOMMENDATION_REASONS[idx % RECOMMENDATION_REASONS.length],
            originalPrice: undefined,
            discount: undefined,
          }));

          setRecommendations(realRecommendations);
        }
      }

      // Parse real promotions
      if (landingRes && landingRes.ok) {
        const landingData = await landingRes.json();

        if (landingData.promotions && landingData.promotions.length > 0) {
          const realDeals: PersonalizedDeal[] = landingData.promotions
            .slice(0, 3)
            .map((promo: any) => ({
              id: promo.id,
              title: promo.title,
              description: promo.description || '',
              discount: promo.discountPercent || 0,
              validUntil: promo.endDate,
              vendorName: 'KFAR Marketplace',
            }));

          setDeals(realDeals);
        }

        // If no promotions, check flash deals
        if ((!landingData.promotions || landingData.promotions.length === 0) && landingData.flashDeals && landingData.flashDeals.length > 0) {
          const flashDeals: PersonalizedDeal[] = landingData.flashDeals
            .slice(0, 3)
            .map((deal: any) => ({
              id: deal.id,
              title: `${deal.savingsPercent}% Off ${deal.productName}`,
              description: `Save on ${deal.productName} from ${deal.vendorName}`,
              discount: deal.savingsPercent,
              validUntil: deal.endsAt,
              vendorName: deal.vendorName,
            }));

          setDeals(flashDeals);
        }
      }
    } catch (err) {
      console.error('Error loading personalized content:', err);
      setError(true);
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

  // Empty state -- no products or deals available
  if (error || (recommendations.length === 0 && deals.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <ShoppingBag className="w-10 h-10 stroke-[1.5] text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-500">
            No personalized recommendations yet
          </h3>
          <p className="text-sm text-gray-400 max-w-md">
            Browse the marketplace and start shopping to get personalized product recommendations.
          </p>
          <Link
            href="/marketplace"
            className="mt-2 inline-flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-full transition-all hover:shadow-md"
            style={{ backgroundColor: '#478c0b', color: 'white' }}
          >
            <span>Browse Marketplace</span>
            <ArrowRight className="w-4 h-4 stroke-[1.5]" />
          </Link>
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
            Deals for You
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {deals.map((deal) => (
              <motion.div
                key={deal.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg">{deal.title}</h4>
                  {deal.discount > 0 && (
                    <span className="bg-white/30 px-2 py-1 rounded-full text-sm">
                      {deal.discount}% OFF
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-90 mb-3">{deal.description}</p>
                <div className="flex items-center justify-between">
                  {deal.validUntil && (
                    <span className="text-xs opacity-75">
                      Valid until {new Date(deal.validUntil).toLocaleDateString()}
                    </span>
                  )}
                  <Link
                    href="/marketplace"
                    className="text-sm font-medium hover:underline"
                  >
                    Shop Now
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Products */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              <Wand2 className="w-5 h-5 stroke-[1.5] mr-2 text-purple-600 inline" />
              Recommended for {customerName.split(' ')[0]}
            </h3>
            <button
              onClick={() => loadPersonalizedContent()}
              className="text-sm text-green-600 hover:text-green-700 font-medium cursor-pointer"
            >
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
                    {product.image && product.image !== '/images/default_logo.svg' ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="w-10 h-10 stroke-[1.5] text-gray-400" />
                        </div>
                      </>
                    )}

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
                        {product.discount && product.originalPrice ? (
                          <>
                            <span className="text-lg font-bold text-green-600">
                              &#8362;{(product.originalPrice * (1 - product.discount / 100)).toFixed(0)}
                            </span>
                            <span className="text-sm text-gray-400 line-through ml-2">
                              &#8362;{product.originalPrice}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold">&#8362;{product.price}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
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
              href="/marketplace"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              <span>Browse All Products</span>
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </Link>
          </div>
        </div>
      )}

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
