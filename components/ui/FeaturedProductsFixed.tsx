'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getFeaturedProducts } from '@/lib/data/wordpress-style-data-layer';
import { Product } from '@/lib/types/product';

const FeaturedProductsFixed = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    // Load featured products from the data layer
    try {
      const featuredProducts = getFeaturedProducts(12);
      setProducts(featuredProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading products:', error);
      setLoading(false);
    }
  }, []);

  const categories = [
    { id: 'all', name: 'All Products', icon: 'fa-th', color: '#478c0b' },
    { id: 'meat-alternatives', name: 'Meat Alternatives', icon: 'fa-drumstick-bite', color: '#c23c09' },
    { id: 'ice-cream', name: 'Frozen Desserts', icon: 'fa-ice-cream', color: '#f6af0d' },
    { id: 'spreads', name: 'Spreads & Dips', icon: 'fa-jar', color: '#478c0b' }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const badgeColors: { [key: string]: string } = {
    'Best Seller': '#c23c09',
    'New': '#478c0b',
    'Chef Special': '#f6af0d',
    'Premium': '#3a3a1d',
    'Organic': '#478c0b'
  };

  if (loading) {
    return (
      <section className="py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Loading Featured Products...</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 relative overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            rgba(246, 175, 13, 0.1) 40px,
            rgba(246, 175, 13, 0.1) 80px
          )`
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg" style={{ backgroundColor: '#f6af0d' }}>
              <i className="fas fa-shopping-bag mr-2"></i>
              Marketplace Favorites
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
            Featured Products
          </h2>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#4b5563' }}>
            Handpicked selections from our founding businesses, showcasing the best of 
            Village of Peace vegan excellence
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 ${
                activeCategory === category.id
                  ? 'text-white shadow-xl scale-105'
                  : 'bg-white text-gray-700 hover:text-gray-900 border-2'
              }`}
              style={{
                backgroundColor: activeCategory === category.id ? category.color : undefined,
                borderColor: activeCategory !== category.id ? '#e5e7eb' : undefined
              }}
            >
              <i className={`fas ${category.icon}`}></i>
              <span>{category.name}</span>
              <span className="text-xs opacity-75">
                ({products.filter(p => category.id === 'all' || p.category === category.id).length})
              </span>
            </button>
          ))}
        </div>

        {/* Products Grid - Improved mobile responsiveness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className={`group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 block ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image Container */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name || "Product image"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-product.jpg';
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Badge */}
                {product.badge && (
                  <div 
                    className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg"
                    style={{ backgroundColor: badgeColors[product.badge] || '#478c0b' }}
                  >
                    {product.badge}
                  </div>
                )}
                
                {/* Quick View Button */}
                <button 
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100 hover:bg-white shadow-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <i className="fas fa-search text-gray-700"></i>
                </button>
                
                {/* Add to Cart Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button 
                    className="w-full py-3 rounded-xl text-white font-semibold shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
                    style={{ backgroundColor: 'rgba(71, 140, 11, 0.9)' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // In a real app, this would add to cart
                      alert('Added to cart!');
                    }}
                  >
                    <i className="fas fa-shopping-cart mr-2"></i>
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                {/* Vendor Info */}
                <div className="flex items-center gap-2 mb-3">
                  {product.vendorLogo && (
                    <div className="relative w-8 h-8">
                      <Image
                        src={product.vendorLogo}
                        alt={product.vendorName || "Vendor logo"}
                        fill
                        className="object-cover rounded-full border-2"
                        style={{ borderColor: '#e5e7eb' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    {product.vendorName || product.vendor}
                  </span>
                </div>
                
                {/* Product Name */}
                <h3 className="text-lg font-bold mb-1 line-clamp-1 group-hover:text-green-700 transition-colors" style={{ color: '#3a3a1d' }}>
                  {product.name}
                </h3>
                
                {/* Description */}
                <p className="text-sm mb-3 line-clamp-2" style={{ color: '#6b7280' }}>
                  {product.description}
                </p>
                
                {/* Rating */}
                {product.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <i 
                        key={i} 
                        className={`fas fa-star text-xs ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                      ></i>
                    ))}
                    <span className="text-xs ml-1" style={{ color: '#6b7280' }}>
                      ({product.rating}.0)
                    </span>
                  </div>
                )}
                
                {/* Price */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                      ₪{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm line-through ml-2" style={{ color: '#9ca3af' }}>
                        ₪{product.originalPrice}
                      </span>
                    )}
                  </div>
                  
                  {/* Wishlist Button */}
                  <button 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      hoveredProduct === product.id 
                        ? 'bg-red-50 text-red-500' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <i className={`${hoveredProduct === product.id ? 'fas' : 'far'} fa-heart`}></i>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl" style={{ color: '#6b7280' }}>
              No products found in this category.
            </p>
          </div>
        )}

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: '#478c0b' }}>{products.length}+</div>
              <div className="text-sm" style={{ color: '#6b7280' }}>Products Available</div>
            </div>
            <div className="w-px h-12" style={{ backgroundColor: '#e5e7eb' }}></div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: '#f6af0d' }}>6</div>
              <div className="text-sm" style={{ color: '#6b7280' }}>Trusted Vendors</div>
            </div>
            <div className="w-px h-12" style={{ backgroundColor: '#e5e7eb' }}></div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: '#c23c09' }}>100%</div>
              <div className="text-sm" style={{ color: '#6b7280' }}>Vegan Certified</div>
            </div>
          </div>
          
          <Link href="/shop">
            <button className="px-8 py-4 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 mx-auto" style={{ backgroundColor: '#478c0b' }}>
              <i className="fas fa-store"></i>
              Explore Full Shop
              <i className="fas fa-arrow-right"></i>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsFixed;