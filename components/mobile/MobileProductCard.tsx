'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/context/CartContext';

interface MobileProductCardProps {
  product: {
    id: number;
    name: string;
    vendor: string;
    vendorLogo: string;
    price: string;
    originalPrice?: string;
    image: string;
    category: string;
    badge?: string;
    description: string;
    rating: number;
  };
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.replace('₪', '')),
      vendor: product.vendor,
      image: product.image,
      quantity: 1
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/product/${product.id}`}>
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100">
          {product.badge && (
            <div className="absolute top-2 left-2 z-10">
              <span 
                className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                style={{ backgroundColor: '#c23c09' }}
              >
                {product.badge}
              </span>
            </div>
          )}
          
          {/* Wishlist Button */}
          <button 
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center z-10 shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              // Add wishlist logic
            }}
          >
            <i className="far fa-heart text-gray-600 text-sm"></i>
          </button>

          <Image
            src={product.image}
            alt={product.name || "Image"}
            fill
            className={`object-cover transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Vendor */}
          <div className="flex items-center gap-2 mb-1">
            <div className="relative w-5 h-5 rounded-full overflow-hidden">
              <Image
                src={product.vendorLogo}
                alt={product.vendor || "Image"}
                fill
                className="object-cover"
              />
            </div>
            <span className="text-xs text-gray-600">{product.vendor}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ color: '#3a3a1d' }}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <i
                key={i}
                className={`fas fa-star text-xs ${
                  i < product.rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
              ></i>
            ))}
            <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                {product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-500 line-through ml-1">
                  {product.originalPrice}
                </span>
              )}
            </div>

            {/* Add to Cart Button - Mobile Optimized */}
            <button
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
              style={{ backgroundColor: '#478c0b' }}
            >
              <i className="fas fa-plus text-sm"></i>
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}