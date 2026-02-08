'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Share2, Heart, Star, ShoppingCart, Plus, Minus,
  Check, ChevronDown, ChevronRight, ChevronLeft, Truck, Store, Globe, Leaf,
  Award, Clock, Package, Info, X, Eye, ClipboardList, Scale, Utensils,
  Calendar, List, CheckCircle, XCircle, Phone, MessageCircle, Mail,
  Pencil, Camera, ThumbsUp, ThumbsDown, Flag, Sparkles, LayoutGrid,
  ShoppingBasket, Gift
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useCart } from '@/lib/context/CartContext';
import { useLanguage } from '@/lib/context/LanguageContext';
import { completeProductCatalog } from '@/lib/data/complete-catalog';
import { getProductImage, getProductImages, getVendorLogo } from '@/lib/utils/image-manager';
import { SmartQRCompactFixed } from '@/components/qr/SmartQRCompactFixed';
import ProductReviews from '@/components/product/ProductReviews';
import MobileFilterSheet from '@/components/mobile/MobileFilterSheet';
import MobileCartDrawer from '@/components/mobile/MobileCartDrawer';
import CompactFloatingMenu from '@/components/mobile/CompactFloatingMenu';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import {
  pageContainer,
  pageItem,
  listContainer,
  listItem,
  cardHover,
  cardTransition,
  buttonMotionProps,
  scrollReveal,
  modalBackdrop,
  modalContent,
  celebrationBounce,
  accordionContent,
  chevronRotate,
  imageFade
} from '@/lib/animations/motion-variants';

// Helper function to get products by vendor
function getProductsByVendor(vendorId: string) {
  const vendorData = completeProductCatalog[vendorId];
  return vendorData ? vendorData.products : [];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart, getCartCount, getCartTotal } = useCart();
  const { isMobile } = useMobileDetect();
  const { language, isRTL, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  // Refs for scroll animations
  const relatedRef = useRef(null);
  const isRelatedInView = useInView(relatedRef, { once: true, margin: '-100px' });
  const [pageLoaded, setPageLoaded] = useState(false);

  // State
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Touch event handlers for pull-to-refresh
  const [touchStart, setTouchStart] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPulling && !isRefreshing) {
      const touchY = e.touches[0].clientY;
      const pull = Math.min(150, Math.max(0, touchY - touchStart));
      setPullDistance(pull);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 100 && !isRefreshing) {
      setIsRefreshing(true);
      await refreshProductData();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  const refreshProductData = async () => {
    try {
      await fetchProduct();
      // Show success feedback
      const event = new CustomEvent('show-toast', {
        detail: { message: 'Product updated!', type: 'success' }
      });
      window.dispatchEvent(event);
      
      // Haptic feedback on mobile if available
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } catch (error) {
      console.error('Failed to refresh product:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
      
      // First, try to fetch from our API
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
            
            // Find vendor info from catalog if needed
            let vendorInfo = null;
            for (const [vendorId, vendorData] of Object.entries(completeProductCatalog)) {
              if (vendorData.vendorName === data.vendor_name) {
                vendorInfo = vendorData;
                break;
              }
            }
            
            // Transform API data to match our product structure
            const transformedProduct = {
              ...data,
              id: data.id,
              image: data.image || data.primary_image || '/images/placeholder.jpg',
              images: data.images || [data.image || '/images/placeholder.jpg'],
              name: data.name,
              description: data.description,
              rating: data.rating || 4.5,
              reviewCount: data.reviewCount || 0,
              vendor: data.vendorName || data.vendor_name,
              vendorId: data.vendorId || data.vendor_id,
              vendorLogo: vendorInfo?.logo || '/images/placeholder.jpg',
              longDescription: data.longDescription || data.description,
              specifications: data.extendedData?.specifications ? [
                { label: 'Weight', value: data.extendedData.specifications.weight },
                { label: 'Servings', value: data.extendedData.specifications.servings },
                { label: 'Shelf Life', value: data.extendedData.specifications.shelf_life },
                { label: 'Ingredients', value: data.extendedData.specifications.ingredients?.join(', ') }
              ].filter(spec => spec.value) : [],
              culturalSignificance: data.culturalSignificance || null,
              shippingInfo: data.extendedData?.shipping_info || {
                localPickup: true,
                delivery: true,
                international: false
              },
              inStock: data.inStock !== false,
              vegan: data.isVegan || data.vegan,
              kosher: data.isKosher || data.kosher,
              organic: data.organic || false,
              kashrut: (data.isKosher || data.kosher) ? 'Kosher Certified' : null,
              glutenFree: data.glutenFree || false,
              price: data.price,
              originalPrice: data.originalPrice,
              category: data.category,
              unit: data.unit || 'piece',
              minimumOrder: data.minimumOrder || 1
            };
            
            setProduct(transformedProduct);
            setLoading(false);
            setTimeout(() => setPageLoaded(true), 100);
            return;
          }
      } catch (error) {
        console.error('Error fetching from API:', error);
      }
      
      // If not found in API or not numeric, check the catalog
      let foundProduct = null;
      let foundVendorInfo = null;
      
      for (const [vendorId, vendorData] of Object.entries(completeProductCatalog)) {
        const found = vendorData.products.find(p => p.id === productId);
        if (found) {
          foundVendorInfo = vendorData;
          const productImage = getProductImage(vendorId, productId);
          const productImages = getProductImages(vendorId, productId);
          
          foundProduct = {
            ...found,
            image: productImage,
            images: productImages,
            rating: found.rating || 4.5,
            reviewCount: found.reviewCount || 127,
            vendor: vendorData.vendorName,
            vendorId: vendorId,
            vendorLogo: getVendorLogo(vendorId),
            longDescription: found.longDescription || found.description,
            specifications: found.specifications || [],
            culturalSignificance: found.culturalSignificance || null,
            shippingInfo: found.shippingInfo || {
              localPickup: true,
              delivery: true,
              international: false
            }
          };
          break;
        }
      }
      
      setProduct(foundProduct);
      setLoading(false);
      setTimeout(() => setPageLoaded(true), 100);

      if (!foundProduct) {
        router.push('/marketplace');
      }
    };

    useEffect(() => {
      fetchProduct();
    }, [productId, router]);

  // State for UI
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showZoom, setShowZoom] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('ILS');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionFrequency, setSubscriptionFrequency] = useState('2-weeks');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Currency conversion rates
  const currencyRates = {
    ILS: 1,
    USD: 0.28,
    EUR: 0.26,
    GBP: 0.22
  };

  const currencySymbols = {
    ILS: '₪',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  // Get related products
  const relatedProducts = product ? (
    product.vendorId && typeof product.vendorId === 'string' 
      ? getProductsByVendor(product.vendorId)
          .filter(p => p.id !== product.id)
          .map(p => {
            const productImage = getProductImage(product.vendorId, p.id);
            return {
              ...p,
              image: productImage,
              rating: p.rating || 4.5,
              reviewCount: p.reviewCount || Math.floor(Math.random() * 200) + 50,
              vendorName: product.vendor
            };
          })
          .slice(0, 3)
      : []
  ) : [];

  // Recently viewed products (mock data)
  const allProducts: any[] = [];
  Object.entries(completeProductCatalog).forEach(([vendorId, vendor]) => {
    vendor.products.forEach(p => {
      const productImage = getProductImage(vendorId, p.id);
      allProducts.push({
        ...p,
        image: productImage,
        vendorId: vendorId
      });
    });
  });
  const recentlyViewed = allProducts.slice(0, 6);

  if (loading) {
    return (
      <Layout>
        {isMobile ? (
          // Mobile Skeleton Loading
          <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
            {/* Mobile Header Skeleton */}
            <div className="bg-white shadow-sm sticky top-0 z-30">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Image Gallery Skeleton */}
            <div className="bg-white">
              <div className="h-[350px] bg-gray-200 animate-pulse"></div>
              <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-200 rounded-md animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="bg-white p-4 mb-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>

            {/* Fixed Bottom Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-30 p-4">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ) : (
          // Desktop Loading Spinner
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#478c0b] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading product...</p>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#478c0b] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      vendorId: product.vendorId,
      vendorName: product.vendor
    });
    
    setAddedToCart(true);
    
    // Mobile-specific animations and feedback
    if (isMobile) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 100]);
      }
      
      // Visual cart animation
      const cartButton = document.querySelector('[data-cart-button]');
      if (cartButton) {
        cartButton.classList.add('animate-bounce');
        setTimeout(() => {
          cartButton.classList.remove('animate-bounce');
        }, 1000);
      }
      
      // Show floating success message
      const event = new CustomEvent('show-toast', {
        detail: { 
          message: `${quantity} ${product.name} added to cart!`, 
          type: 'success',
          duration: 3000
        }
      });
      window.dispatchEvent(event);
    }
    
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const currentPrice = product.price * currencyRates[selectedCurrency as keyof typeof currencyRates];
  const originalPrice = product.originalPrice ? product.originalPrice * currencyRates[selectedCurrency as keyof typeof currencyRates] : null;
  const discountPercentage = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  // Calculate bulk pricing
  const bulkDiscount = quantity >= 12 ? 0.15 : quantity >= 6 ? 0.10 : 0;
  const subscriptionDiscount = isSubscribed ? 0.05 : 0;
  const finalPrice = currentPrice * quantity * (1 - bulkDiscount) * (1 - subscriptionDiscount);

  return (
    <Layout>
      <div
        style={{ backgroundColor: '#fef9ef' }}
        dir={isRTL ? 'rtl' : 'ltr'}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull to Refresh Indicator */}
        {isMobile && (
          <div 
            className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 pointer-events-none ${
              pullDistance > 0 ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              transform: `translateY(${Math.min(pullDistance, 80)}px)`,
              height: '80px'
            }}
          >
            <div className="bg-white rounded-full shadow-lg p-3 mt-4 flex items-center gap-3">
              <div 
                className={`w-8 h-8 rounded-full border-3 border-[#478c0b] border-t-transparent animate-spin ${
                  isRefreshing ? 'opacity-100' : 'opacity-70'
                }`}
                style={{
                  animationDuration: isRefreshing ? '1s' : '2s',
                  transform: `rotate(${pullDistance * 3}deg)`
                }}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {isRefreshing 
                  ? 'Refreshing...' 
                  : pullDistance > 100 
                    ? 'Release to refresh' 
                    : 'Pull to refresh'
                }
              </span>
            </div>
          </div>
        )}

        {/* Mobile Header - Enhanced */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-sm sticky top-0 z-30"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <Link href="/marketplace" className="p-2">
                <ArrowLeft className="w-5 h-5 text-gray-600 stroke-[1.5]" />
              </Link>
              <h1 className="text-lg font-semibold truncate flex-1 mx-3" style={{ color: '#3a3a1d' }}>
                {product.name}
              </h1>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 cursor-pointer"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: product.description,
                      url: window.location.href
                    });
                  }
                }}
              >
                <Share2 className="w-5 h-5 text-gray-600 stroke-[1.5]" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Desktop Breadcrumb */}
        {!isMobile && (
          <div className="container mx-auto px-4 py-4">
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-[#478c0b]">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/marketplace" className="hover:text-[#478c0b]">Marketplace</Link>
              <span className="mx-2">/</span>
              <Link href={`/store/${product.vendorId}`} className="hover:text-[#478c0b]">{product.vendor}</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800">{product.name}</span>
            </nav>
          </div>
        )}

        <div className={`${isMobile ? '' : 'container mx-auto px-4'} pb-8`}>
          <div className={`${isMobile ? '' : 'grid lg:grid-cols-3 gap-8'}`}>
            {/* Main Content */}
            <div className={`${isMobile ? '' : 'lg:col-span-2'}`}>
              {/* Product Images - Mobile Optimized */}
              <div className={`bg-white ${isMobile ? '' : 'rounded-xl'} shadow-lg overflow-hidden mb-6`}>
                <div className="relative">
                  <div 
                    className={`relative ${isMobile ? 'h-[350px]' : 'h-[400px]'} overflow-hidden`}
                    onTouchStart={(e) => {
                      if (isMobile && product.images.length > 1) {
                        const touch = e.touches[0];
                        const startX = touch.clientX;
                        const startTime = Date.now();
                        
                        const handleTouchMove = (moveEvent: TouchEvent) => {
                          const moveTouch = moveEvent.touches[0];
                          const currentDiff = startX - moveTouch.clientX;
                          
                          // Visual feedback during swipe
                          const container = e.currentTarget as HTMLDivElement;
                          const maxTranslate = 30;
                          const translateX = Math.max(-maxTranslate, Math.min(maxTranslate, -currentDiff * 0.3));
                          container.style.transform = `translateX(${translateX}px)`;
                          container.style.transition = 'none';
                        };
                        
                        const handleTouchEnd = (endEvent: TouchEvent) => {
                          const endTouch = endEvent.changedTouches[0];
                          const endX = endTouch.clientX;
                          const diff = startX - endX;
                          const timeElapsed = Date.now() - startTime;
                          const velocity = Math.abs(diff) / timeElapsed;
                          
                          // Reset transform
                          const container = e.currentTarget as HTMLDivElement;
                          container.style.transform = 'translateX(0)';
                          container.style.transition = 'transform 0.3s ease-out';
                          
                          // Swipe detection with velocity consideration
                          if (Math.abs(diff) > 30 || velocity > 0.3) {
                            if (diff > 0 && selectedImage < product.images.length - 1) {
                              setSelectedImage(selectedImage + 1);
                              // Haptic feedback for successful swipe
                              if ('vibrate' in navigator) {
                                navigator.vibrate(20);
                              }
                            } else if (diff < 0 && selectedImage > 0) {
                              setSelectedImage(selectedImage - 1);
                              // Haptic feedback for successful swipe
                              if ('vibrate' in navigator) {
                                navigator.vibrate(20);
                              }
                            }
                          }
                          
                          document.removeEventListener('touchmove', handleTouchMove);
                          document.removeEventListener('touchend', handleTouchEnd);
                        };
                        
                        document.addEventListener('touchmove', handleTouchMove);
                        document.addEventListener('touchend', handleTouchEnd);
                      }
                    }}
                  >
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name ? `${product.name} - Image ${selectedImage + 1}` : "Image"}
                      fill
                      className="object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                      onClick={() => !isMobile && setShowZoom(true)}
                      priority
                    />
                    {/* Mobile Swipe Hint */}
                    {isMobile && product.images.length > 1 && (
                      <>
                        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                          <div className={`w-8 h-8 bg-black/30 rounded-full flex items-center justify-center transition-opacity ${
                            selectedImage === 0 ? 'opacity-0' : 'opacity-100'
                          }`}>
                            <ChevronLeft className="w-4 h-4 text-white stroke-[1.5]" />
                          </div>
                        </div>
                        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                          <div className={`w-8 h-8 bg-black/30 rounded-full flex items-center justify-center transition-opacity ${
                            selectedImage === product.images.length - 1 ? 'opacity-0' : 'opacity-100'
                          }`}>
                            <ChevronRight className="w-4 h-4 text-white stroke-[1.5]" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {product.images.map((_: string, idx: number) => (
                            <button
                              key={idx}
                              className={`w-2 h-2 rounded-full transition-all ${
                                selectedImage === idx 
                                  ? 'bg-white w-6' 
                                  : 'bg-white/60'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(idx);
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div className={`grid grid-cols-${isMobile ? '5' : '4'} gap-2 p-3 bg-gray-50`}>
                    {product.images.map((image: string, idx: number) => (
                      <div
                        key={idx}
                        className={`relative ${isMobile ? 'h-14' : 'h-16'} cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
                          selectedImage === idx ? 'border-[#478c0b]' : 'border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedImage(idx)}
                      >
                        <Image src={image} alt={product.name ? `${product.name} - view ${idx + 1}` : "Image"} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Information - Mobile Optimized */}
              <div className={`bg-white ${isMobile ? '' : 'rounded-xl'} shadow-lg ${isMobile ? 'p-4' : 'p-6'} mb-6`}>
                {/* Mobile Quick Actions Bar */}
                {isMobile && (
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <button 
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => {
                          setIsWishlisted(!isWishlisted);
                          // Haptic feedback
                          if ('vibrate' in navigator) {
                            navigator.vibrate(30);
                          }
                        }}
                      >
                        <Heart className={`w-6 h-6 stroke-[1.5] ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                      <button 
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: product.name,
                              text: product.description,
                              url: window.location.href
                            });
                            // Haptic feedback
                            if ('vibrate' in navigator) {
                              navigator.vibrate(30);
                            }
                          }
                        }}
                      >
                        <Share2 className="w-6 h-6 stroke-[1.5]" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Eye className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                      <span className="text-gray-500">234 views</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold mb-2`} style={{ color: '#3a3a1d' }}>{product.name}</h1>
                    <p className={`text-gray-600 mb-3 ${isMobile ? 'text-sm leading-relaxed' : ''}`}>{product.description}</p>
                    <div className={`flex ${isMobile ? 'flex-wrap' : ''} items-center gap-2 mb-4`}>
                      {product.kashrut && (
                        <span className={`bg-[#cfe7c1] text-[#3a3a1d] ${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'} rounded-full font-medium`}>
                          {product.kashrut}
                        </span>
                      )}
                      {product.vegan && (
                        <span className={`bg-[#478c0b] text-white ${isMobile ? 'px-2 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'} rounded-full font-medium`}>
                          Vegan
                        </span>
                      )}
                      {product.organic && (
                        <span className={`bg-[#478c0b] text-white ${isMobile ? 'px-2 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'} rounded-full font-medium`}>
                          Organic
                        </span>
                      )}
                      {product.glutenFree && (
                        <span className={`bg-[#478c0b] text-white ${isMobile ? 'px-2 py-0.5 text-xs' : 'px-2 py-0.5 text-xs'} rounded-full font-medium`}>
                          Gluten Free
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    className={`text-gray-400 hover:text-red-500 ${isMobile ? 'text-lg' : 'text-xl'} transition-colors`}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart className={`w-5 h-5 stroke-[1.5] ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center" style={{ color: '#f6af0d' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-[#f6af0d] text-[#f6af0d]' : 'text-gray-300'} stroke-[1.5]`} />
                    ))}
                    <span className="ml-2 text-gray-600">({product.reviewCount} reviews)</span>
                  </div>
                  <span className="text-green-600 font-semibold">
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{product.longDescription}</p>
                </div>

                {/* Accordion Sections - Mobile Optimized */}
                <div className={`space-y-${isMobile ? '3' : '2'}`}>
                  {/* Ingredients & Nutrition - Mobile Enhanced */}
                  {product.specifications && (
                    <div className={`border border-gray-200 rounded-lg overflow-hidden ${isMobile ? 'shadow-sm' : ''}`}>
                      <button 
                        className={`w-full ${isMobile ? 'px-4 py-4' : 'px-4 py-3'} bg-gray-50 text-left font-semibold flex items-center justify-between hover:bg-gray-100 transition-colors ${isMobile ? 'min-h-[56px] active:bg-gray-200' : ''}`}
                        onClick={() => {
                          toggleAccordion('specs');
                          if (isMobile && 'vibrate' in navigator) {
                            navigator.vibrate(10);
                          }
                        }}
                      >
                        <span className={`${isMobile ? 'text-base' : ''} flex items-center gap-2`}>
                          <ClipboardList className="w-5 h-5 text-[#478c0b] stroke-[1.5]" />
                          Product Specifications
                        </span>
                        <div className={`flex items-center gap-2`}>
                          {isMobile && product.specifications.length > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                              {product.specifications.length} items
                            </span>
                          )}
                          <ChevronDown className={`w-5 h-5 transition-transform stroke-[1.5] ${activeAccordion === 'specs' ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      {activeAccordion === 'specs' && (
                        <div className={`${isMobile ? 'p-4' : 'p-4'} bg-white`}>
                          {isMobile ? (
                            // Mobile Card Layout
                            <div className="space-y-3">
                              {product.specifications.map((spec: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#478c0b]/10 rounded-full flex items-center justify-center">
                                      {spec.label.toLowerCase().includes('weight') ? <Scale className="w-4 h-4 text-[#478c0b] stroke-[1.5]" /> :
                                       spec.label.toLowerCase().includes('serving') ? <Utensils className="w-4 h-4 text-[#478c0b] stroke-[1.5]" /> :
                                       spec.label.toLowerCase().includes('shelf') ? <Calendar className="w-4 h-4 text-[#478c0b] stroke-[1.5]" /> :
                                       spec.label.toLowerCase().includes('ingredient') ? <List className="w-4 h-4 text-[#478c0b] stroke-[1.5]" /> :
                                       <Info className="w-4 h-4 text-[#478c0b] stroke-[1.5]" />}
                                    </div>
                                    <span className="font-medium text-sm text-gray-700">{spec.label}</span>
                                  </div>
                                  <span className="text-sm text-gray-900 font-semibold max-w-[50%] text-right">
                                    {spec.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            // Desktop Grid Layout
                            <div className="grid md:grid-cols-2 gap-4">
                              {product.specifications.map((spec: any, idx: number) => (
                                <div key={idx}>
                                  <span className="font-semibold">{spec.label}:</span>
                                  <span className="ml-2 text-gray-600">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cultural Significance */}
                  {product.culturalSignificance && (
                    <div className={`border border-gray-200 rounded-lg overflow-hidden ${isMobile ? 'shadow-sm' : ''}`}>
                      <button 
                        className={`w-full ${isMobile ? 'px-4 py-4' : 'px-4 py-3'} bg-gray-50 text-left font-semibold flex items-center justify-between hover:bg-gray-100 transition-colors ${isMobile ? 'min-h-[56px]' : ''}`}
                        onClick={() => toggleAccordion('cultural')}
                      >
                        <span className={`${isMobile ? 'text-base' : ''} flex items-center gap-2`}>
                          <Globe className="w-5 h-5 text-[#f6af0d] stroke-[1.5]" />
                          Cultural Significance
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform stroke-[1.5] ${activeAccordion === 'cultural' ? 'rotate-180' : ''}`} />
                      </button>
                      {activeAccordion === 'cultural' && (
                        <div className={`${isMobile ? 'p-4' : 'p-4'} bg-white`}>
                          <p className={`text-gray-700 ${isMobile ? 'text-sm leading-relaxed' : ''}`}>{product.culturalSignificance}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preparation & Storage */}
                  <div className={`border border-gray-200 rounded-lg overflow-hidden ${isMobile ? 'shadow-sm' : ''}`}>
                    <button 
                      className={`w-full ${isMobile ? 'px-4 py-4' : 'px-4 py-3'} bg-gray-50 text-left font-semibold flex items-center justify-between hover:bg-gray-100 transition-colors ${isMobile ? 'min-h-[56px]' : ''}`}
                      onClick={() => toggleAccordion('storage')}
                    >
                      <span className={`${isMobile ? 'text-base' : ''} flex items-center gap-2`}>
                        <Package className="w-5 h-5 text-[#c23c09] stroke-[1.5]" />
                        Storage & Shipping
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform stroke-[1.5] ${activeAccordion === 'storage' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeAccordion === 'storage' && (
                      <div className={`${isMobile ? 'p-4' : 'p-4'} bg-white`}>
                        <div className={`space-y-${isMobile ? '3' : '2'}`}>
                          <div className={`flex justify-between ${isMobile ? 'py-2 border-b border-gray-100' : ''}`}>
                            <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>Unit:</span>
                            <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>{product.unit || 'piece'}</span>
                          </div>
                          <div className={`flex justify-between ${isMobile ? 'py-2 border-b border-gray-100' : ''}`}>
                            <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>Minimum Order:</span>
                            <span className={`text-gray-600 ${isMobile ? 'text-sm' : ''}`}>{product.minimumOrder || 1}</span>
                          </div>
                          {product.shippingInfo && (
                            <>
                              <div className={`flex justify-between items-center ${isMobile ? 'py-2 border-b border-gray-100' : ''}`}>
                                <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>Local Pickup:</span>
                                <span className={`${isMobile ? 'text-sm' : ''}`}>
                                  {product.shippingInfo.localPickup ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="w-4 h-4 stroke-[1.5]" /> Available
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 flex items-center gap-1">
                                      <XCircle className="w-4 h-4 stroke-[1.5]" /> Not available
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className={`flex justify-between items-center ${isMobile ? 'py-2 border-b border-gray-100' : ''}`}>
                                <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>Delivery:</span>
                                <span className={`${isMobile ? 'text-sm' : ''}`}>
                                  {product.shippingInfo.delivery ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="w-4 h-4 stroke-[1.5]" /> Available
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 flex items-center gap-1">
                                      <XCircle className="w-4 h-4 stroke-[1.5]" /> Not available
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className={`flex justify-between items-center ${isMobile ? 'py-2' : ''}`}>
                                <span className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>International:</span>
                                <span className={`${isMobile ? 'text-sm' : ''}`}>
                                  {product.shippingInfo.international ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="w-4 h-4 stroke-[1.5]" /> Available
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 flex items-center gap-1">
                                      <XCircle className="w-4 h-4 stroke-[1.5]" /> Not available
                                    </span>
                                  )}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vendor Information - Mobile Optimized */}
              <div className={`bg-white ${isMobile ? '' : 'rounded-xl'} shadow-lg ${isMobile ? 'p-4' : 'p-6'} mb-6`}>
                {isMobile ? (
                  // Mobile-Enhanced Vendor Section
                  <div className="space-y-3">
                    {/* Vendor Header with Trust Indicators */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#478c0b] ring-offset-2">
                          <Image src={product.vendorLogo} alt={product.vendor || "Image"} fill className="object-cover" />
                          {/* Verified Badge */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#478c0b] rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white stroke-[2]" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{product.vendor}</h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className="flex" style={{ color: '#f6af0d' }}>
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-[#f6af0d] text-[#f6af0d] stroke-[1.5]" />
                                ))}
                              </div>
                              <span className="text-xs text-gray-600 font-medium">(4.9)</span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600">243 Reviews</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/store/${product.vendorId}`}>
                        <button 
                          className="w-10 h-10 bg-[#478c0b] text-white rounded-full flex items-center justify-center active:scale-95 transition-transform"
                          onClick={(e) => {
                            // Haptic feedback
                            if ('vibrate' in navigator) {
                              navigator.vibrate(30);
                            }
                          }}
                        >
                          <Store className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </Link>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-[#478c0b]">127</div>
                        <div className="text-xs text-gray-600">Products</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-[#f6af0d]">2.5k</div>
                        <div className="text-xs text-gray-600">Sales</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-[#c23c09]">98%</div>
                        <div className="text-xs text-gray-600">Happy</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-lg active:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          // Haptic feedback
                          if ('vibrate' in navigator) {
                            navigator.vibrate(30);
                          }
                          // Open phone dialer
                          window.location.href = 'tel:+972501234567';
                        }}
                      >
                        <Phone className="w-5 h-5 text-[#478c0b] stroke-[1.5]" />
                        <span className="text-xs font-medium text-gray-700">Call</span>
                      </button>
                      
                      <button 
                        className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-lg active:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          // Haptic feedback
                          if ('vibrate' in navigator) {
                            navigator.vibrate(30);
                          }
                          // Open WhatsApp
                          window.open('https://wa.me/972501234567?text=Hi, I\'m interested in your products on KiFar Marketplace', '_blank');
                        }}
                      >
                        <MessageCircle className="w-5 h-5 text-[#25d366] stroke-[1.5]" />
                        <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                      </button>
                      
                      <button 
                        className="flex flex-col items-center gap-1 p-3 bg-white border border-gray-200 rounded-lg active:bg-gray-50 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          // Haptic feedback
                          if ('vibrate' in navigator) {
                            navigator.vibrate(30);
                          }
                          // Show toast for email
                          const event = new CustomEvent('show-toast', {
                            detail: { 
                              message: 'Email copied: vendor@vop.com', 
                              type: 'success',
                              duration: 2000
                            }
                          });
                          window.dispatchEvent(event);
                          navigator.clipboard.writeText('vendor@vop.com');
                        }}
                      >
                        <Mail className="w-5 h-5 text-[#f6af0d] stroke-[1.5]" />
                        <span className="text-xs font-medium text-gray-700">Email</span>
                      </button>
                    </div>

                    {/* Response Time & Delivery Info */}
                    <div className="bg-[#cfe7c1]/20 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#478c0b] stroke-[1.5]" />
                          <span className="text-xs text-gray-700">Usually responds within 2 hours</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#478c0b] stroke-[1.5]" />
                          <span className="text-xs text-gray-700">Free delivery on orders over ₪50</span>
                        </div>
                      </div>
                    </div>

                    {/* Vendor Tagline */}
                    <p className="text-xs text-gray-600 italic text-center">
                      "Quality products from the Village of Peace community"
                    </p>
                  </div>
                ) : (
                  // Desktop Vendor Section (unchanged)
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#478c0b]">
                        <Image src={product.vendorLogo} alt={product.vendor || "Image"} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{product.vendor}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex" style={{ color: '#f6af0d' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-[#f6af0d] text-[#f6af0d] stroke-[1.5]" />
                            ))}
                          </div>
                          <span className="text-gray-600 text-sm">(4.9 avg)</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Quality products from the Village of Peace community, bringing you authentic vegan alternatives and traditional foods.
                    </p>
                    <div className="flex gap-3">
                      <Link href={`/store/${product.vendorId}`}>
                        <button className="px-4 py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-colors text-sm font-semibold">
                          <Store className="w-4 h-4 mr-2 stroke-[1.5]" />Visit Store
                        </button>
                      </Link>
                      <button className="px-4 py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-colors text-sm font-semibold">
                        <Phone className="w-4 h-4 mr-2 stroke-[1.5]" />Contact
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Reviews Section - Mobile Enhanced */}
              {isMobile ? (
                <div className="bg-white py-6">
                  <div className="px-4">
                    {/* Reviews Header with Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold" style={{ color: '#3a3a1d' }}>Customer Reviews</h3>
                      <button 
                        className="text-sm text-[#478c0b] font-medium flex items-center gap-1"
                        onClick={() => {
                          // Scroll to review form
                          document.getElementById('write-review-mobile')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Pencil className="w-3 h-3 stroke-[1.5]" />
                        Write Review
                      </button>
                    </div>

                    {/* Rating Summary Card */}
                    <div className="bg-[#cfe7c1]/20 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold" style={{ color: '#478c0b' }}>{product.rating || 4.8}</div>
                          <div className="flex justify-center my-1" style={{ color: '#f6af0d' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 4.8) ? 'fill-[#f6af0d] text-[#f6af0d]' : 'text-gray-300'} stroke-[1.5]`} />
                            ))}
                          </div>
                          <div className="text-xs text-gray-600">{product.reviewCount || 243} Reviews</div>
                        </div>
                        
                        {/* Rating Distribution */}
                        <div className="flex-1">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const percentage = stars === 5 ? 75 : stars === 4 ? 15 : stars === 3 ? 7 : stars === 2 ? 2 : 1;
                            return (
                              <div key={stars} className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-600 w-3">{stars}</span>
                                <Star className="w-3 h-3 fill-[#f6af0d] text-[#f6af0d] stroke-[1.5]" />
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${percentage}%`,
                                      backgroundColor: stars >= 4 ? '#478c0b' : stars === 3 ? '#f6af0d' : '#c23c09'
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600 w-8">{percentage}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Review Filters - Horizontal Scroll */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4 -mx-4 px-4">
                      {['All', 'With Photos', 'Verified', '5 Stars', '4 Stars', 'Critical'].map((filter) => (
                        <button
                          key={filter}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 active:bg-gray-50"
                          style={{ 
                            borderColor: filter === 'All' ? '#478c0b' : '#e5e7eb',
                            color: filter === 'All' ? '#478c0b' : '#6b7280',
                            backgroundColor: filter === 'All' ? '#cfe7c1/20' : 'white'
                          }}
                        >
                          {filter === 'With Photos' && <Camera className="w-3 h-3 mr-1 stroke-[1.5]" />}
                          {filter === 'Verified' && <CheckCircle className="w-3 h-3 mr-1 stroke-[1.5]" />}
                          {filter}
                        </button>
                      ))}
                    </div>

                    {/* Mobile Review Cards */}
                    <div className="space-y-3">
                      {/* Sample Review 1 */}
                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#478c0b]/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold" style={{ color: '#478c0b' }}>SR</span>
                            </div>
                            <div>
                              <div className="font-semibold text-sm" style={{ color: '#3a3a1d' }}>Sarah R.</div>
                              <div className="flex items-center gap-2">
                                <div className="flex" style={{ color: '#f6af0d' }}>
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-[#f6af0d] text-[#f6af0d] stroke-[1.5]" />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">2 days ago</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-[#478c0b] stroke-[1.5]" />
                            <span className="text-xs text-gray-600">Verified</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          Absolutely love this product! The quality is outstanding and it arrived fresh. 
                          Will definitely be ordering again. The vegan certification is a huge plus for our family.
                        </p>
                        
                        {/* Review Photos */}
                        <div className="flex gap-2 mb-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image src={product.image} alt="Review photo" fill className="object-cover" />
                          </div>
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image src={product.images?.[1] || product.image} alt="Review photo" fill className="object-cover" />
                          </div>
                        </div>
                        
                        {/* Helpful Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#478c0b]">
                              <ThumbsUp className="w-4 h-4 stroke-[1.5]" />
                              <span>Helpful (12)</span>
                            </button>
                            <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#c23c09]">
                              <ThumbsDown className="w-4 h-4 stroke-[1.5]" />
                              <span>Not Helpful</span>
                            </button>
                          </div>
                          <button className="text-xs text-gray-500">
                            <Flag className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Sample Review 2 */}
                      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#f6af0d]/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold" style={{ color: '#f6af0d' }}>DL</span>
                            </div>
                            <div>
                              <div className="font-semibold text-sm" style={{ color: '#3a3a1d' }}>David L.</div>
                              <div className="flex items-center gap-2">
                                <div className="flex" style={{ color: '#f6af0d' }}>
                                  {[...Array(4)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-[#f6af0d] text-[#f6af0d] stroke-[1.5]" />
                                  ))}
                                  <Star className="w-3 h-3 text-gray-300 stroke-[1.5]" />
                                </div>
                                <span className="text-xs text-gray-500">1 week ago</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-[#478c0b] stroke-[1.5]" />
                            <span className="text-xs text-gray-600">Verified</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          Great taste and texture. Only giving 4 stars because the packaging could be improved. 
                          The product itself is excellent though!
                        </p>
                        
                        {/* Vendor Response */}
                        <div className="bg-[#cfe7c1]/10 rounded-lg p-3 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="relative w-6 h-6 rounded-full overflow-hidden">
                              <Image src={product.vendorLogo} alt={product.vendor || "Vendor"} fill className="object-cover" />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: '#478c0b' }}>{product.vendor} Response</span>
                          </div>
                          <p className="text-xs text-gray-700">
                            Thank you for your feedback! We're working on eco-friendly packaging improvements. 
                            Stay tuned for updates!
                          </p>
                        </div>
                        
                        {/* Helpful Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                          <div className="flex items-center gap-3">
                            <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#478c0b]">
                              <ThumbsUp className="w-4 h-4 stroke-[1.5]" />
                              <span>Helpful (8)</span>
                            </button>
                            <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#c23c09]">
                              <ThumbsDown className="w-4 h-4 stroke-[1.5]" />
                              <span>Not Helpful</span>
                            </button>
                          </div>
                          <button className="text-xs text-gray-500">
                            <Flag className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>

                      {/* Load More Reviews */}
                      <button className="w-full py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Load More Reviews
                      </button>
                    </div>

                    {/* Write Review Section */}
                    <div id="write-review-mobile" className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-base font-bold mb-4" style={{ color: '#3a3a1d' }}>Write a Review</h4>
                      
                      {/* Quick Rating */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Your Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              className="text-2xl"
                              style={{ color: star <= 4 ? '#f6af0d' : '#e5e7eb' }}
                            >
                              <Star className={`w-5 h-5 ${star <= 4 ? 'fill-[#f6af0d] text-[#f6af0d]' : 'text-gray-300'} stroke-[1.5]`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Title */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Review Title</label>
                        <input
                          type="text"
                          placeholder="Sum up your experience"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#478c0b]"
                        />
                      </div>

                      {/* Review Text */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Your Review</label>
                        <textarea
                          placeholder="Tell us what you liked or disliked"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#478c0b] resize-none"
                        />
                      </div>

                      {/* Photo Upload */}
                      <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Add Photos (Optional)</label>
                        <button className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#478c0b] hover:text-[#478c0b] transition-colors">
                          <Camera className="w-4 h-4 mr-2 stroke-[1.5]" />
                          Upload Photos
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button className="w-full py-3 bg-[#478c0b] text-white rounded-lg font-semibold hover:bg-[#3a6d08] transition-colors">
                        Submit Review
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Desktop Reviews Component
                <ProductReviews 
                  productId={product.id} 
                  productName={product.name}
                  averageRating={product.rating}
                  totalReviews={product.reviewCount}
                />
              )}

              {/* Q&A Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold" style={{ color: '#3a3a1d' }}>Questions & Answers</h3>
                  <button className="px-4 py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-colors text-sm font-semibold">
                    Ask Question
                  </button>
                </div>

                <div className="space-y-4">
                  {product.glutenFree !== undefined && (
                    <div className="border-l-4 border-[#478c0b] pl-4">
                      <div className="font-semibold mb-1">Q: Is this product gluten-free?</div>
                      <div className="text-gray-700 mb-2">
                        A: {product.glutenFree ? 'Yes, this product is certified gluten-free.' : 'No, this product contains gluten.'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Answered by {product.vendor} • 3 days ago
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Floating toggle button when sidebar is closed */}
              {!showSidebar && (
                <div className="fixed right-4 top-24 z-40">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="group relative"
                    title="Show purchase options"
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#478c0b] via-[#f6af0d] to-[#478c0b] rounded-full opacity-75 blur animate-pulse"></div>
                    <div className="relative w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center transform transition-all group-hover:scale-110">
                      <ShoppingCart className="w-6 h-6 text-[#478c0b] stroke-[1.5]" />
                    </div>
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#3a3a1d] text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                      Quick Buy
                    </span>
                  </button>
                </div>
              )}
              
              {/* Enhanced Floating Card Panel */}
              <div className={`sticky top-4 transition-all duration-500 ${showSidebar ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#478c0b]/20 via-[#f6af0d]/20 to-[#c23c09]/20 rounded-2xl blur-xl opacity-50"></div>
                
                {/* Main card */}
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header with gradient */}
                  <div className="relative bg-gradient-to-r from-[#478c0b] to-[#f6af0d] p-4 text-white">
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all flex items-center justify-center group"
                      title="Hide panel"
                    >
                      <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform stroke-[1.5]" />
                    </button>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <ShoppingBasket className="w-5 h-5 stroke-[1.5]" />
                      Quick Purchase
                    </h3>
                    <p className="text-sm opacity-90">Secure checkout available</p>
                  </div>
                  
                  {/* Content with padding */}
                  <div className="p-6">
                {/* Price & Purchase */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-bold" style={{ 
                      background: 'linear-gradient(135deg, #478c0b, #f6af0d)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {currencySymbols[selectedCurrency as keyof typeof currencySymbols]}{currentPrice.toFixed(2)}
                    </span>
                    {originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        {currencySymbols[selectedCurrency as keyof typeof currencySymbols]}{originalPrice.toFixed(2)}
                      </span>
                    )}
                    {discountPercentage > 0 && (
                      <span className="bg-[#c23c09] text-white px-2 py-1 rounded text-sm font-bold">
                        -{discountPercentage}%
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <select 
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                    >
                      <option value="ILS">₪ ILS</option>
                      <option value="USD">$ USD</option>
                      <option value="EUR">€ EUR</option>
                      <option value="GBP">£ GBP</option>
                    </select>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="text-green-800 font-semibold text-sm mb-1">
                      <Truck className="w-4 h-4 mr-2 stroke-[1.5]" />Free Local Delivery
                    </div>
                    <div className="text-green-700 text-sm">
                      Orders over ₪50 within Dimona area
                    </div>
                  </div>

                  {/* Quantity & Options */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Quantity:</label>
                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden mb-3">
                      <button 
                        className="px-3 py-2 bg-gray-100 hover:bg-[#cfe7c1] transition-colors font-semibold"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        className="w-16 px-3 py-2 text-center border-none outline-none"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                      <button 
                        className="px-3 py-2 bg-gray-100 hover:bg-[#cfe7c1] transition-colors font-semibold"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Bulk pricing: 6+ items - 10% off</div>
                      <div>Case of 12 - 15% off</div>
                    </div>
                  </div>

                  {/* Subscription Option */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={isSubscribed}
                        onChange={(e) => setIsSubscribed(e.target.checked)}
                      />
                      <span className="text-sm">Subscribe & Save 5%</span>
                    </label>
                    {isSubscribed && (
                      <select className="mt-2 w-full border rounded px-3 py-2 text-sm">
                        <option value="2-weeks">Delivery every 2 weeks</option>
                        <option value="month">Delivery every month</option>
                        <option value="2-months">Delivery every 2 months</option>
                      </select>
                    )}
                  </div>

                  {/* Total Price */}
                  {(bulkDiscount > 0 || subscriptionDiscount > 0) && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{currencySymbols[selectedCurrency as keyof typeof currencySymbols]}{(currentPrice * quantity).toFixed(2)}</span>
                        </div>
                        {bulkDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Bulk discount:</span>
                            <span>-{(bulkDiscount * 100).toFixed(0)}%</span>
                          </div>
                        )}
                        {subscriptionDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Subscription discount:</span>
                            <span>-5%</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total:</span>
                          <span>{currencySymbols[selectedCurrency as keyof typeof currencySymbols]}{finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 bg-[#478c0b] text-white rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                    >
                      {addedToCart ? (
                        <>
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <Check className="w-5 h-5 stroke-[2]" />
                          </motion.span>
                          {language === 'he' ? 'נוסף לסל!' : 'Added to Cart!'}
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
                          {language === 'he' ? 'הוסף לסל' : 'Add to Cart'}
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg font-semibold hover:bg-[#478c0b] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Globe className="w-4 h-4 stroke-[1.5]" />
                      {language === 'he' ? 'קנייה מהירה עם QR' : 'Quick Buy with QR'}
                    </motion.button>
                    <div className="grid grid-cols-2 gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg text-sm font-semibold hover:bg-[#478c0b] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Heart className="w-4 h-4 stroke-[1.5]" />
                        {language === 'he' ? 'מועדפים' : 'Wishlist'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="py-2 border-2 border-[#478c0b] text-[#478c0b] rounded-lg text-sm font-semibold hover:bg-[#478c0b] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: product.name,
                              text: product.description,
                              url: window.location.href
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Link copied to clipboard!');
                          }
                        }}
                      >
                        <Share2 className="w-4 h-4 stroke-[1.5]" />
                        {language === 'he' ? 'שתף' : 'Share'}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="border-t pt-4 mb-6">
                  <h4 className="font-semibold mb-3">Shipping Options:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Local Pickup (VOP)</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimona Delivery</span>
                      <span>₪5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Israel Post</span>
                      <span>₪15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>International</span>
                      <span>₪45</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="border-t pt-4"
                >
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center cursor-default"
                    >
                      <Award className="w-5 h-5 text-[#478c0b] mb-1 stroke-[1.5]" />
                      <span>{language === 'he' ? 'תשלום מאובטח' : 'Secure Payment'}</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center cursor-default"
                    >
                      <Package className="w-5 h-5 text-[#478c0b] mb-1 stroke-[1.5]" />
                      <span>{language === 'he' ? 'החזרות קלות' : 'Easy Returns'}</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center cursor-default"
                    >
                      <Leaf className="w-5 h-5 text-[#478c0b] mb-1 stroke-[1.5]" />
                      <span>{language === 'he' ? '100% טבעוני' : '100% Vegan'}</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex flex-col items-center cursor-default"
                    >
                      <Star className="w-5 h-5 text-[#478c0b] mb-1 stroke-[1.5]" />
                      <span>{language === 'he' ? 'כשרות מאושרת' : 'Kosher Certified'}</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* QR Code Section */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-3 text-center">Quick Access QR Code</h4>
                  <div className="flex justify-center">
                    <SmartQRCompactFixed
                      type="product"
                      data={{
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        vendorId: product.vendorId,
                        vendorName: product.vendor,
                        category: product.category,
                        description: product.description
                      }}
                      size={180}
                      hideActions={true}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Scan to view on mobile
                  </p>
                </div>
                  </div>
                </div>
              </div>

              {/* Show suggestions button when hidden */}
              {relatedProducts.length > 0 && showSidebar && !showSuggestions && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowSuggestions(true)}
                    className="w-full py-3 bg-gradient-to-r from-[#cfe7c1] to-[#f6af0d]/30 hover:from-[#cfe7c1]/80 hover:to-[#f6af0d]/40 rounded-xl transition-all flex items-center justify-center gap-2 group"
                  >
                    <Sparkles className="w-5 h-5 text-[#f6af0d] group-hover:rotate-12 transition-transform stroke-[1.5]" />
                    <span className="font-semibold text-[#3a3a1d]">Show Suggestions</span>
                  </button>
                </div>
              )}
              
              {/* Related Products - Enhanced Floating Card */}
              {relatedProducts.length > 0 && showSidebar && showSuggestions && (
                <div className="relative mt-6 transition-all duration-500">
                  {/* Subtle glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#478c0b]/10 to-[#f6af0d]/10 rounded-2xl blur-lg opacity-50"></div>
                  
                  {/* Main card */}
                  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header with consistent design */}
                    <div className="bg-gradient-to-r from-[#cfe7c1] to-[#f6af0d]/20 p-4 flex items-center justify-between">
                      <h4 className="text-lg font-bold flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                        <Sparkles className="w-5 h-5 text-[#f6af0d] stroke-[1.5]" />
                        You Might Also Like
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 bg-white/70 px-3 py-1 rounded-full">
                          From {product.vendor}
                        </span>
                        <button
                          onClick={() => setShowSuggestions(false)}
                          className="w-7 h-7 bg-white/70 hover:bg-white rounded-full flex items-center justify-center transition-all group"
                          title="Hide suggestions"
                        >
                          <X className="w-4 h-4 text-gray-600 group-hover:text-[#c23c09] stroke-[1.5]" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 space-y-3">
                    {relatedProducts.map(relProduct => (
                      <Link key={relProduct.id} href={`/product/${relProduct.id}`}>
                        <div className="group hover:bg-gray-50 p-3 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-md cursor-pointer">
                          <div className="flex gap-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={relProduct.image} 
                                alt={relProduct.name || "Image"} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                              {relProduct.originalPrice && (
                                <div className="absolute top-1 right-1 bg-[#c23c09] text-white px-2 py-0.5 rounded text-xs font-bold">
                                  -{Math.round((1 - relProduct.price / relProduct.originalPrice) * 100)}%
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-base mb-1 truncate group-hover:text-[#478c0b] transition-colors">
                                {relProduct.name}
                              </h5>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {relProduct.description}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-xs" style={{ color: '#f6af0d' }}>
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(relProduct.rating) ? 'fill-[#f6af0d] text-[#f6af0d]' : 'text-gray-300'} stroke-[1.5]`} />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">({relProduct.reviewCount || 0})</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                                    ₪{relProduct.price}
                                  </span>
                                  {relProduct.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                      ₪{relProduct.originalPrice}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  {relProduct.vegan && (
                                    <span className="bg-[#cfe7c1] text-[#3a3a1d] px-2 py-0.5 rounded-full text-xs font-medium">
                                      Vegan
                                    </span>
                                  )}
                                  {relProduct.kashrut && (
                                    <span className="bg-[#f6af0d] text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                      Kosher
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button 
                                className="mt-2 w-full py-1.5 text-xs font-semibold text-[#478c0b] border border-[#478c0b] rounded-md hover:bg-[#478c0b] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.preventDefault();
                                  addToCart({
                                    id: relProduct.id,
                                    name: relProduct.name,
                                    price: relProduct.price,
                                    image: relProduct.image,
                                    quantity: 1,
                                    vendorId: product.vendorId,
                                    vendorName: product.vendor
                                  });
                                }}
                              >
                                <ShoppingCart className="w-4 h-4 mr-1 stroke-[1.5]" />
                                Quick Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-gray-50 p-4 border-t">
                      <Link href={`/store/${product.vendorId}`}>
                        <button className="w-full py-2.5 bg-white border border-[#478c0b] text-[#478c0b] rounded-lg hover:bg-[#478c0b] hover:text-white transition-all font-semibold text-sm flex items-center justify-center gap-2">
                          <Store className="w-5 h-5 stroke-[1.5]" />
                          View All {product.vendor} Products
                          <ArrowRight className="w-3 h-3 stroke-[1.5]" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recently Viewed - Mobile Optimized Carousel */}
        <div className={`${isMobile ? '' : 'container mx-auto'} px-4 py-12`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`} style={{ color: '#3a3a1d' }}>Recently Viewed</h3>
            {isMobile && recentlyViewed.length > 3 && (
              <button 
                className="text-sm text-[#478c0b] font-medium flex items-center gap-1"
                onClick={() => router.push('/marketplace')}
              >
                View All
                <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </button>
            )}
          </div>
          
          {isMobile ? (
            // Mobile Horizontal Carousel
            <div className="relative -mx-4">
              <div 
                className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-2"
                style={{ 
                  scrollBehavior: 'smooth',
                  WebkitOverflowScrolling: 'touch',
                  scrollPaddingLeft: '16px',
                  scrollPaddingRight: '16px'
                }}
              >
                {recentlyViewed.map((recentProduct, idx) => (
                  <div 
                    key={recentProduct.id} 
                    className="flex-shrink-0 snap-start"
                    style={{ width: '140px' }}
                  >
                    <Link href={`/product/${recentProduct.id}`}>
                      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all">
                        <div className="relative h-28">
                          <Image 
                            src={recentProduct.image} 
                            alt={recentProduct.name || "Image"} 
                            fill 
                            className="object-cover" 
                          />
                          {/* Quick View Overlay on Long Press */}
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                            <Eye className="w-6 h-6 text-white stroke-[1.5]" />
                          </div>
                        </div>
                        <div className="p-2">
                          <h5 className="font-semibold text-xs mb-1 line-clamp-2" style={{ color: '#3a3a1d' }}>
                            {recentProduct.name}
                          </h5>
                          <div className="flex items-center justify-between">
                            <span className="text-[#478c0b] font-bold text-sm">
                              ₪{recentProduct.price}
                            </span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart({
                                  id: recentProduct.id,
                                  name: recentProduct.name,
                                  price: recentProduct.price,
                                  image: recentProduct.image,
                                  quantity: 1,
                                  vendorId: recentProduct.vendorId,
                                  vendorName: product.vendor
                                });
                                // Haptic feedback
                                if ('vibrate' in navigator) {
                                  navigator.vibrate(30);
                                }
                                // Visual feedback
                                const event = new CustomEvent('show-toast', {
                                  detail: { 
                                    message: `${recentProduct.name} added!`, 
                                    type: 'success',
                                    duration: 2000
                                  }
                                });
                                window.dispatchEvent(event);
                              }}
                              className="w-6 h-6 rounded-full bg-[#478c0b] text-white flex items-center justify-center hover:scale-110 transition-transform"
                            >
                              <Plus className="w-3 h-3 stroke-[1.5]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
                
                {/* View More Card */}
                {recentlyViewed.length > 6 && (
                  <div 
                    className="flex-shrink-0 snap-start"
                    style={{ width: '140px' }}
                  >
                    <Link href="/marketplace">
                      <div className="bg-gradient-to-br from-[#478c0b] to-[#f6af0d] rounded-lg h-full flex flex-col items-center justify-center text-white shadow-md hover:shadow-lg transition-all p-4">
                        <LayoutGrid className="w-8 h-8 mb-2 stroke-[1.5]" />
                        <span className="text-sm font-semibold">View All Products</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Scroll Indicators */}
              <div className="flex justify-center gap-1 mt-3">
                {Array.from({ length: Math.ceil(recentlyViewed.length / 3) }).map((_, idx) => (
                  <div 
                    key={idx}
                    className="w-1.5 h-1.5 rounded-full bg-gray-300 transition-all"
                    style={{
                      backgroundColor: idx === 0 ? '#478c0b' : '#e5e7eb',
                      width: idx === 0 ? '16px' : '6px'
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Desktop Grid View
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentlyViewed.map(recentProduct => (
                <Link key={recentProduct.id} href={`/product/${recentProduct.id}`}>
                  <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-all cursor-pointer group">
                    <div className="relative h-32 overflow-hidden">
                      <Image 
                        src={recentProduct.image} 
                        alt={recentProduct.name || "Image"} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <div className="p-3">
                      <h5 className="font-semibold text-sm mb-1 truncate">{recentProduct.name}</h5>
                      <div className="text-[#478c0b] font-semibold text-sm">₪{recentProduct.price}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Related Products Section - Mobile Optimized */}
        {relatedProducts.length > 0 && (
          <motion.section
            ref={relatedRef}
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 50 }}
            animate={isRelatedInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`${isMobile ? 'bg-gray-50' : 'bg-white'} ${isMobile ? 'py-6' : 'py-12'}`}
          >
            <div className={`${isMobile ? '' : 'container mx-auto'} px-4`}>
              <motion.div
                className="flex items-center justify-between mb-4"
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                animate={isRelatedInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`} style={{ color: '#3a3a1d' }}>
                  {language === 'he' ? `עוד מ${product.vendor}` : `More from ${product.vendor}`}
                </h3>
                {isMobile && (
                  <Link href={`/store/${product.vendorId}`}>
                    <motion.button
                      {...buttonMotionProps}
                      className="text-sm text-[#478c0b] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {language === 'he' ? 'הצג הכל' : 'View All'}
                      <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                    </motion.button>
                  </Link>
                )}
              </motion.div>
              
              {isMobile ? (
                // Mobile Swipeable Carousel
                <div className="relative -mx-4">
                  <div 
                    className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-2"
                    style={{ 
                      scrollBehavior: 'smooth',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {relatedProducts.map((relProduct, index) => (
                      <motion.div
                        key={relProduct.id}
                        initial={shouldReduceMotion ? {} : { opacity: 0, x: 30 }}
                        animate={isRelatedInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                        className="flex-shrink-0 snap-start"
                        style={{ width: '280px' }}
                      >
                        <Link href={`/product/${relProduct.id}`}>
                          <motion.div
                            whileHover={cardHover}
                            transition={cardTransition}
                            className="bg-white rounded-xl shadow-md cursor-pointer">
                            <div className="relative h-48 rounded-t-xl overflow-hidden">
                              <Image 
                                src={relProduct.image} 
                                alt={relProduct.name || "Image"} 
                                fill 
                                className="object-cover" 
                              />
                              {relProduct.badge && (
                                <div className="absolute top-2 left-2 bg-[#c23c09] text-white px-3 py-1 rounded-full text-xs font-semibold">
                                  {relProduct.badge}
                                </div>
                              )}
                              {/* Quick Actions Overlay */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addToCart({
                                      id: relProduct.id,
                                      name: relProduct.name,
                                      price: relProduct.price,
                                      image: relProduct.image,
                                      quantity: 1,
                                      vendorId: product.vendorId,
                                      vendorName: product.vendor
                                    });
                                    // Haptic feedback
                                    if ('vibrate' in navigator) {
                                      navigator.vibrate(30);
                                    }
                                    // Show toast
                                    const event = new CustomEvent('show-toast', {
                                      detail: { 
                                        message: `${relProduct.name} added to cart!`, 
                                        type: 'success',
                                        duration: 2000
                                      }
                                    });
                                    window.dispatchEvent(event);
                                  }}
                                  className="w-full py-2 bg-[#478c0b] text-white rounded-lg font-semibold text-sm"
                                >
                                  <ShoppingCart className="w-4 h-4 mr-2 stroke-[1.5]" />
                                  Quick Add
                                </button>
                              </div>
                            </div>
                            <div className="p-4">
                              <h4 className="font-semibold text-base mb-1 line-clamp-1" style={{ color: '#3a3a1d' }}>
                                {relProduct.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {relProduct.description}
                              </p>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  <div className="flex text-xs" style={{ color: '#f6af0d' }}>
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < Math.floor(relProduct.rating) ? 'fill-[#f6af0d] text-[#f6af0d]' : 'text-gray-300'} stroke-[1.5]`} />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500">({relProduct.reviewCount})</span>
                                </div>
                                {relProduct.vegan && (
                                  <span className="bg-[#478c0b] text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                    Vegan
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                                    ₪{relProduct.price}
                                  </span>
                                  {relProduct.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                      ₪{relProduct.originalPrice}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addToCart({
                                      id: relProduct.id,
                                      name: relProduct.name,
                                      price: relProduct.price,
                                      image: relProduct.image,
                                      quantity: 1,
                                      vendorId: product.vendorId,
                                      vendorName: product.vendor
                                    });
                                    // Haptic feedback
                                    if ('vibrate' in navigator) {
                                      navigator.vibrate(30);
                                    }
                                  }}
                                  className="w-10 h-10 rounded-full bg-[#478c0b] text-white flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                  <Plus className="w-4 h-4 stroke-[1.5]" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}

                    {/* View All Card */}
                    <div 
                      className="flex-shrink-0 snap-start"
                      style={{ width: '280px' }}
                    >
                      <Link href={`/store/${product.vendorId}`}>
                        <div className="bg-gradient-to-br from-[#478c0b] to-[#f6af0d] rounded-xl h-full min-h-[320px] flex flex-col items-center justify-center text-white shadow-md hover:shadow-lg transition-all p-6">
                          <Store className="w-12 h-12 mb-4 stroke-[1.5]" />
                          <h4 className="text-lg font-bold mb-2">Visit {product.vendor}</h4>
                          <p className="text-sm text-center opacity-90 mb-4">
                            Explore our full collection
                          </p>
                          <button className="px-6 py-2 bg-white text-[#478c0b] rounded-full font-semibold text-sm hover:scale-105 transition-transform">
                            Browse All Products
                          </button>
                        </div>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Scroll Hint */}
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5 text-[#478c0b] stroke-[1.5]" />
                  </motion.div>
                </div>
              ) : (
                // Desktop Grid - Animated with stagger
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  variants={listContainer}
                  initial="hidden"
                  animate={isRelatedInView ? "show" : "hidden"}
                >
                  {relatedProducts.slice(0, 4).map((relProduct, index) => (
                    <motion.div
                      key={relProduct.id}
                      variants={listItem}
                      custom={index}
                    >
                      <Link href={`/product/${relProduct.id}`}>
                        <motion.div
                          whileHover={shouldReduceMotion ? {} : cardHover}
                          transition={cardTransition}
                          className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group h-full"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={relProduct.image}
                              alt={relProduct.name || "Image"}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {relProduct.badge && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="absolute top-2 left-2 bg-[#c23c09] text-white px-3 py-1 rounded-full text-xs font-semibold"
                              >
                                {relProduct.badge}
                              </motion.div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-base mb-1 truncate" style={{ color: '#3a3a1d' }}>
                              {relProduct.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {relProduct.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold" style={{ color: '#478c0b' }}>
                                ₪{relProduct.price}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  addToCart({
                                    id: relProduct.id,
                                    name: relProduct.name,
                                    price: relProduct.price,
                                    image: relProduct.image,
                                    quantity: 1,
                                    vendorId: product.vendorId,
                                    vendorName: product.vendor
                                  });
                                }}
                                className="px-4 py-2 bg-[#478c0b] text-white rounded-lg font-semibold text-sm hover:bg-[#3a6d08] transition-colors flex items-center gap-1.5"
                              >
                                <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
                                {language === 'he' ? 'הוסף' : 'Add'}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.section>
        )}

        {/* Zoom Overlay */}
        <AnimatePresence>
          {showZoom && (
            <motion.div
              variants={modalBackdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowZoom(false)}
            >
              <motion.div
                variants={modalContent}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative max-w-4xl max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name || "Image"}
                  width={1200}
                  height={800}
                  className="object-contain"
                />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                  onClick={() => setShowZoom(false)}
                >
                  <X className="w-6 h-6 text-white stroke-[1.5]" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Fixed Bottom Purchase Section - Enhanced */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-30">
            {/* Mini Product Info */}
            <div className="px-4 pt-3 pb-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600">{product.vendor}</span>
                    {product.inStock ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[2]" />
                        {language === 'he' ? 'במלאי' : 'In Stock'}
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                        <X className="w-3 h-3 stroke-[2]" />
                        {language === 'he' ? 'אזל מהמלאי' : 'Out of Stock'}
                      </span>
                    )}
                  </div>
                </div>
                {/* Quantity Selector */}
                <div className="flex items-center gap-2 ml-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#478c0b] transition-colors cursor-pointer"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-3 h-3 stroke-[2]" />
                  </motion.button>
                  <motion.span
                    key={quantity}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="w-8 text-center font-semibold"
                  >
                    {quantity}
                  </motion.span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#478c0b] transition-colors cursor-pointer"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-3 h-3 stroke-[2]" />
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Price and Add to Cart */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                      ₪{(product.price * quantity).toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          ₪{(product.originalPrice * quantity).toFixed(2)}
                        </span>
                        <span className="text-xs text-[#c23c09] font-semibold">
                          Save ₪{((product.originalPrice - product.price) * quantity).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Truck className="w-3 h-3 text-green-600 stroke-[1.5]" />
                    {language === 'he' ? 'משלוח חינם בהזמנות מעל ₪50' : 'Free delivery on orders over ₪50'}
                  </p>
                </div>
                <motion.button
                  whileHover={product.inStock ? { scale: 1.02 } : {}}
                  whileTap={product.inStock ? { scale: 0.98 } : {}}
                  onClick={handleAddToCart}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    product.inStock
                      ? 'bg-[#478c0b] text-white hover:bg-[#3a6d08]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!product.inStock}
                >
                  {addedToCart ? (
                    <>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Check className="w-5 h-5 stroke-[2]" />
                      </motion.span>
                      {language === 'he' ? 'נוסף!' : 'Added!'}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
                      {language === 'he' ? 'הוסף לסל' : 'Add to Cart'}
                    </>
                  )}
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-green-600 stroke-[1.5]" />
                  {language === 'he' ? 'תשלום מאובטח' : 'Secure Checkout'}
                </span>
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-blue-600 stroke-[1.5]" />
                  {language === 'he' ? 'החזרות קלות' : 'Easy Returns'}
                </span>
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-green-600 stroke-[1.5]" />
                  {language === 'he' ? '100% טבעוני' : '100% Vegan'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Floating Buttons Stack - Only 2 buttons */}
        {/* Compact Floating Menu for Mobile */}
        {isMobile && (
          <CompactFloatingMenu
            onCartClick={() => setShowMobileCart(true)}
          />
        )}

        {/* Mobile Modals */}
        {showMobileFilters && (
          <MobileFilterSheet 
            isOpen={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
            selectedCategories={[]}
            setSelectedCategories={() => {}}
            selectedVendors={[]}
            setSelectedVendors={() => {}}
            priceRange={[0, 100]}
            setPriceRange={() => {}}
            selectedSpecialFilters={[]}
            setSelectedSpecialFilters={() => {}}
            selectedCertifications={[]}
            setSelectedCertifications={() => {}}
            selectedOrigins={[]}
            setSelectedOrigins={() => {}}
            onApply={() => setShowMobileFilters(false)}
            onReset={() => {}}
          />
        )}

        {showMobileCart && (
          <MobileCartDrawer
            isOpen={showMobileCart}
            onClose={() => setShowMobileCart(false)}
          />
        )}
      </div>
    </Layout>
  );
}