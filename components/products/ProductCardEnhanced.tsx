'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { Product } from '@/lib/types/product';
import { getImageFallback, handleImageError } from '@/lib/utils/image-fallback';
import VOPComplianceBadge, { SimpleTooltip } from './VOPComplianceBadge';

interface ProductCardEnhancedProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCardEnhanced({ product, viewMode = 'grid' }: ProductCardEnhancedProps) {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        vendorId: product.vendorId,
        vendorName: product.vendorName,
        quantity: 1
      });
      
      // Visual feedback
      setTimeout(() => setIsAdding(false), 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAdding(false);
    }
  };

  // Get proper fallback image based on vendor and category
  const imageSrc = imageError 
    ? getImageFallback({
        vendorId: product.vendorId,
        category: product.category
      })
    : product.image;

  const handleImageErrorWithFallback = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageError(true);
    handleImageError(e, {
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      category: product.category
    });
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/product/${product.id}`} className="block">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-4 flex gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={imageSrc}
              alt={product.name || "Image"}
              fill
              className="object-cover rounded-lg"
              onError={handleImageErrorWithFallback}
              unoptimized={imageError}
            />
            {product.badge && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {product.badge}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1" style={{ color: '#3a3a1d' }}>
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-bold" style={{ color: '#c23c09' }}>
                  ₪{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ₪{product.originalPrice}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || isAdding}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  !product.inStock
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : isAdding
                    ? 'bg-green-600 text-white'
                    : 'bg-[#478c0b] text-white hover:bg-[#3a6d08]'
                }`}
              >
                {!product.inStock ? 'Out of Stock' : isAdding ? '✓ Added' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view (default)
  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
        <div className="relative aspect-square">
          <Image
            src={imageSrc}
            alt={product.name || "Image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageErrorWithFallback}
            unoptimized={imageError}
          />
          
          {/* Vendor badge */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium"
               style={{ color: '#3a3a1d' }}>
            {product.vendorName}
          </div>
          
          {/* VOP Compliance Badge - All products are VOP compliant */}
          <div className="absolute bottom-2 left-2">
            <VOPComplianceBadge
              status="approved"
              label="VOP"
              color="#478c0b"
              icon="fa-check-circle"
              size="small"
            />
          </div>
          
          {product.badge && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {product.badge}
            </span>
          )}
          
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1" style={{ color: '#3a3a1d' }}>
            {product.name}
          </h3>
          
          {product.nameHe && (
            <p className="text-sm text-gray-600 mb-2">{product.nameHe}</p>
          )}
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xl font-bold" style={{ color: '#c23c09' }}>
                ₪{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₪{product.originalPrice}
                </span>
              )}
            </div>
            
            {product.tags && product.tags.includes('organic') && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Organic
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            className={`w-full py-2 rounded-lg font-medium transition-all ${
              !product.inStock
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : isAdding
                ? 'bg-green-600 text-white flex items-center justify-center gap-2'
                : 'bg-[#478c0b] text-white hover:bg-[#3a6d08]'
            }`}
          >
            {!product.inStock ? (
              'Out of Stock'
            ) : isAdding ? (
              <>
                <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Added to Cart
              </>
            ) : (
              'Add to Cart'
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}