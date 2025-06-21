'use client';

import { useState, useEffect } from 'react';

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  vendors: string[];
  selectedVendors: string[];
  onVendorToggle: (vendor: string) => void;
  dietaryOptions: string[];
  selectedDietary: string[];
  onDietaryToggle: (option: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  vendors,
  selectedVendors,
  onVendorToggle,
  dietaryOptions,
  selectedDietary,
  onDietaryToggle,
  onReset,
  onApply
}: MobileFilterSheetProps) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  const handleApply = () => {
    onPriceRangeChange(localPriceRange);
    onApply();
    onClose();
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
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <i className="fas fa-times text-gray-600"></i>
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className="overflow-y-auto px-4 pb-24">
          {/* Categories */}
          <div className="py-6 border-b border-gray-200">
            <h3 className="font-semibold mb-4" style={{ color: '#3a3a1d' }}>Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeCategory === category 
                      ? 'bg-[#478c0b] text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="py-6 border-b border-gray-200">
            <h3 className="font-semibold mb-4" style={{ color: '#3a3a1d' }}>Price Range</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>₪{localPriceRange[0]}</span>
                <span>₪{localPriceRange[1]}</span>
              </div>
              
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div 
                  className="absolute h-2 rounded-full"
                  style={{
                    backgroundColor: '#478c0b',
                    left: `${(localPriceRange[0] / 200) * 100}%`,
                    right: `${100 - (localPriceRange[1] / 200) * 100}%`
                  }}
                />
                
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={localPriceRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value < localPriceRange[1]) {
                      setLocalPriceRange([value, localPriceRange[1]]);
                    }
                  }}
                  className="absolute w-full h-2 opacity-0 cursor-pointer"
                />
                
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={localPriceRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > localPriceRange[0]) {
                      setLocalPriceRange([localPriceRange[0], value]);
                    }
                  }}
                  className="absolute w-full h-2 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Vendors */}
          <div className="py-6 border-b border-gray-200">
            <h3 className="font-semibold mb-4" style={{ color: '#3a3a1d' }}>Vendors</h3>
            <div className="space-y-2">
              {vendors.map(vendor => (
                <label key={vendor} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(vendor)}
                    onChange={() => onVendorToggle(vendor)}
                    className="mr-3 w-5 h-5 text-[#478c0b] rounded focus:ring-[#478c0b]"
                  />
                  <span>{vendor}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dietary Options */}
          <div className="py-6">
            <h3 className="font-semibold mb-4" style={{ color: '#3a3a1d' }}>Dietary Options</h3>
            <div className="space-y-2">
              {dietaryOptions.map(option => (
                <label key={option} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDietary.includes(option)}
                    onChange={() => onDietaryToggle(option)}
                    className="mr-3 w-5 h-5 text-[#478c0b] rounded focus:ring-[#478c0b]"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-[#478c0b] text-white rounded-lg hover:bg-[#3a6d08]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}