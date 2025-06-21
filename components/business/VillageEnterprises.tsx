'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Enterprise {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  category: string;
  yearFounded: string;
  specialty: string;
  featured: {
    url: string;
    caption: string;
  }[];
  description: string;
  color: string;
}

const VillageEnterprises = () => {
  const [activeEnterprise, setActiveEnterprise] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const enterprises: Enterprise[] = [
    {
      id: 'teva-deli',
      name: 'Teva Deli',
      logo: '/images/teva-deli/teva_deli_official_logo_master_brand_israeli_vegan_food_company.jpg',
      tagline: 'The Original Vegan Factory',
      category: 'Plant-Based Manufacturing',
      yearFounded: '1983',
      specialty: 'Seitan & Tofu Products',
      featured: [
        {
          url: '/images/teva-deli/teva_deli_vegan_seitan_schnitzel_breaded_cutlet_plant_based_meat_alternative_israeli_comfort_food.jpg',
          caption: 'Classic Seitan Schnitzel'
        },
        {
          url: '/images/teva-deli/teva_deli_vegan_seitan_kubeh_middle_eastern_specialty_plant_based_meat_alternative_israeli_cuisine.jpg',
          caption: 'Traditional Kubeh'
        },
        {
          url: '/images/teva-deli/teva_deli_vegan_specialty_product_01_plant_based_meat_alternative_israeli_cuisine.jpg',
          caption: 'Signature Products'
        }
      ],
      description: 'Pioneering vegan food manufacturing since 1983, bringing plant-based alternatives to Israeli tables nationwide.',
      color: '#478c0b'
    },
    {
      id: 'queens-cuisine',
      name: "Queen's Cuisine",
      logo: '/images/queens-cuisine/queens_cuisine_official_logo_master_brand_plant_based_catering.jpg',
      tagline: 'Art of Vegan Catering',
      category: 'Gourmet Catering & Events',
      yearFounded: '1995',
      specialty: 'Premium Event Catering',
      featured: [
        {
          url: '/images/queens-cuisine/queens_cuisine_vegan_burger_seitan_patty_sesame_bun_tomato_lettuce_plant_based_sandwich.jpg',
          caption: 'Gourmet Vegan Burger'
        },
        {
          url: '/images/queens-cuisine/queens_cuisine_vegan_meatballs_pasta_dish_plant_based_italian_cuisine_tomato_sauce.jpg',
          caption: 'Italian-Style Meatballs'
        },
        {
          url: '/images/queens-cuisine/queens_cuisine_vegan_meat_grilled_seitan_steaks_plant_based_protein_alternative.jpg',
          caption: 'Grilled Seitan Steaks'
        }
      ],
      description: 'Elevating plant-based cuisine to an art form for celebrations, events, and special occasions.',
      color: '#f6af0d'
    },
    {
      id: 'garden-of-light',
      name: 'Garden of Light Vegan Deli',
      logo: '/images/garden-of-light/garden_of_light_official_logo_master_brand_organic_vegan_deli.jpg',
      tagline: 'Premium Vegan Delicacies',
      category: 'Artisan Chocolates & Spreads',
      yearFounded: '2008',
      specialty: 'Handcrafted Confections',
      featured: [
        {
          url: '/images/vendors/stock_image_food_superfood_mix_healthy_ingredients_lifestyle.jpg',
          caption: 'Superfood Chocolates'
        },
        {
          url: '/images/vendors/stock_image_food_smoothie_bowl_healthy_breakfast_lifestyle.jpg',
          caption: 'Breakfast Spreads'
        },
        {
          url: '/images/vendors/stock_image_food_sandwich_wrap_healthy_meal_lifestyle.jpg',
          caption: 'Gourmet Wraps'
        }
      ],
      description: 'Family-made premium vegan chocolates and spreads, continuing Edenic traditions with modern flair.',
      color: '#c23c09'
    },
    {
      id: 'gahn-delight',
      name: 'Gahn Delight',
      logo: '/images/gahn-delight/gahn_delight_official_logo_master_brand_ice_cream.jpg',
      tagline: 'Artisanal Ice Cream Dreams',
      category: 'Frozen Desserts',
      yearFounded: '2012',
      specialty: 'Exotic Vegan Ice Cream',
      featured: [
        {
          url: '/images/gahn-delight/gahn_delight_ice_cream_passion_mango_double_scoop_cup.jpg',
          caption: 'Passion Mango Delight'
        },
        {
          url: '/images/gahn-delight/gahn_delight_ice_cream_chocolate_tahini_swirl_cup_with_cacao_nibs.jpeg',
          caption: 'Chocolate Tahini Swirl'
        },
        {
          url: '/images/gahn-delight/gahn_delight_ice_cream_pistachio_rose_triple_scoop_ceramic_bowl.jpeg',
          caption: 'Pistachio Rose Dream'
        }
      ],
      description: 'Handcrafted vegan ice cream with exotic Middle Eastern flavors and premium ingredients.',
      color: '#478c0b'
    },
    {
      id: 'people-store',
      name: 'People Store',
      logo: '/images/vendors/people_store_logo_community_retail.jpg',
      tagline: 'Your Community Market',
      category: 'International Foods & Bulk',
      yearFounded: '1998',
      specialty: 'Specialty Imports',
      featured: [
        {
          url: '/images/vendors/stock_image_food_roasted_vegetables_healthy_cooking_lifestyle.jpg',
          caption: 'Fresh Produce Daily'
        },
        {
          url: '/images/vendors/stock_image_food_stir_fry_healthy_cooking_lifestyle.jpg',
          caption: 'International Ingredients'
        },
        {
          url: '/images/vendors/stock_image_food_soup_stew_healthy_meal_lifestyle.jpg',
          caption: 'Ready-Made Meals'
        }
      ],
      description: 'Your source for specialty foods, bulk ingredients, and hard-to-find international products.',
      color: '#f6af0d'
    },
    {
      id: 'vop-shop',
      name: 'Village of Peace Shop',
      logo: '/images/vop-shop/vop_shop_official_logo_master_brand_village_of_peace.jpg',
      tagline: 'Heritage & Wellness Hub',
      category: 'Community Products',
      yearFounded: '2005',
      specialty: 'Cultural & Wellness Items',
      featured: [
        {
          url: '/images/vendors/stock_image_food_recipe_showcase_healthy_cooking_lifestyle.jpg',
          caption: '50 Year Heritage Collection'
        },
        {
          url: '/images/vendors/stock_image_food_superfood_mix_healthy_ingredients_lifestyle.jpg',
          caption: 'Wellness Resources'
        },
        {
          url: '/images/vendors/stock_image_food_smoothie_bowl_healthy_breakfast_lifestyle.jpg',
          caption: 'Community Apparel'
        }
      ],
      description: 'Celebrating our heritage with cultural products, wellness resources, and community pride.',
      color: '#c23c09'
    }
  ];

  // Auto-rotate enterprises
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveEnterprise((prev) => (prev + 1) % enterprises.length);
      setImageIndex(0);
    }, 8000);
    return () => clearInterval(timer);
  }, [enterprises.length]);

  // Auto-rotate images within active enterprise
  useEffect(() => {
    const timer = setInterval(() => {
      if (enterprises[activeEnterprise].featured.length > 1) {
        setImageIndex((prev) => (prev + 1) % enterprises[activeEnterprise].featured.length);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [activeEnterprise, enterprises]);

  const handleEnterpriseChange = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveEnterprise(index);
      setImageIndex(0);
      setIsTransitioning(false);
    }, 300);
  };

  const currentEnterprise = enterprises[activeEnterprise];

  return (
    <section id="village-enterprises" className="py-16 sm:py-20 relative overflow-hidden" style={{ backgroundColor: '#fef9ef' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(71, 140, 11, 0.1) 35px, rgba(71, 140, 11, 0.1) 70px)`
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg" style={{ backgroundColor: '#f6af0d' }}>
              <i className="fas fa-star mr-2"></i>
              The Founding Six
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6" style={{ color: '#3a3a1d' }}>
            Village Enterprises
          </h2>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: '#4b5563' }}>
            These pioneering businesses established the foundation of Village of Peace commerce, 
            each carrying decades of heritage and community values into the future.
          </p>
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left Side - Business Info Panel */}
          <div className={`order-2 md:order-1 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {/* Business Header */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                {/* Logo */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={currentEnterprise.logo}
                    alt={currentEnterprise.name || "Image"}
                    fill
                    className="object-cover rounded-full border-4"
                    style={{ borderColor: currentEnterprise.color }}
                  />
                </div>
                
                {/* Business Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#3a3a1d' }}>
                    {currentEnterprise.name}
                  </h3>
                  <p className="font-semibold mb-2 text-sm sm:text-base" style={{ color: currentEnterprise.color }}>
                    {currentEnterprise.tagline}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                    <span>
                      <i className="fas fa-calendar mr-1"></i>
                      Est. {currentEnterprise.yearFounded}
                    </span>
                    <span className="hidden sm:inline">|</span>
                    <span>
                      <i className="fas fa-tag mr-1"></i>
                      {currentEnterprise.category}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed" style={{ color: '#4b5563' }}>
                {currentEnterprise.description}
              </p>
              
              {/* Specialty Badge */}
              <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full mx-auto sm:mx-0" style={{ backgroundColor: `${currentEnterprise.color}20` }}>
                <i className="fas fa-award text-sm" style={{ color: currentEnterprise.color }}></i>
                <span className="font-semibold text-sm sm:text-base" style={{ color: currentEnterprise.color }}>
                  Specialty: {currentEnterprise.specialty}
                </span>
              </div>
            </div>

            {/* Navigation Tabs - Horizontal Scroll on Mobile */}
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 min-w-[320px]">
                {enterprises.slice(0, 3).map((enterprise, index) => (
                  <button
                    key={enterprise.id}
                    onClick={() => handleEnterpriseChange(index)}
                    className={`p-3 sm:p-4 rounded-xl text-center transition-all duration-300 min-h-[60px] ${
                      activeEnterprise === index 
                        ? 'bg-white shadow-lg scale-105' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    style={{
                      borderBottom: activeEnterprise === index ? `3px solid ${enterprise.color}` : 'none'
                    }}
                  >
                    <div className="text-xs sm:text-sm font-semibold line-clamp-2" style={{ color: activeEnterprise === index ? enterprise.color : '#6b7280' }}>
                      {enterprise.name}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 mt-2 sm:mt-3 min-w-[320px]">
                {enterprises.slice(3).map((enterprise, index) => (
                  <button
                    key={enterprise.id}
                    onClick={() => handleEnterpriseChange(index + 3)}
                    className={`p-3 sm:p-4 rounded-xl text-center transition-all duration-300 min-h-[60px] ${
                      activeEnterprise === index + 3 
                        ? 'bg-white shadow-lg scale-105' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    style={{
                      borderBottom: activeEnterprise === index + 3 ? `3px solid ${enterprise.color}` : 'none'
                    }}
                  >
                    <div className="text-xs sm:text-sm font-semibold line-clamp-2" style={{ color: activeEnterprise === index + 3 ? enterprise.color : '#6b7280' }}>
                      {enterprise.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Image Showcase */}
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] order-1 md:order-2">
            {/* Main Image Display */}
            <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl">
              {currentEnterprise.featured.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-1000 ${
                    index === imageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                >
                  <Image
                    src={feature.url}
                    alt={feature.caption || "Image"}
                    fill
                    className="object-cover"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <p className="text-white text-xl font-semibold mb-2">
                      {feature.caption}
                    </p>
                    <p className="text-white/80">
                      {currentEnterprise.name} • {currentEnterprise.category}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Image Navigation Dots */}
              <div className="absolute bottom-8 right-8 flex gap-2">
                {currentEnterprise.featured.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === imageIndex 
                        ? 'w-8 bg-white' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <Link href="/marketplace">
                <button 
                  className="px-8 py-4 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                  style={{ backgroundColor: currentEnterprise.color }}
                >
                  <i className="fas fa-store"></i>
                  Shop {currentEnterprise.name} Products
                  <i className="fas fa-arrow-right"></i>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12 flex justify-center">
          <div className="flex gap-3">
            {enterprises.map((enterprise, index) => (
              <div
                key={enterprise.id}
                className="relative"
              >
                <button
                  onClick={() => handleEnterpriseChange(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    activeEnterprise === index 
                      ? 'scale-125' 
                      : 'hover:scale-110'
                  }`}
                  style={{ 
                    backgroundColor: activeEnterprise === index ? enterprise.color : '#e5e7eb'
                  }}
                />
                {activeEnterprise === index && (
                  <div 
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ backgroundColor: enterprise.color, opacity: 0.3 }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VillageEnterprises;