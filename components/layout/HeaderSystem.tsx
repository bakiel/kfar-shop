'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, ShoppingCart, Menu, X, ArrowLeft, ChevronDown,
  MapPin, User, Home, Store, Filter, Globe, Heart
} from 'lucide-react';
import { useCart } from '@/lib/context/CartContext';
import { completeProductCatalog } from '@/lib/data/complete-catalog';

interface HeaderConfig {
  variant: 'default' | 'vendor' | 'checkout' | 'minimal' | 'product';
  showSearch?: boolean;
  showCart?: boolean;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonLink?: string;
  vendorInfo?: any;
  transparent?: boolean;
}

export default function HeaderSystem({ config }: { config?: HeaderConfig } = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Determine header variant based on current path
  const getHeaderConfig = (): HeaderConfig => {
    if (config) return config;

    if (pathname.startsWith('/store/')) {
      return {
        variant: 'vendor',
        showSearch: true,
        showCart: true,
        showBackButton: true,
        backButtonText: 'Back to Marketplace',
        backButtonLink: '/marketplace'
      };
    }
    
    if (pathname.startsWith('/product/')) {
      return {
        variant: 'product',
        showSearch: true,
        showCart: true,
        showBackButton: true,
        backButtonText: 'Continue Shopping',
        backButtonLink: '/shop'
      };
    }

    if (pathname.startsWith('/checkout') || pathname.startsWith('/cart')) {
      return {
        variant: 'checkout',
        showSearch: false,
        showCart: true,
        showBackButton: true,
        backButtonText: 'Back to Shopping',
        backButtonLink: '/shop'
      };
    }

    if (pathname === '/') {
      return {
        variant: 'default',
        showSearch: true,
        showCart: true,
        transparent: true
      };
    }

    return {
      variant: 'default',
      showSearch: true,
      showCart: true
    };
  };

  const headerConfig = getHeaderConfig();

  // Handle scroll for transparent headers
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search suggestions
  useEffect(() => {
    if (searchQuery.length > 1) {
      // Search products
      const productSuggestions = completeProductCatalog.flatMap(vendor => 
        vendor.products
          .filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(product => ({
            type: 'product',
            id: product.id,
            name: product.name,
            vendor: vendor.name,
            price: product.price,
            image: product.image
          }))
      ).slice(0, 5);

      // Search vendors
      const vendorSuggestions = completeProductCatalog
        .filter(vendor => 
          vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(vendor => ({
          type: 'vendor',
          id: vendor.id,
          name: vendor.name,
          description: vendor.description,
          productCount: vendor.products.length,
          logo: vendor.logo
        }))
        .slice(0, 3);

      // Search categories
      const categories = ['Vegan Deli', 'Ice Cream', 'Organic', 'Bulk Foods', 'Heritage'];
      const categorySuggestions = categories
        .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(cat => ({
          type: 'category',
          name: cat,
          link: `/shop?category=${cat.toLowerCase().replace(' ', '-')}`
        }))
        .slice(0, 2);

      setSearchSuggestions([...productSuggestions, ...vendorSuggestions, ...categorySuggestions]);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchSuggestions([]);
      setIsSearchOpen(false);
    }
  };

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Main navigation items
  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Marketplace', href: '/marketplace', icon: Store },
    { label: 'Shop All', href: '/shop', icon: ShoppingCart },
    { label: 'About', href: '/about', icon: Globe },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          headerConfig.transparent && !isScrolled 
            ? 'bg-transparent' 
            : 'bg-white shadow-md'
        }`}
      >
        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Back Button (if applicable) */}
              {headerConfig.showBackButton && (
                <Link
                  href={headerConfig.backButtonLink || '/'}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-leaf-green/10 hover:bg-leaf-green/20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" style={{ color: '#478c0b' }} />
                  <span className="text-sm font-medium" style={{ color: '#478c0b' }}>
                    {headerConfig.backButtonText}
                  </span>
                </Link>
              )}

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 md:w-12 md:h-12 relative">
                  <Image
                    src="/images/logos/kfar_icon_leaf_green.png"
                    alt="KFAR Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className={`hidden md:block text-xl font-bold ${
                  headerConfig.transparent && !isScrolled ? 'text-white' : 'text-gray-800'
                }`}>
                  KFAR
                </span>
              </Link>
            </div>

            {/* Center Section - Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 font-medium transition-colors ${
                    pathname === item.href
                      ? headerConfig.transparent && !isScrolled ? 'text-white' : 'text-leaf-green'
                      : headerConfig.transparent && !isScrolled ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Button (Mobile) / Search Bar (Desktop) */}
              {headerConfig.showSearch && (
                <>
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Desktop Search */}
                  <div ref={searchRef} className="hidden md:block relative">
                    <form onSubmit={handleSearch} className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products, vendors..."
                        className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-leaf-green focus:bg-white transition-all"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </form>

                    {/* Search Suggestions */}
                    {searchSuggestions.length > 0 && (
                      <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                        {searchSuggestions.map((suggestion, index) => (
                          <div key={index}>
                            {suggestion.type === 'product' && (
                              <Link
                                href={`/product/${suggestion.id}`}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                                onClick={() => {
                                  setSearchQuery('');
                                  setSearchSuggestions([]);
                                }}
                              >
                                <div className="w-12 h-12 relative rounded-lg overflow-hidden">
                                  <Image
                                    src={suggestion.image}
                                    alt={suggestion.name || "Image"}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{suggestion.name}</p>
                                  <p className="text-sm text-gray-500">{suggestion.vendor} • ₪{suggestion.price}</p>
                                </div>
                              </Link>
                            )}
                            
                            {suggestion.type === 'vendor' && (
                              <Link
                                href={`/store/${suggestion.id}`}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-t"
                                onClick={() => {
                                  setSearchQuery('');
                                  setSearchSuggestions([]);
                                }}
                              >
                                <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100">
                                  <Image
                                    src={suggestion.logo}
                                    alt={suggestion.name || "Image"}
                                    fill
                                    className="object-contain p-2"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{suggestion.name}</p>
                                  <p className="text-sm text-gray-500">{suggestion.productCount} products</p>
                                </div>
                                <Store className="w-5 h-5 text-gray-400" />
                              </Link>
                            )}
                            
                            {suggestion.type === 'category' && (
                              <Link
                                href={suggestion.link}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-t"
                                onClick={() => {
                                  setSearchQuery('');
                                  setSearchSuggestions([]);
                                }}
                              >
                                <div className="w-12 h-12 rounded-lg bg-leaf-green/10 flex items-center justify-center">
                                  <Filter className="w-6 h-6" style={{ color: '#478c0b' }} />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">Browse {suggestion.name}</p>
                                  <p className="text-sm text-gray-500">View all products</p>
                                </div>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Location */}
              <button className="hidden lg:flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MapPin className="w-4 h-4" style={{ color: '#478c0b' }} />
                <span className="text-sm">Dimona</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* User Account */}
              <Link
                href="/account"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart */}
              {headerConfig.showCart && (
                <Link
                  href="/cart"
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
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

        {/* Mobile Search Bar */}
        {isSearchOpen && headerConfig.showSearch && (
          <div className="md:hidden border-t bg-white p-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, vendors..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-leaf-green"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </form>
          </div>
        )}

        {/* Vendor Header Info (if on vendor page) */}
        {headerConfig.variant === 'vendor' && headerConfig.vendorInfo && (
          <div className="border-t bg-gray-50">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 relative rounded-lg overflow-hidden">
                  <Image
                    src={headerConfig.vendorInfo.logo}
                    alt={headerConfig.vendorInfo.name || "Image"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800">{headerConfig.vendorInfo.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>⭐ {headerConfig.vendorInfo.rating}</span>
                    <span>• {headerConfig.vendorInfo.productCount} products</span>
                    <span className="hidden sm:inline">• {headerConfig.vendorInfo.category}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Back Button */}
            {headerConfig.showBackButton && (
              <Link
                href={headerConfig.backButtonLink || '/'}
                className="flex items-center gap-2 w-full px-4 py-3 bg-leaf-green/10 rounded-lg mb-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ArrowLeft className="w-4 h-4" style={{ color: '#478c0b' }} />
                <span className="font-medium" style={{ color: '#478c0b' }}>
                  {headerConfig.backButtonText}
                </span>
              </Link>
            )}
          </div>
          
          <nav className="p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-leaf-green/10 text-leaf-green'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Spacer for fixed header - only when not transparent */}
      {!headerConfig.transparent && (
        <div className={`${headerConfig.variant === 'vendor' ? 'h-32' : 'h-16 md:h-20'}`} />
      )}
    </>
  );
}