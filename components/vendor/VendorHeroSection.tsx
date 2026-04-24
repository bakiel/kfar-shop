'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ShoppingCart, Truck, CreditCard, Award } from 'lucide-react';
import NewStoreBadge from '@/components/ui/NewStoreBadge';

interface VendorHeroProps {
  vendorData: {
    businessName: string;
    logo: string;
    banner?: string;
    bannerImage?: string;
    description: string;
    rating?: number;
    reviewCount?: number;
    productCount: number;
    estimatedDeliveryTime?: string;
    minimumOrder?: number;
    certifications?: string[];
    createdAt?: string;
  };
  theme: {
    primary: string;
    secondary: string;
  };
}

export default function VendorHeroSection({ vendorData, theme }: VendorHeroProps) {
  // Use banner or bannerImage, whichever is available
  const bannerSrc = vendorData.banner || vendorData.bannerImage || vendorData.logo;
  
  console.log('VendorHeroSection rendering:', {
    vendor: vendorData.businessName,
    logo: vendorData.logo,
    banner: bannerSrc,
    productCount: vendorData.productCount
  });

  return (
    <section 
      className="relative h-[60vh] md:h-[70vh] overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, ${theme.primary}CC, ${theme.secondary}CC)`
      }}
    >
      {/* Banner Background */}
      <div className="absolute inset-0">
        <Image
          src={bannerSrc}
          alt={`${vendorData.businessName} Banner`}
          fill
          className="object-cover opacity-30"
          priority
          onError={(e) => {
            console.error('Banner image error:', bannerSrc);
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        {/* New Store Badge - Banner variant */}
        {vendorData.createdAt && (
          <div className="absolute top-4 left-4 right-4 z-20">
            <NewStoreBadge 
              createdAt={vendorData.createdAt}
              variant="banner"
            />
          </div>
        )}
        
        <div className="max-w-4xl">
          {/* Vendor Logo and Name */}
          <div className="mb-6 flex items-center gap-4">
            <div className="w-20 h-20 md:w-28 md:h-28 relative bg-white rounded-2xl shadow-xl p-2">
              <Image
                src={vendorData.logo}
                alt={`${vendorData.businessName} Logo`}
                fill
                className="object-contain p-2"
                priority
                onError={(e) => {
                  console.error('Logo image error:', vendorData.logo);
                }}
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                {vendorData.businessName}
              </h1>
              {vendorData.rating && (
                <div className="flex items-center gap-2 text-white/90">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{vendorData.rating}</span>
                  <span>({vendorData.reviewCount} reviews)</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            {vendorData.description}
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur rounded-xl p-4">
              <ShoppingCart className="w-6 h-6 text-white mb-2" />
              <p className="text-white font-semibold">{vendorData.productCount}+ Products</p>
            </div>
            {vendorData.estimatedDeliveryTime && (
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <Truck className="w-6 h-6 text-white mb-2" />
                <p className="text-white font-semibold">{vendorData.estimatedDeliveryTime}</p>
              </div>
            )}
            {vendorData.minimumOrder && (
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <CreditCard className="w-6 h-6 text-white mb-2" />
                <p className="text-white font-semibold">Min ₪{vendorData.minimumOrder}</p>
              </div>
            )}
            {vendorData.certifications && vendorData.certifications[0] && (
              <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                <Award className="w-6 h-6 text-white mb-2" />
                <p className="text-white font-semibold">{vendorData.certifications[0]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}