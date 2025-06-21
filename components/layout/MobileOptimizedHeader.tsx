'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Search, ShoppingCart, Menu, X, ArrowLeft, ChevronDown,
  MapPin, User, Home, Store, Filter, Heart, Grid
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { useHeaderConfig } from '@/hooks/useHeaderConfig';
import { completeProductCatalog } from '@/lib/data/complete-catalog';

export default function MobileOptimizedHeader() {
  const router = useRouter();
  const headerConfig = useHeaderConfig();
  const { items } = useCart();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate search suggestions
  useEffect(() => {
    if (searchQuery.length > 1) {
      const query = searchQuery.toLowerCase();
      
      // Product suggestions
      const products = completeProductCatalog.flatMap(vendor => 
        vendor.products
          .filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.tags?.some(tag => tag.toLowerCase().includes(query))
          )
          .map(p => ({
            type: 'product',
            id: p.id,
            title: p.name,
            subtitle: `${vendor.name} • ₪${p.price}`,
            image: p.image,
            link: `/product/${p.id}`
          }))
      ).slice(0, 4);

      // Vendor suggestions
      const vendors = completeProductCatalog
        .filter(v => 
          v.name.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query)
        )
        .map(v => ({
          type: 'vendor',
          id: v.id,
          title: v.name,
          subtitle: `${v.products.length} products`,
          image: v.logo,
          link: `/store/${v.id}`,
          icon: Store
        }))
        .slice(0, 2);

      // Category suggestions
      const categories = [
        { name: 'Vegan Deli', slug: 'vegan-deli' },
        { name: 'Ice Cream', slug: 'ice-cream' },
        { name: 'Organic', slug: 'organic' },
        { name: 'Bulk Foods', slug: 'bulk-foods' }
      ];
      
      const categoryMatches = categories
        .filter(c => c.name.toLowerCase().includes(query))
        .map(c => ({
          type: 'category',
          title: c.name,
          subtitle: 'Browse category',
          link: `/shop?category=${c.slug}`,
          icon: Grid
        }))
        .slice(0, 2);

      setSuggestions([...products, ...vendors, ...categoryMatches]);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      
      // Navigate to search results
      router.push(`/shop?search=${encodeURIComponent(query)}`);
      setSearchQuery('');
      setIsSearchFocused(false);
      setSuggestions([]);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Mobile search overlay
  const renderSearchOverlay = () => (
    <div className={`fixed inset-0 bg-white z-50 transition-transform duration-300 ${
      isSearchFocused ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <button
            onClick={() => setIsSearchFocused(false)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchQuery);
            }}
            className="flex-1 relative"
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, vendors..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none"
              autoFocus
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </form>
        </div>

        {/* Search Content */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.length === 0 && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-3"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Suggestions</h3>
              <div className="space-y-2">
                {suggestions.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.link}
                    onClick={() => setIsSearchFocused(false)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg"
                  >
                    {item.image ? (
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.title || "Image"}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : item.icon ? (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <item.icon className="w-6 h-6 text-gray-600" />
                      </div>
                    ) : null}
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.subtitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {searchQuery.length > 0 && suggestions.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Different header layouts based on variant
  const renderHeader = () => {
    switch (headerConfig.variant) {
      case 'vendor':
        return (
          <>
            {/* Main Header Bar */}
            <div className="bg-white border-b">
              <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {headerConfig.showBackButton && (
                    <Link
                      href={headerConfig.backButtonLink || '/marketplace'}
                      className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                  )}
                  <span className="text-sm font-medium text-gray-600">
                    {headerConfig.backButtonText}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsSearchFocused(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                  {headerConfig.vendorInfo && (
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Heart className="w-5 h-5" />
                    </button>
                  )}
                  <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-earth-flame text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>

            {/* Vendor Info Bar */}
            {headerConfig.vendorInfo && (
              <div className="bg-gray-50 border-b">
                <div className="container mx-auto px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                      <Image
                        src={headerConfig.vendorInfo.logo}
                        alt={headerConfig.vendorInfo.name || "Image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h1 className="font-semibold text-lg">{headerConfig.vendorInfo.name}</h1>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>⭐ {headerConfig.vendorInfo.rating}</span>
                        <span>• {headerConfig.vendorInfo.productCount} items</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        );

      case 'checkout':
        return (
          <div className="bg-white border-b">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href={headerConfig.backButtonLink || '/cart'}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="font-semibold text-lg">Checkout</h1>
              </div>
              {headerConfig.showCart && cartItemCount > 0 && (
                <span className="text-sm text-gray-600">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className={`${
            headerConfig.transparent && !isScrolled 
              ? 'bg-transparent' 
              : 'bg-white border-b'
          } transition-all duration-300`}>
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 relative">
                  <Image
                    src="/images/logos/kfar_icon_leaf_green.png"
                    alt="KFAR"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className={`font-bold text-xl ${
                  headerConfig.transparent && !isScrolled ? 'text-white' : 'text-gray-800'
                }`}>
                  KFAR
                </span>
              </Link>

              <div className="flex items-center gap-2">
                {headerConfig.showLocationPicker && (
                  <button className="hidden sm:flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg">
                    <MapPin className="w-4 h-4" style={{ color: '#478c0b' }} />
                    <span className="text-sm">Dimona</span>
                  </button>
                )}
                
                {headerConfig.showSearch && (
                  <button 
                    onClick={() => setIsSearchFocused(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}
                
                <Link href="/account" className="p-2 hover:bg-gray-100 rounded-lg">
                  <User className="w-5 h-5" />
                </Link>
                
                {headerConfig.showCart && (
                  <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-earth-flame text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 ${
        headerConfig.transparent && !isScrolled ? '' : 'shadow-sm'
      }`}>
        {renderHeader()}
      </header>

      {/* Search Overlay */}
      {renderSearchOverlay()}

      {/* Header Spacer - only when not transparent */}
      {!headerConfig.transparent && (
        <div className={
          headerConfig.variant === 'vendor' && headerConfig.vendorInfo 
            ? 'h-[134px]' 
            : 'h-14'
        } />
      )}
    </>
  );
}