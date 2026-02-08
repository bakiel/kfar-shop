'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaStar, FaMapMarkerAlt, FaLeaf, FaStore } from 'react-icons/fa';
import NewStoreBadge from '@/components/ui/NewStoreBadge';

interface VendorBrowseCardProps {
  vendorId: string;
  vendorInfo: {
    name: string;
    logo?: string;
    description?: string;
    tags?: string[];
    createdAt?: string;
  };
  products: any[];
  index: number;
}

export default function VendorBrowseCard({ vendorId, vendorInfo, products, index }: VendorBrowseCardProps) {
  // Get vendor color theme
  const vendorThemes: Record<string, { primary: string; secondary: string }> = {
    'teva-deli': { primary: '#478c0b', secondary: '#cfe7c1' },
    'queens-cuisine': { primary: '#c23c09', secondary: '#f6af0d' },
    'garden-of-light': { primary: '#f6af0d', secondary: '#fef9ef' },
    'people-store': { primary: '#478c0b', secondary: '#cfe7c1' },
    'vop-shop': { primary: '#3a3a1d', secondary: '#cfe7c1' },
    'gahn-delight': { primary: '#c23c09', secondary: '#f6af0d' }
  };

  const theme = vendorThemes[vendorId] || { primary: '#478c0b', secondary: '#cfe7c1' };
  
  // Calculate stats
  const totalProducts = products.length;
  const featuredCount = products.filter(p => p.featured).length;
  const avgRating = 4.5 + (Math.random() * 0.5); // Placeholder rating

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative transform transition-all duration-500 hover:scale-102"
    >
      {/* Card Glow Effect */}
      <div 
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"
        style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}
      />
      
      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 group-hover:border-transparent transition-all duration-500">
        {/* New Store Badge */}
        {vendorInfo.createdAt && (
          <NewStoreBadge 
            createdAt={vendorInfo.createdAt}
            variant="corner"
          />
        )}
        
        {/* Header Section with Logo */}
        <div 
          className="relative h-32 p-6"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primary}dd, ${theme.secondary}dd)`,
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.1) 10px, rgba(255,255,255,.1) 20px)'
            }} />
          </div>
          
          {/* Logo Circle */}
          <div className="absolute top-6 left-6 w-20 h-20 bg-white rounded-full shadow-lg p-1 transform group-hover:scale-110 transition-transform duration-300">
            {vendorInfo.logo ? (
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={vendorInfo.logo}
                  alt={`${vendorInfo.name} logo`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/fallbacks/vendor-logo-fallback.svg';
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                <FaStore className="text-white text-2xl" />
              </div>
            )}
          </div>
          
          {/* Stats Badge */}
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6">
          {/* Vendor Name & Info */}
          <h3 className="text-xl font-bold mb-2" style={{ color: '#3a3a1d' }}>
            {vendorInfo.name}
          </h3>
          
          {/* Location Tag */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <FaMapMarkerAlt className="text-xs" />
            <span>Dimona, Israel</span>
          </div>
          
          {/* Product Stats */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: theme.primary }}>
                {totalProducts}
              </div>
              <div className="text-xs text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#f6af0d' }}>
                {featuredCount}
              </div>
              <div className="text-xs text-gray-600">Featured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                <FaLeaf className="inline" />
              </div>
              <div className="text-xs text-gray-600">100% Vegan</div>
            </div>
          </div>
          
          {/* Product Preview Grid */}
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-1.5">
              {products.slice(0, 8).map((product, idx) => (
                <div 
                  key={product.id} 
                  className="relative aspect-square rounded overflow-hidden group/product"
                >
                  <Image
                    src={product.image}
                    alt={product.name || "Product"}
                    fill
                    className="object-cover group-hover/product:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `/images/fallbacks/${vendorId}-product.svg`;
                    }}
                  />
                  {idx === 7 && products.length > 8 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        +{products.length - 8}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Tags */}
          {vendorInfo.tags && vendorInfo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {vendorInfo.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full font-medium"
                  style={{ 
                    backgroundColor: `${theme.secondary}30`,
                    color: theme.primary
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Visit Store Button */}
          <Link href={`/store/${vendorId}`}>
            <button 
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2" 
              style={{ backgroundColor: theme.primary }}
            >
              <FaStore />
              Visit Store
              <span className="text-xs opacity-80">({totalProducts} items)</span>
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}