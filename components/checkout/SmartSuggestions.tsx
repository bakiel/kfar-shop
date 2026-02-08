'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, ShoppingBag, Check } from 'lucide-react';
import { useCart, CartItem } from '@/lib/context/CartContext';
import { useLanguage } from '@/lib/context/LanguageContext';

interface SuggestionProduct {
  id: string;
  name: string;
  nameHe?: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendorId: string;
  vendorName: string;
  category: string;
  reason: { en: string; he: string };
}

interface SmartSuggestionsProps {
  cartItems: Array<{
    id: string;
    name: string;
    vendorId: string;
    category?: string;
  }>;
}

export default function SmartSuggestions({ cartItems }: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const { addToCart } = useCart();
  const { language, t } = useLanguage();

  useEffect(() => {
    if (cartItems.length === 0) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/checkout/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItems }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [cartItems]);

  const handleAdd = (product: SuggestionProduct) => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      price: product.price,
      quantity: 1,
      image: product.image,
      originalPrice: product.originalPrice,
    };
    addToCart(item);
    setAddedIds(prev => new Set(prev).add(product.id));
  };

  // Don't render anything if no suggestions and not loading
  if (!loading && suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-gradient-to-r from-[#fef9ef] to-[#f0fae4] border border-[#478c0b]/20 rounded-xl p-4 md:p-5 my-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 stroke-[1.5] text-[#f6af0d]" />
        <h3 className="font-bold text-sm md:text-base" style={{ color: '#3a3a1d' }}>
          {language === 'he' ? 'השלם את הארוחה' : 'Complete Your Meal'}
        </h3>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex-shrink-0 w-[180px] md:w-[200px] bg-white rounded-lg p-3 animate-pulse"
            >
              <div className="w-full h-24 bg-gray-200 rounded-md mb-3" />
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {!loading && suggestions.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <AnimatePresence>
            {suggestions.map((product, index) => {
              const isAdded = addedIds.has(product.id);
              const displayName = language === 'he' && product.nameHe
                ? product.nameHe
                : product.name;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex-shrink-0 w-[180px] md:w-[200px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Product image */}
                  <div className="relative w-full h-24 bg-gray-50">
                    <Image
                      src={product.image}
                      alt={displayName}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/teva-deli/teva_deli_vegan_specialty_product_21_burger_schnitzel_plant_based_deli.jpg';
                      }}
                    />
                    {product.originalPrice && product.originalPrice > product.price && (
                      <div className="absolute top-1.5 right-1.5 bg-[#c23c09] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="p-3">
                    {/* Reason tag */}
                    <p className="text-[10px] text-[#478c0b] font-medium mb-1 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 stroke-[1.5]" />
                      {language === 'he' ? product.reason.he : product.reason.en}
                    </p>

                    {/* Name */}
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1 leading-tight min-h-[2rem]">
                      {displayName}
                    </p>

                    {/* Vendor */}
                    <p className="text-[10px] text-gray-500 mb-2">
                      {product.vendorName}
                    </p>

                    {/* Price + Add button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-[#3a3a1d]">
                          {'\u20AA'}{product.price.toFixed(0)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[10px] text-gray-400 line-through ml-1">
                            {'\u20AA'}{product.originalPrice.toFixed(0)}
                          </span>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAdd(product)}
                        disabled={isAdded}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-[#478c0b]/10 text-[#478c0b]'
                            : 'bg-[#478c0b] text-white hover:bg-[#3a6d08]'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2]" />
                            {language === 'he' ? 'נוסף' : 'Added'}
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2]" />
                            {language === 'he' ? 'הוסף' : 'Add'}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
