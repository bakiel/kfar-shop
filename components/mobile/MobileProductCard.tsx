'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { Heart, Star, Plus } from 'lucide-react';

interface MobileProductCardProps {
  product: {
    id: string | number;
    name: string;
    vendorId: string;
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
  const [imageSrc, setImageSrc] = useState(product.image);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: String(product.id),
      name: product.name,
      price: parseFloat(product.price.replace('₪', '')),
      vendorId: product.vendorId,
      vendorName: product.vendor,
      image: product.image,
      quantity: 1
    });
  };

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Image Container - Clickable */}
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
            type="button"
            aria-label={`Save ${product.name} to wishlist`}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center z-10 shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add wishlist logic
            }}
          >
            <Heart className="w-4 h-4 stroke-[1.5] text-gray-600" />
          </button>

          <Image
            src={imageSrc}
            alt={product.name || "Image"}
            fill
            quality={55}
            className={`object-cover transition-opacity duration-300 ${
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              if (imageSrc !== '/images/placeholder-product.jpg') {
                setImageSrc('/images/placeholder-product.jpg');
                return;
              }
              setIsImageLoaded(true);
            }}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
          />
          
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Content - Clickable except for button */}
        <div className="p-3">
          {/* Vendor */}
          <div className="flex items-center gap-2 mb-1">
            {product.vendorLogo && (
              <div className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={product.vendorLogo}
                  alt={product.vendor || "Vendor"}
                  fill
                  sizes="20px"
                  quality={40}
                  className="object-cover"
                  onError={(e) => {
                    // Hide broken image
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            <span className="text-xs text-gray-600">{product.vendor}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ color: '#3a3a1d' }}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 stroke-[1.5] ${
                  i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs text-gray-600 ml-1">({product.rating})</span>
          </div>

          {/* Price and Add to Cart */}
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
              type="button"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
              style={{ backgroundColor: '#478c0b' }}
            >
              <Plus className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
