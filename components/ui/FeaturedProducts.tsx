'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
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
}

const FeaturedProducts = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const products: Product[] = [
    {
      id: 'td-001',
      name: 'Classic Seitan Schnitzel',
      vendor: 'Teva Deli',
      vendorLogo: '/images/vendors/teva_deli_logo_vegan_factory.jpg',
      price: '₪45',
      originalPrice: '₪55',
      image: '/images/vendors/teva-deli/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg',
      category: 'meat-alternatives',
      badge: 'Best Seller',
      description: 'Golden breaded cutlet, Israeli comfort food',
      rating: 5
    },
    {
      id: 'gd-002',
      name: 'Chocolate Tahini Swirl',
      vendor: 'Gahn Delight',
      vendorLogo: '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg',
      price: '₪35',
      image: '/images/vendors/gahn_delight_ice_cream_chocolate_tahini_swirl_cup_with_cacao_nibs.jpeg',
      category: 'desserts',
      badge: 'New',
      description: 'Premium ice cream with cacao nibs',
      rating: 5
    },
    {
      id: 'gd-001',
      name: 'Passion Mango Delight',
      vendor: 'Gahn Delight',
      vendorLogo: '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg',
      price: '₪32',
      image: '/images/vendors/gahn_delight_ice_cream_passion_mango_double_scoop_cup.jpg',
      category: 'desserts',
      description: 'Tropical paradise in every scoop',
      rating: 4
    },
    {
      id: 'qc-002',
      name: 'Gourmet Vegan Burger',
      vendor: "Queen's Cuisine",
      vendorLogo: '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg',
      price: '₪52',
      originalPrice: '₪65',
      image: '/images/vendors/queens_cuisine_vegan_burger_seitan_patty_sesame_bun_tomato_lettuce_plant_based_sandwich.jpg',
      category: 'meat-alternatives',
      badge: 'Chef Special',
      description: 'Artisan seitan patty on sesame bun',
      rating: 5
    },
    {
      id: 'gol-004',
      name: 'Smoothie Bowl Mix',
      vendor: 'Garden of Light',
      vendorLogo: '/images/vendors/Garden of Light Logo.jpg',
      price: '₪89',
      image: '/images/vendors/stock_image_food_smoothie_bowl_healthy_breakfast_lifestyle.jpg',
      category: 'breakfast',
      badge: 'Organic',
      description: 'Superfood breakfast blend',
      rating: 5
    },
    {
      id: 'qc-001',
      name: 'Middle Eastern Shawarma',
      vendor: "Queen's Cuisine",
      vendorLogo: '/images/vendors/queens_cuisine_logo_vegan_food_art.jpg',
      price: '₪48',
      image: '/images/vendors/queens_cuisine_middle_eastern_shawarma_pita_wrap_plant_based_meat_alternative.jpg',
      category: 'meat-alternatives',
      description: 'Authentic spiced seitan in pita',
      rating: 5
    },
    {
      id: 'gd-003',
      name: 'Pistachio Rose Dream',
      vendor: 'Gahn Delight',
      vendorLogo: '/images/vendors/gahn_delight_logo_handcrafted_foods.jpg',
      price: '₪38',
      image: '/images/vendors/gahn_delight_ice_cream_pistachio_rose_triple_scoop_ceramic_bowl.jpeg',
      category: 'desserts',
      badge: 'Premium',
      description: 'Luxurious Middle Eastern flavors',
      rating: 5
    },
    {
      id: 'td-003',
      name: 'Traditional Kubeh',
      vendor: 'Teva Deli',
      vendorLogo: '/images/vendors/teva_deli_logo_vegan_factory.jpg',
      price: '₪42',
      image: '/images/vendors/teva-deli/teva_deli_vegan_seitan_kubeh_middle_eastern_specialty_plant_based_meat_alternative_israeli_cuisine.jpg',
      category: 'meat-alternatives',
      description: 'Handcrafted dumplings in broth',
      rating: 4
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: 'fa-th', color: '#478c0b' },
    { id: 'meat-alternatives', name: 'Meat Alternatives', icon: 'fa-drumstick-bite', color: '#c23c09' },
    { id: 'desserts', name: 'Frozen Desserts', icon: 'fa-ice-cream', color: '#f6af0d' },
    { id: 'breakfast', name: 'Breakfast', icon: 'fa-sun', color: '#478c0b' }
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  alt={product.name || "Image"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
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
                  <div className="relative w-8 h-8">
                    <Image
                      src={product.vendorLogo}
                      alt={product.vendor || "Image"}
                      fill
                      className="object-cover rounded-full border-2"
                      style={{ borderColor: '#e5e7eb' }}
                    />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    {product.vendor}
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
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i 
                      key={i} 
                      className={`fas fa-star text-xs ${i < product.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    ></i>
                  ))}
                  <span className="text-xs ml-1" style={{ color: '#6b7280' }}>
                    ({product.rating}.0)
                  </span>
                </div>
                
                {/* Price */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold" style={{ color: '#c23c09' }}>
                      {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm line-through ml-2" style={{ color: '#9ca3af' }}>
                        {product.originalPrice}
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

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ color: '#478c0b' }}>400+</div>
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

export default FeaturedProducts;