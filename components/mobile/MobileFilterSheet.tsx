'use client';

import React, { useState, useEffect, ComponentType } from 'react';
import { LucideProps, X, SlidersHorizontal, ArrowUpDown, Check, Leaf, CheckCircle, Sprout, Wheat, Candy, Carrot, Flame, ArrowUp, ArrowDown, Star, Clock, TrendingUp, type LucideIcon } from 'lucide-react';

const faToLucide: Record<string, LucideIcon> = {
  'fa-leaf': Leaf,
  'fa-check-circle': CheckCircle,
  'fa-seedling': Sprout,
  'fa-wheat': Wheat,
  'fa-candy-cane': Candy,
  'fa-carrot': Carrot,
  'fa-fire': Flame,
  'fa-sort-amount-up': ArrowUp,
  'fa-sort-amount-down': ArrowDown,
  'fa-star': Star,
  'fa-clock': Clock,
  'fa-chart-line': TrendingUp,
};

// Allow icon to be either a string (FontAwesome class) or a Lucide component
type IconType = string | ComponentType<LucideProps>;

interface PopularTag {
  slug: string;
  name: string;
  icon: IconType;
  color: string;
}

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    priceRange: [number, number];
    vendors: string[];
    categories: string[];
    dietary: string[];
    ratings: number | null;
    sort: string;
    selectedTags?: string[];
  };
  onApplyFilters: (filters: any) => void;
  vendors: Array<{ id: string; name: string; productCount: number }>;
  categories: Array<{ id: string; name: string; count: number }>;
  maxPrice: number;
  popularTags?: PopularTag[];
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  vendors,
  categories,
  maxPrice,
  popularTags
}: MobileFilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState<'filters' | 'sort'>('filters');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const dietaryOptions = [
    { id: 'vegan', name: 'Vegan', icon: 'fa-leaf' },
    { id: 'kosher', name: 'Kosher', icon: 'fa-check-circle' },
    { id: 'organic', name: 'Organic', icon: 'fa-seedling' },
    { id: 'gluten-free', name: 'Gluten Free', icon: 'fa-wheat' },
    { id: 'sugar-free', name: 'Sugar Free', icon: 'fa-candy-cane' },
    { id: 'raw', name: 'Raw Food', icon: 'fa-carrot' }
  ];

  const sortOptions = [
    { value: 'trending', label: 'Trending', icon: 'fa-fire' },
    { value: 'price-low', label: 'Price: Low to High', icon: 'fa-sort-amount-up' },
    { value: 'price-high', label: 'Price: High to Low', icon: 'fa-sort-amount-down' },
    { value: 'rating', label: 'Highest Rated', icon: 'fa-star' },
    { value: 'newest', label: 'Newest First', icon: 'fa-clock' },
    { value: 'bestselling', label: 'Best Sellers', icon: 'fa-chart-line' }
  ];

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      priceRange: [0, maxPrice] as [number, number],
      vendors: [],
      categories: [],
      dietary: [],
      ratings: null,
      sort: 'trending',
      selectedTags: []
    };
    setLocalFilters(resetFilters);
  };

  const toggleVendor = (vendorId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      vendors: prev.vendors.includes(vendorId)
        ? prev.vendors.filter(v => v !== vendorId)
        : [...prev.vendors, vendorId]
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const toggleDietary = (dietaryId: string) => {
    setLocalFilters(prev => ({
      ...prev,
      dietary: prev.dietary.includes(dietaryId)
        ? prev.dietary.filter(d => d !== dietaryId)
        : [...prev.dietary, dietaryId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Filter Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header with Tabs */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>Filters & Sort</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 stroke-[1.5] text-gray-600" />
            </button>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex px-4 pb-2">
            <button
              onClick={() => setActiveTab('filters')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'filters' 
                  ? 'border-[#478c0b] text-[#478c0b]' 
                  : 'border-transparent text-gray-500'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 stroke-[1.5] inline mr-2" />
              Filters
            </button>
            <button
              onClick={() => setActiveTab('sort')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sort' 
                  ? 'border-[#478c0b] text-[#478c0b]' 
                  : 'border-transparent text-gray-500'
              }`}
            >
              <ArrowUpDown className="w-4 h-4 stroke-[1.5] inline mr-2" />
              Sort
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {activeTab === 'filters' ? (
            <div className="px-4 pb-4">
              {/* Quick Tags */}
              {popularTags && (
                <div className="py-4 border-b border-gray-100">
                  <h3 className="font-semibold mb-3 text-sm" style={{ color: '#3a3a1d' }}>Quick Filters</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => {
                      // Check if icon is a Lucide component or a string
                      const IconComponent = typeof tag.icon !== 'string' ? tag.icon : null;
                      return (
                        <button
                          key={tag.slug}
                          onClick={() => {
                            const currentTags = localFilters.selectedTags || [];
                            setLocalFilters(prev => ({
                              ...prev,
                              selectedTags: currentTags.includes(tag.slug)
                                ? currentTags.filter(t => t !== tag.slug)
                                : [...currentTags, tag.slug]
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                            (localFilters.selectedTags || []).includes(tag.slug)
                              ? 'bg-[#478c0b] text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {IconComponent ? (
                            <IconComponent className="w-3.5 h-3.5 stroke-[1.5]" />
                          ) : (
                            faToLucide[tag.icon as string] ? React.createElement(faToLucide[tag.icon as string], { className: 'w-3.5 h-3.5 stroke-[1.5]' }) : null
                          )}
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="py-4 border-b border-gray-100">
                <h3 className="font-semibold mb-3 text-sm" style={{ color: '#3a3a1d' }}>Price Range</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-[#478c0b]">₪{localFilters.priceRange[0]}</span>
                    <span className="text-[#478c0b]">₪{localFilters.priceRange[1]}</span>
                  </div>
                  
                  <div className="relative h-2 bg-gray-200 rounded-full">
                    <div 
                      className="absolute h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: '#478c0b',
                        left: `${(localFilters.priceRange[0] / maxPrice) * 100}%`,
                        right: `${100 - (localFilters.priceRange[1] / maxPrice) * 100}%`
                      }}
                    />
                    
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={localFilters.priceRange[0]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value < localFilters.priceRange[1]) {
                          setLocalFilters(prev => ({
                            ...prev,
                            priceRange: [value, prev.priceRange[1]]
                          }));
                        }
                      }}
                      className="absolute w-full h-2 opacity-0 cursor-pointer"
                    />
                    
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={localFilters.priceRange[1]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > localFilters.priceRange[0]) {
                          setLocalFilters(prev => ({
                            ...prev,
                            priceRange: [prev.priceRange[0], value]
                          }));
                        }
                      }}
                      className="absolute w-full h-2 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="py-4 border-b border-gray-100">
                <h3 className="font-semibold mb-3 text-sm" style={{ color: '#3a3a1d' }}>Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                        localFilters.categories.includes(category.id)
                          ? 'bg-[#478c0b] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="truncate">{category.name}</span>
                      <span className="text-xs ml-1">({category.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vendors */}
              <div className="py-4 border-b border-gray-100">
                <h3 className="font-semibold mb-3 text-sm" style={{ color: '#3a3a1d' }}>Vendors</h3>
                <div className="space-y-2">
                  {vendors.map(vendor => (
                    <label key={vendor.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.vendors.includes(vendor.id)}
                        onChange={() => toggleVendor(vendor.id)}
                        className="mr-3 w-4 h-4 text-[#478c0b] rounded focus:ring-[#478c0b]"
                      />
                      <span className="flex-1 text-sm">{vendor.name}</span>
                      <span className="text-xs text-gray-500">({vendor.productCount})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Options */}
              <div className="py-4">
                <h3 className="font-semibold mb-3 text-sm" style={{ color: '#3a3a1d' }}>Dietary Options</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => toggleDietary(option.id)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                        localFilters.dietary.includes(option.id)
                          ? 'bg-[#478c0b] text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {faToLucide[option.icon] && React.createElement(faToLucide[option.icon], { className: 'w-3 h-3 stroke-[1.5] mr-2' })}
                      <span>{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Sort Tab */
            <div className="px-4 py-4">
              <div className="space-y-2">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setLocalFilters(prev => ({ ...prev, sort: option.value }))}
                    className={`w-full px-4 py-3 rounded-lg text-left transition-all flex items-center ${
                      localFilters.sort === option.value
                        ? 'bg-[#478c0b] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {faToLucide[option.icon] && React.createElement(faToLucide[option.icon], { className: 'w-4 h-4 stroke-[1.5] mr-3' })}
                    <span className="font-medium">{option.label}</span>
                    {localFilters.sort === option.value && (
                      <Check className="w-4 h-4 stroke-[1.5] ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-[#478c0b] text-white rounded-lg hover:bg-[#3a6d08] font-medium"
          >
            Apply Filters
            {(localFilters.vendors.length + localFilters.categories.length + localFilters.dietary.length + (localFilters.selectedTags?.length || 0)) > 0 && (
              <span className="ml-2 bg-white text-[#478c0b] text-xs px-2 py-0.5 rounded-full font-bold">
                {localFilters.vendors.length + localFilters.categories.length + localFilters.dietary.length + (localFilters.selectedTags?.length || 0)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}