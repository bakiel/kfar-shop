'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Star, Clock, MapPin, Phone, Mail, Facebook, Instagram, ShoppingCart, Info, Truck, CreditCard, Award } from 'lucide-react';
import { Product } from '@/lib/data/products';
import { useCart } from '@/lib/context/CartContext';
import ProductImage from '@/components/ui/ProductImage';
import { SmartQRCompactFixed } from '@/components/qr/SmartQRCompactFixed';
import VendorHeroSection from './VendorHeroSection';
import NewStoreBadge from '@/components/ui/NewStoreBadge';

interface VendorStorePageProps {
  vendorId: string;
  vendorData: any;
  products: Product[];
  theme?: 'modern' | 'artisanal' | 'premium' | 'community' | 'fresh' | 'heritage';
}

export default function VendorStorePage({ vendorId, vendorData, products, theme = 'modern' }: VendorStorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, isInCart, getQuantity, updateQuantity } = useCart();
  
  // Helper function to check if store is currently open
  const isStoreOpen = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const todaySchedule = vendorData.businessHours?.[currentDay] || 
                         vendorData.operatingHours?.find((h: any) => h.day.toLowerCase() === currentDay);
    
    if (!todaySchedule || todaySchedule.closed) {
      return false;
    }
    
    const openTime = todaySchedule.open || '09:00';
    const closeTime = todaySchedule.close || '18:00';
    
    return currentTime >= openTime && currentTime <= closeTime;
  };
  
  // Helper function to render open/closed status
  const renderOpenStatus = () => {
    const isOpen = isStoreOpen();
    
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <Clock className="w-4 h-4" />
        <span>{isOpen ? 'OPEN NOW' : 'CLOSED'}</span>
      </div>
    );
  };
  
  // Helper function to get formatted operating hours
  const getOperatingHours = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Use businessHours from onboarding if available
    if (vendorData.businessHours) {
      return daysOfWeek.map(day => {
        const dayKey = day.toLowerCase();
        const hours = vendorData.businessHours[dayKey];
        return {
          day,
          open: hours?.open || '09:00',
          close: hours?.close || '18:00',
          closed: hours?.closed || false,
          isToday: day === today
        };
      });
    }
    
    // Fall back to operatingHours array
    if (vendorData.operatingHours) {
      return vendorData.operatingHours.map((schedule: any) => ({
        ...schedule,
        isToday: schedule.day === today
      }));
    }
    
    // Default hours
    return daysOfWeek.map(day => ({
      day,
      open: '09:00',
      close: '18:00',
      closed: day === 'Saturday',
      isToday: day === today
    }));
  };

  // Debug logging
  useEffect(() => {
    console.log('VendorStorePage loaded:', {
      vendorId,
      vendorName: vendorData.businessName,
      logo: vendorData.logo,
      banner: vendorData.bannerImage,
      productCount: products.length,
      theme
    });
  }, [vendorId, vendorData, products.length, theme]);

  // Theme configurations
  const themeConfig = {
    modern: {
      primary: '#478c0b',
      secondary: '#f6af0d',
      accent: '#c23c09',
      hero: 'gradient-to-br from-leaf-green/90 to-sun-gold/90',
      card: 'bg-white/95 backdrop-blur',
      text: 'text-gray-800'
    },
    artisanal: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#FFD700',
      hero: 'gradient-to-br from-amber-700/90 to-yellow-600/90',
      card: 'bg-amber-50/95 backdrop-blur',
      text: 'text-amber-900'
    },
    premium: {
      primary: '#1a1a1a',
      secondary: '#f6af0d',
      accent: '#ffffff',
      hero: 'gradient-to-br from-gray-900/95 to-gray-700/90',
      card: 'bg-gray-50/95 backdrop-blur',
      text: 'text-gray-900'
    },
    community: {
      primary: '#478c0b',
      secondary: '#8B4513',
      accent: '#f6af0d',
      hero: 'gradient-to-br from-leaf-green/90 to-earth-brown/90',
      card: 'bg-green-50/95 backdrop-blur',
      text: 'text-green-900'
    },
    fresh: {
      primary: '#2ECC71',
      secondary: '#3498DB',
      accent: '#E74C3C',
      hero: 'gradient-to-br from-green-500/90 to-blue-500/90',
      card: 'bg-blue-50/95 backdrop-blur',
      text: 'text-blue-900'
    },
    heritage: {
      primary: '#8B0000',
      secondary: '#FFD700',
      accent: '#000000',
      hero: 'gradient-to-br from-red-900/90 to-yellow-600/90',
      card: 'bg-red-50/95 backdrop-blur',
      text: 'text-red-900'
    }
  };

  const currentTheme = themeConfig[theme];

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity === 0) {
      updateQuantity(productId, 0);
    } else {
      updateQuantity(productId, quantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Using unified template */}
      <VendorHeroSection 
        vendorData={vendorData}
        theme={currentTheme}
      />

      {/* Search and Filter Bar */}
      <section className="sticky top-0 z-30 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-green"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-leaf-green text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Products' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Our Products</h2>
          <p className="text-gray-600">{filteredProducts.length} items</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const inCart = isInCart(product.id);
            const quantity = getQuantity(product.id);

            return (
              <div key={product.id} className={`${currentTheme.card} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
                <Link href={`/product/${product.id}`}>
                  <div className="relative h-48 cursor-pointer">
                    <ProductImage
                      src={product.image}
                      alt={product.name || "Image"}
                      className="w-full h-full object-cover"
                    />
                    {product.isNew && (
                      <span className="absolute top-2 right-2 bg-sun-gold text-white px-3 py-1 rounded-full text-sm font-semibold">
                        New
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/product/${product.id}`}>
                    <h3 className={`font-semibold text-lg mb-2 ${currentTheme.text} hover:underline cursor-pointer`}>{product.name}</h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold" style={{ color: currentTheme.primary }}>
                      ₪{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ₪{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mb-3">
                    <Link href={`/product/${product.id}`} className="flex-1">
                      <button
                        className="w-full py-2 rounded-xl font-semibold transition-all duration-300 border-2"
                        style={{ 
                          borderColor: currentTheme.primary,
                          color: currentTheme.primary 
                        }}
                      >
                        View Details
                      </button>
                    </Link>
                  </div>

                  {!inCart ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                      style={{ 
                        backgroundColor: currentTheme.primary, 
                        color: 'white' 
                      }}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleQuantityChange(product.id, quantity - 1)}
                        className="px-4 py-2 rounded-lg border-2 font-semibold transition-all"
                        style={{ borderColor: currentTheme.primary, color: currentTheme.primary }}
                      >
                        -
                      </button>
                      <span className="font-semibold text-lg">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(product.id, quantity + 1)}
                        className="px-4 py-2 rounded-lg font-semibold transition-all"
                        style={{ backgroundColor: currentTheme.primary, color: 'white' }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* About the Owner Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: currentTheme.primary }}>
              About the Owner
            </h2>
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Owner Photo */}
              <div className="md:col-span-1">
                <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden shadow-xl">
                  {vendorData.ownerPhoto ? (
                    <Image
                      src={vendorData.ownerPhoto}
                      alt={`${vendorData.ownerName || vendorData.businessName} owner`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: currentTheme.primary }}>
                      <span className="text-white text-6xl font-bold">
                        {(vendorData.ownerName || vendorData.businessName || 'O')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                {vendorData.ownerName && (
                  <h3 className="text-xl font-semibold text-center mt-4" style={{ color: currentTheme.primary }}>
                    {vendorData.ownerName}
                  </h3>
                )}
                <p className="text-center text-gray-600 mt-1">Founder & Owner</p>
              </div>
              
              {/* Owner Story */}
              <div className="md:col-span-2 space-y-4">
                <div className={`${currentTheme.card} rounded-xl p-6`}>
                  <p className="text-lg leading-relaxed" style={{ color: currentTheme.text }}>
                    {vendorData.aboutOwner || vendorData.ownerStory || 
                    `Welcome to ${vendorData.businessName}! We're passionate about bringing you the finest vegan products that align with the Village of Peace values. Our commitment to quality, sustainability, and community wellness drives everything we do.`}
                  </p>
                </div>
                
                {/* Mission Statement */}
                {(vendorData.mission || vendorData.values) && (
                  <div className={`${currentTheme.card} rounded-xl p-6`}>
                    <h4 className="font-semibold mb-2" style={{ color: currentTheme.primary }}>Our Mission</h4>
                    <p className="text-gray-700">
                      {vendorData.mission || vendorData.values || 'To provide exceptional vegan products that nourish body and soul while supporting our community.'}
                    </p>
                  </div>
                )}
                
                {/* Community Involvement */}
                <div className="flex flex-wrap gap-3">
                  {vendorData.communityInvolvement?.map((item: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: `${currentTheme.secondary}20`,
                        color: currentTheme.primary
                      }}
                    >
                      {item}
                    </span>
                  )) || (
                    <>
                      <span
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${currentTheme.secondary}20`,
                          color: currentTheme.primary
                        }}
                      >
                        Community Member Since {vendorData.metadata?.established || '2020'}
                      </span>
                      <span
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${currentTheme.secondary}20`,
                          color: currentTheme.primary
                        }}
                      >
                        100% Vegan
                      </span>
                      <span
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${currentTheme.secondary}20`,
                          color: currentTheme.primary
                        }}
                      >
                        VOP Certified
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Info Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className={`${currentTheme.card} rounded-2xl p-6`}>
              <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.primary }}>Contact Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" style={{ color: currentTheme.secondary }} />
                  <span>{vendorData.contactInfo?.phone || 'Contact via app'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: currentTheme.secondary }} />
                  <span>{vendorData.contactInfo?.email || 'info@kfar.com'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: currentTheme.secondary }} />
                  <span>{vendorData.contactInfo?.address || 'Village of Peace, Dimona'}</span>
                </div>
              </div>
            </div>

            {/* Operating Hours with OPEN/CLOSED Status */}
            <div className={`${currentTheme.card} rounded-2xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: currentTheme.primary }}>Operating Hours</h3>
                {renderOpenStatus()}
              </div>
              <div className="space-y-2">
                {getOperatingHours().map((schedule: any) => (
                  <div key={schedule.day} className={`flex justify-between ${schedule.isToday ? 'font-semibold' : ''}`}>
                    <span className={schedule.isToday ? `text-${currentTheme.primary}` : ''}>
                      {schedule.day} {schedule.isToday && '(Today)'}
                    </span>
                    <span className={schedule.closed ? 'text-gray-500' : ''}>
                      {schedule.closed ? 'Closed' : `${schedule.open} - ${schedule.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className={`${currentTheme.card} rounded-2xl p-6`}>
              <h3 className="text-xl font-bold mb-4" style={{ color: currentTheme.primary }}>Why Choose Us</h3>
              <div className="flex flex-wrap gap-2">
                {vendorData.features?.map((feature: string) => (
                  <span 
                    key={feature} 
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ 
                      backgroundColor: `${currentTheme.secondary}20`,
                      color: currentTheme.primary 
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* QR Code Section */}
            <div className={`${currentTheme.card} rounded-2xl p-6`}>
              <h3 className="text-xl font-bold mb-4 text-center" style={{ color: currentTheme.primary }}>Quick Store Access</h3>
              <div className="flex justify-center mb-4">
                <SmartQRCompactFixed
                  type="vendor"
                  data={{
                    id: vendorId,
                    name: vendorData.name,
                    logo: vendorData.logo,
                    description: vendorData.description,
                    categories: vendorData.tags,
                    productCount: products.length
                  }}
                  size={200}
                  hideActions={false}
                />
              </div>
              <p className="text-center text-sm text-gray-600">
                Scan to save our store
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}