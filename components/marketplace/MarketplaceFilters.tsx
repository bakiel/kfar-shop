'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaTimes, FaLeaf, FaStar, FaDollarSign } from 'react-icons/fa';

interface FilterProps {
  onFiltersChange: (filters: FilterState) => void;
  vendors: VendorInfo[];
  categories: CategoryInfo[];
  maxPrice: number;
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

export default function MarketplaceFilters({ onFiltersChange, vendors, categories, maxPrice }: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, maxPrice || 500],
    vendors: [],
    categories: [],
    dietary: [],
    ratings: null,
    sort: 'trending'
  });

  const dietaryOptions = [
    { id: 'vegan', name: 'Vegan', icon: '🌱', color: '#478c0b' },
    { id: 'kosher', name: 'Kosher', icon: '✡️', color: '#4299e1' },
    { id: 'organic', name: 'Organic', icon: '🌿', color: '#48bb78' },
    { id: 'gluten-free', name: 'Gluten-Free', icon: '🌾', color: '#9f7aea' },
    { id: 'sugar-free', name: 'Sugar-Free', icon: '🍯', color: '#f56565' },
    { id: 'raw', name: 'Raw', icon: '🥗', color: '#38b2ac' }
  ];

  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'bestselling', label: 'Best Selling' }
  ];

  useEffect(() => {
    // Update max price when it changes
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], maxPrice || 500]
    }));
  }, [maxPrice]);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count++;
    if (filters.vendors.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.dietary.length > 0) count++;
    if (filters.ratings !== null) count++;
    setActiveFilters(count);
    
    // Notify parent component
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
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 relative overflow-hidden group"
        style={{ backgroundColor: '#478c0b' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <FaFilter className="text-lg" />
        <span>Filters</span>
        {activeFilters > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-white/20">
            {activeFilters}
          </span>
        )}
      </button>

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
                  <h2 className="text-2xl font-bold">Filter Products</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
                {activeFilters > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm underline hover:no-underline transition-all"
                  >
                    Clear all filters ({activeFilters})
                  </button>
                )}
              </div>

              {/* Filter Content */}
              <div className="h-full overflow-y-auto pb-32">
                {/* Sort Options */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <i className="fas fa-sort text-sm" style={{ color: '#478c0b' }}></i>
                    Sort By
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
                    <FaDollarSign className="text-sm" style={{ color: '#f6af0d' }} />
                    Price Range
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>₪{filters.priceRange[0]}</span>
                      <span>₪{filters.priceRange[1]}</span>
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
                    <FaLeaf className="text-sm" style={{ color: '#478c0b' }} />
                    Dietary Preferences
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {dietaryOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => toggleArrayFilter(option.id, 'dietary')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 ${
                          filters.dietary.includes(option.id)
                            ? 'border-current shadow-md transform scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          color: filters.dietary.includes(option.id) ? option.color : '#6b7280',
                          backgroundColor: filters.dietary.includes(option.id) ? `${option.color}10` : 'white'
                        }}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-sm font-medium">{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vendors */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <i className="fas fa-store text-sm" style={{ color: '#c23c09' }}></i>
                    Vendors
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
                        <span className="flex-1">{vendor.name}</span>
                        <span className="text-sm text-gray-500">({vendor.productCount})</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div className="p-6 border-b">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <i className="fas fa-th-large text-sm" style={{ color: '#f6af0d' }}></i>
                    Categories
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
                    <FaStar className="text-sm" style={{ color: '#f6af0d' }} />
                    Minimum Rating
                  </h3>
                  <div className="space-y-3">
                    {[4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilters({ ...filters, ratings: filters.ratings === rating ? null : rating })}
                        className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          filters.ratings === rating
                            ? 'border-yellow-400 bg-yellow-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm">& Up</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}