'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Leaf, Star, DollarSign, Store, LayoutGrid, Wheat, Droplets, Cherry, ArrowUpDown } from 'lucide-react';
import { useLanguage } from '@/lib/context/LanguageContext';

interface FilterProps {
  onFiltersChange: (filters: FilterState) => void;
  vendors: VendorInfo[];
  categories: CategoryInfo[];
  maxPrice: number;
  currentFilters?: FilterState;
}

interface FilterState {
  priceRange: [number, number];
  vendors: string[];
  categories: string[];
  dietary: string[];
  ratings: number | null;
  sort: string;
}

interface VendorInfo {
  id: string;
  name: string;
  productCount: number;
}

interface CategoryInfo {
  id: string;
  name: string;
  count: number;
}

export default function MarketplaceFilters({ onFiltersChange, vendors, categories, maxPrice, currentFilters }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const isSyncingFromParent = useRef(false);
  const { language, t } = useLanguage();
  const [filters, setFilters] = useState<FilterState>(() => currentFilters || {
    priceRange: [0, maxPrice || 500],
    vendors: [],
    categories: [],
    dietary: [],
    ratings: null,
    sort: 'trending'
  });

  // Sync with parent filters when they change externally (e.g., from URL)
  useEffect(() => {
    if (currentFilters) {
      const categoriesChanged = JSON.stringify(currentFilters.categories) !== JSON.stringify(filters.categories);
      if (categoriesChanged) {
        isSyncingFromParent.current = true;
        setFilters(currentFilters);
      }
    }
  }, [currentFilters?.categories]);

  const dietaryOptions = [
    { id: 'vegan', name: language === 'he' ? 'טבעוני' : 'Vegan', Icon: Leaf, color: '#478c0b' },
    { id: 'kosher', name: language === 'he' ? 'כשר' : 'Kosher', Icon: Star, color: '#4299e1' },
    { id: 'organic', name: language === 'he' ? 'אורגני' : 'Organic', Icon: Leaf, color: '#48bb78' },
    { id: 'gluten-free', name: language === 'he' ? 'ללא גלוטן' : 'Gluten-Free', Icon: Wheat, color: '#9f7aea' },
    { id: 'sugar-free', name: language === 'he' ? 'ללא סוכר' : 'Sugar-Free', Icon: Droplets, color: '#f56565' },
    { id: 'raw', name: language === 'he' ? 'מזון חי' : 'Raw', Icon: Cherry, color: '#38b2ac' }
  ];

  const sortOptions = [
    { value: 'trending', label: language === 'he' ? 'פופולרי' : 'Trending' },
    { value: 'price-low', label: language === 'he' ? 'מחיר: נמוך לגבוה' : 'Price: Low to High' },
    { value: 'price-high', label: language === 'he' ? 'מחיר: גבוה לנמוך' : 'Price: High to Low' },
    { value: 'rating', label: language === 'he' ? 'דירוג גבוה' : 'Highest Rated' },
    { value: 'newest', label: language === 'he' ? 'חדש ביותר' : 'Newest First' },
    { value: 'bestselling', label: language === 'he' ? 'רב מכר' : 'Best Selling' }
  ];

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], maxPrice || 500]
    }));
  }, [maxPrice]);

  useEffect(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (filters.vendors.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.dietary.length > 0) count++;
    if (filters.ratings !== null) count++;
    setActiveFilters(count);

    if (isSyncingFromParent.current) {
      isSyncingFromParent.current = false;
      return;
    }
    onFiltersChange(filters);
  }, [filters, maxPrice, onFiltersChange]);

  const handlePriceChange = (value: number, index: number) => {
    const newRange = [...filters.priceRange] as [number, number];
    newRange[index] = value;
    setFilters({ ...filters, priceRange: newRange });
  };

  const toggleArrayFilter = (value: string, field: keyof FilterState) => {
    const currentValues = filters[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFilters({ ...filters, [field]: newValues });
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, maxPrice || 500],
      vendors: [],
      categories: [],
      dietary: [],
      ratings: null,
      sort: 'trending'
    });
  };

  return (
    <>
      {/* Filter Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-pointer"
        style={{ backgroundColor: '#478c0b' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <SlidersHorizontal className="w-5 h-5 stroke-[1.5]" />
        <span>{t('Filters')}</span>
        {activeFilters > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-white/20">
            {activeFilters}
          </span>
        )}
      </motion.button>

      {/* Filter Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#478c0b] to-[#f6af0d] text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    {language === 'he' ? 'סנן מוצרים' : 'Filter Products'}
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </div>
                {activeFilters > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm underline hover:no-underline transition-all cursor-pointer"
                  >
                    {language === 'he' ? `נקה כל הסינונים (${activeFilters})` : `Clear all filters (${activeFilters})`}
                  </button>
                )}
              </div>

              {/* Filter Content */}
              <div className="h-full overflow-y-auto pb-32">
                {/* Sort Options */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                    {language === 'he' ? 'מיין לפי' : 'Sort By'}
                  </h3>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                    {language === 'he' ? 'טווח מחירים' : 'Price Range'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>{filters.priceRange[0]}&#8362;</span>
                      <span>{filters.priceRange[1]}&#8362;</span>
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full">
                      <div
                        className="absolute h-full rounded-full"
                        style={{
                          backgroundColor: '#478c0b',
                          left: `${(filters.priceRange[0] / maxPrice) * 100}%`,
                          right: `${100 - (filters.priceRange[1] / maxPrice) * 100}%`
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
                        className="w-full"
                      />
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={filters.priceRange[0]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), 0)}
                        className="px-3 py-2 border rounded-lg text-center"
                        min="0"
                        max={filters.priceRange[1]}
                      />
                      <input
                        type="number"
                        value={filters.priceRange[1]}
                        onChange={(e) => handlePriceChange(Number(e.target.value), 1)}
                        className="px-3 py-2 border rounded-lg text-center"
                        min={filters.priceRange[0]}
                        max={maxPrice}
                      />
                    </div>
                  </div>
                </div>

                {/* Dietary Preferences */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Leaf className="w-4 h-4 stroke-[1.5]" style={{ color: '#478c0b' }} />
                    {language === 'he' ? 'העדפות תזונתיות' : 'Dietary Preferences'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {dietaryOptions.map(option => {
                      const OptionIcon = option.Icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleArrayFilter(option.id, 'dietary')}
                          className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                            filters.dietary.includes(option.id)
                              ? 'border-current shadow-md transform scale-105'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            color: filters.dietary.includes(option.id) ? option.color : '#6b7280',
                            backgroundColor: filters.dietary.includes(option.id) ? `${option.color}10` : 'white'
                          }}
                        >
                          <OptionIcon className="w-4 h-4 stroke-[1.5]" />
                          <span className="text-sm font-medium">{option.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vendors */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Store className="w-4 h-4 stroke-[1.5]" style={{ color: '#c23c09' }} />
                    {language === 'he' ? 'ספקים' : 'Vendors'}
                  </h3>
                  <div className="space-y-2">
                    {vendors.map(vendor => (
                      <label
                        key={vendor.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.vendors.includes(vendor.id)}
                          onChange={() => toggleArrayFilter(vendor.id, 'vendors')}
                          className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                        />
                        <span className="flex-1">{t(vendor.name)}</span>
                        <span className="text-sm text-gray-500">({vendor.productCount})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                    {language === 'he' ? 'קטגוריות' : 'Categories'}
                  </h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label
                        key={category.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category.id)}
                          onChange={() => toggleArrayFilter(category.id, 'categories')}
                          className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                        />
                        <span className="flex-1">{category.name}</span>
                        <span className="text-sm text-gray-500">({category.count})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 stroke-[1.5]" style={{ color: '#f6af0d' }} />
                    {language === 'he' ? 'דירוג מינימלי' : 'Minimum Rating'}
                  </h3>
                  <div className="space-y-3">
                    {[4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilters({ ...filters, ratings: filters.ratings === rating ? null : rating })}
                        className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 cursor-pointer ${
                          filters.ratings === rating
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              strokeWidth={1.5}
                            />
                          ))}
                        </div>
                        <span className="text-sm">{language === 'he' ? 'ומעלה' : '& Up'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  {language === 'he' ? 'החל סינונים' : 'Apply Filters'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
