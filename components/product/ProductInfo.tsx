'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';

interface ProductInfoProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    vendorId: string;
    vendorName: string;
    category: string;
    features: string[];
    inStock: boolean;
    rating: number;
    reviewCount: number;
  };
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showAddedAnimation, setShowAddedAnimation] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      price: product.price,
      quantity: quantity,
      image: '/images/vendors/teva_deli_vegan_seitan_kubeh_middle_eastern_specialty_plant_based_meat_alternative_israeli_cuisine.jpg'
    });

    // Show success animation
    setShowAddedAnimation(true);
    setTimeout(() => setShowAddedAnimation(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#3a3a1d' }}>
            {product.name}
          </h1>
          <button className="text-gray-400 hover:text-red-500 text-2xl transition-colors">
            <i className="far fa-heart"></i>
          </button>
        </div>

        <p className="text-gray-600 mb-4">{product.description}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-sm font-medium" 
            style={{ backgroundColor: '#cfe7c1', color: '#478c0b' }}>
            {product.vendorName}
          </span>
          {product.features.map((feature, index) => (
            <span key={index} className="px-3 py-1 rounded-full text-xs font-medium text-white" 
              style={{ backgroundColor: '#478c0b' }}>
              {feature}
            </span>
          ))}
        </div>

        {/* Rating & Stock */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <i key={i} className={`fas fa-star ${i < product.rating ? 'text-sun-gold' : 'text-gray-300'}`}></i>
            ))}
            <span className="ml-2 text-gray-600">({product.reviewCount} reviews)</span>
          </div>
          {product.inStock ? (
            <span className="text-green-600 font-semibold">
              <i className="fas fa-check-circle mr-1"></i>In Stock
            </span>
          ) : (
            <span className="text-red-600 font-semibold">Out of Stock</span>
          )}
        </div>
      </div>

      {/* Price Section */}
      <div className="border-t border-b py-6 mb-6">
        <div className="flex items-end gap-4 mb-4">
          <span className="text-3xl font-bold" style={{ color: '#478c0b' }}>
            ₪{product.price.toFixed(2)}
          </span>
          <div className="text-sm text-gray-600">
            <div>${(product.price / 3.5).toFixed(2)} USD</div>
            <div>€{(product.price / 3.8).toFixed(2)} EUR</div>
          </div>
        </div>

        {/* Free Delivery Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <i className="fas fa-truck"></i>
            <div>
              <div className="font-semibold text-sm">Free Local Delivery</div>
              <div className="text-xs">Orders over ₪50 within Dimona area</div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Options */}
      <div className="space-y-4">
        {/* Quantity Selector */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#3a3a1d' }}>
            Quantity:
          </label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <i className="fas fa-minus text-sm"></i>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center py-2 outline-none"
              />
              <button
                onClick={() => handleQuantityChange(1)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <i className="fas fa-plus text-sm"></i>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <div>Bulk pricing: 6+ items - 10% off</div>
              <div>Case of 12 - 15% off</div>
            </div>
          </div>
        </div>

        {/* Subscription Option */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSubscribed}
              onChange={(e) => setIsSubscribed(e.target.checked)}
              className="w-4 h-4 text-leaf-green rounded"
            />
            <span className="font-medium">Subscribe & Save 5%</span>
          </label>
          {isSubscribed && (
            <select className="mt-3 w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option>Delivery every 2 weeks</option>
              <option>Delivery every month</option>
              <option>Delivery every 2 months</option>
            </select>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              showAddedAnimation 
                ? 'bg-green-600 text-white' 
                : 'bg-earth-flame text-white hover:shadow-lg transform hover:-translate-y-0.5'
            } ${!product.inStock && 'opacity-50 cursor-not-allowed'}`}
            style={{ backgroundColor: showAddedAnimation ? undefined : '#c23c09' }}
          >
            {showAddedAnimation ? (
              <>
                <i className="fas fa-check"></i>
                Added to Cart!
              </>
            ) : (
              <>
                <i className="fas fa-shopping-cart"></i>
                Add to Cart
              </>
            )}
          </button>

          <button className="w-full py-3 rounded-xl font-semibold border-2 transition-all duration-300 hover:shadow-md"
            style={{ borderColor: '#478c0b', color: '#478c0b' }}>
            <i className="fas fa-qrcode mr-2"></i>
            Quick Buy with QR
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 px-4 rounded-lg font-medium text-sm border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <i className="far fa-heart mr-1"></i>
              Wishlist
            </button>
            <button className="py-2 px-4 rounded-lg font-medium text-sm border-2 border-gray-200 hover:border-gray-300 transition-colors">
              <i className="fas fa-share mr-1"></i>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;