'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import '@/styles/kfar-style-system.css';

export default function TourismPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'he' | 'fr'>('en');

  const tourPackages = {
    heritage: {
      title: {
        en: 'Heritage Walking Tour',
        he: 'סיור מורשת',
        fr: 'Visite du Patrimoine'
      },
      description: {
        en: 'Explore 55 years of Village of Peace history with community elders',
        he: 'גלו 55 שנות היסטוריה של כפר השלום עם זקני הקהילה',
        fr: 'Explorez 55 ans d\'histoire du Village de la Paix'
      },
      duration: '3 hours',
      price: '₪120',
      includes: ['Elder storytelling', 'Historical sites', 'Traditional vegan meal', 'Photo opportunities']
    },
    cooking: {
      title: {
        en: 'Divine Nutrition Workshop',
        he: 'סדנת תזונה אלוהית',
        fr: 'Atelier Nutrition Divine'
      },
      description: {
        en: 'Master traditional vegan recipes from Village of Peace chefs',
        he: 'למדו מתכונים טבעוניים מסורתיים משפי הקהילה',
        fr: 'Maîtrisez les recettes végétaliennes traditionnelles'
      },
      duration: '4 hours',
      price: '₪180',
      includes: ['Hands-on cooking', 'Recipe collection', 'Ingredients to take home', 'Full meal']
    },
    farm: {
      title: {
        en: 'Organic Farm Experience',
        he: 'חוויה בחווה האורגנית',
        fr: 'Expérience Ferme Biologique'
      },
      description: {
        en: 'Work alongside community farmers in sustainable agriculture',
        he: 'עבדו לצד חקלאי הקהילה בחקלאות בת קיימא',
        fr: 'Travaillez aux côtés des agriculteurs communautaires'
      },
      duration: 'Full day',
      price: '₪150',
      includes: ['Farm work', 'Agricultural education', 'Fresh produce basket', 'Farm-to-table lunch']
    },
    spiritual: {
      title: {
        en: 'Spiritual Journey',
        he: 'מסע רוחני',
        fr: 'Voyage Spirituel'
      },
      description: {
        en: 'Experience community spiritual practices and meditation',
        he: 'חוו את המנהגים הרוחניים והמדיטציה של הקהילה',
        fr: 'Vivez les pratiques spirituelles de la communauté'
      },
      duration: 'Half day',
      price: '₪100',
      includes: ['Morning meditation', 'Spiritual teachings', 'Prayer observation', 'Herbal tea ceremony']
    }
  };

  const accommodationOptions = [
    {
      name: 'Community Guesthouse',
      price: '₪200/night',
      features: ['Private room', 'Shared kitchen', 'Community meals', 'WiFi'],
      image: '/images/community/village_of_peace_community_authentic_dimona_israel_17.jpg'
    },
    {
      name: 'Family Homestay',
      price: '₪150/night',
      features: ['Family integration', 'Home-cooked meals', 'Cultural immersion', 'Language practice'],
      image: '/images/community/village_of_peace_community_authentic_dimona_israel_30.jpg'
    },
    {
      name: 'Desert Camping',
      price: '₪80/night',
      features: ['Eco-camping', 'Desert views', 'Campfire gatherings', 'Star gazing'],
      image: '/images/community/village_of_peace_community_authentic_dimona_israel_40.jpg'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-white">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/images/community/village_of_peace_community_authentic_dimona_israel_50.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Visit Village of Peace</h1>
          <p className="text-xl md:text-2xl mb-8">Experience Authentic Kfar Culture in Israel</p>
          
          {/* Language Selector */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveLanguage('en')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                activeLanguage === 'en' 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLanguage('he')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                activeLanguage === 'he' 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              עברית
            </button>
            <button
              onClick={() => setActiveLanguage('fr')}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                activeLanguage === 'fr' 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Français
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold" style={{ color: '#478c0b' }}>20,000+</div>
              <p className="text-gray-600">Annual Visitors</p>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#f6af0d' }}>55</div>
              <p className="text-gray-600">Years of Heritage</p>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#c23c09' }}>100%</div>
              <p className="text-gray-600">Vegan Community</p>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#478c0b' }}>4.9/5</div>
              <p className="text-gray-600">Visitor Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Packages */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#3a3a1d' }}>
            Tour Experiences
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(tourPackages).map(([key, tour]) => (
              <div 
                key={key}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedPackage(key)}
              >
                <div 
                  className="h-48 bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url('/images/community/village_of_peace_community_authentic_dimona_israel_${
                      key === 'heritage' ? '14' : key === 'cooking' ? '18' : key === 'farm' ? '25' : '45'
                    }.jpg')` 
                  }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">
                    {tour.title[activeLanguage]}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {tour.description[activeLanguage]}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold" style={{ color: '#478c0b' }}>
                      {tour.price}
                    </span>
                    <span className="text-sm text-gray-500">{tour.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Programs for Different Audiences */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#3a3a1d' }}>
            Special Programs
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* For African Diaspora */}
            <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"
                   style={{ backgroundColor: '#478c0b' }}>
                <i className="fas fa-globe-africa text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Heritage Connection</h3>
              <p className="text-gray-700 mb-6 text-center">
                Special programs for African diaspora to connect with Village of Peace heritage
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                  <span>10-day immersion programs</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                  <span>Birthright alternative (18-30)</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                  <span>Family roots exploration</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                  <span>Travel support available</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
                      style={{ backgroundColor: '#478c0b' }}>
                Apply Now
              </button>
            </div>

            {/* For Israeli Public */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"
                   style={{ backgroundColor: '#f6af0d' }}>
                <i className="fas fa-star-of-david text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">שכנים ישראלים</h3>
              <p className="text-gray-700 mb-6 text-center" dir="rtl">
                תוכניות מיוחדות לישראלים להכיר את הקהילה
              </p>
              <ul className="space-y-2 mb-6" dir="rtl">
                <li className="flex items-center">
                  <i className="fas fa-check ml-3" style={{ color: '#f6af0d' }}></i>
                  <span>סיורים בעברית</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check ml-3" style={{ color: '#f6af0d' }}></i>
                  <span>סדנאות בישול טבעוני</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check ml-3" style={{ color: '#f6af0d' }}></i>
                  <span>הרצאות על אורח חיים בריא</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check ml-3" style={{ color: '#f6af0d' }}></i>
                  <span>הנחות לקבוצות</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                      style={{ backgroundColor: '#f6af0d', color: '#3a3a1d' }}>
                הזמן סיור
              </button>
            </div>

            {/* For International Visitors */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"
                   style={{ backgroundColor: '#c23c09' }}>
                <i className="fas fa-passport text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-center">Cultural Exchange</h3>
              <p className="text-gray-700 mb-6 text-center">
                Extended programs for deep cultural immersion
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <i className="fas fa-check mr-3" style={{ color: '#c23c09' }}></i>
                  <span>1-4 week programs</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check mr-3" style={{ color: '#c23c09' }}></i>
                  <span>Work-study opportunities</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check mr-3" style={{ color: '#c23c09' }}></i>
                  <span>Hebrew language courses</span>
                </li>
                <li className="flex items-center">
                  <i className="fas fa-check mr-3" style={{ color: '#c23c09' }}></i>
                  <span>Certificate programs</span>
                </li>
              </ul>
              <button className="w-full py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
                      style={{ backgroundColor: '#c23c09' }}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Accommodation */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#3a3a1d' }}>
            Where to Stay
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {accommodationOptions.map((option, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={option.image}
                    alt={option.name || "Image"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{option.name}</h3>
                  <p className="text-2xl font-bold mb-4" style={{ color: '#478c0b' }}>
                    {option.price}
                  </p>
                  <ul className="space-y-2 mb-4">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                          style={{ backgroundColor: '#f6af0d', color: '#3a3a1d' }}>
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visitor Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#3a3a1d' }}>
            Plan Your Visit
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Getting Here */}
            <div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#478c0b' }}>
                Getting Here
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt mt-1 mr-4" style={{ color: '#478c0b' }}></i>
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-gray-600">Village of Peace, Dimona 8600000, Israel</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-plane mt-1 mr-4" style={{ color: '#478c0b' }}></i>
                  <div>
                    <p className="font-semibold">From Ben Gurion Airport</p>
                    <p className="text-gray-600">2 hours by car/bus via Beer Sheva</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-bus mt-1 mr-4" style={{ color: '#478c0b' }}></i>
                  <div>
                    <p className="font-semibold">Public Transport</p>
                    <p className="text-gray-600">Bus from Beer Sheva Central Station</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-car mt-1 mr-4" style={{ color: '#478c0b' }}></i>
                  <div>
                    <p className="font-semibold">By Car</p>
                    <p className="text-gray-600">Route 25 from Beer Sheva (40 min)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Know */}
            <div>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#f6af0d' }}>
                What to Know
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-utensils mt-1 mr-4" style={{ color: '#f6af0d' }}></i>
                  <div>
                    <p className="font-semibold">Dietary</p>
                    <p className="text-gray-600">100% vegan community - no animal products</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-tshirt mt-1 mr-4" style={{ color: '#f6af0d' }}></i>
                  <div>
                    <p className="font-semibold">Dress Code</p>
                    <p className="text-gray-600">Modest clothing recommended</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-calendar mt-1 mr-4" style={{ color: '#f6af0d' }}></i>
                  <div>
                    <p className="font-semibold">Sabbath</p>
                    <p className="text-gray-600">Friday sunset to Saturday sunset</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-sun mt-1 mr-4" style={{ color: '#f6af0d' }}></i>
                  <div>
                    <p className="font-semibold">Best Time</p>
                    <p className="text-gray-600">Spring (Mar-May) & Fall (Sep-Nov)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience Village of Peace?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of visitors who have discovered our unique culture, 
            delicious vegan cuisine, and warm hospitality.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white rounded-full font-semibold hover:shadow-lg transition-all"
                    style={{ color: '#478c0b' }}>
              <i className="fas fa-calendar-check mr-2"></i>
              Book Your Visit
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white rounded-full font-semibold hover:bg-white hover:text-green-800 transition-all">
              <i className="fas fa-phone mr-2"></i>
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Selected Package Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
             onClick={() => setSelectedPackage(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8"
               onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">
              {tourPackages[selectedPackage as keyof typeof tourPackages].title[activeLanguage]}
            </h3>
            <p className="text-gray-600 mb-6">
              {tourPackages[selectedPackage as keyof typeof tourPackages].description[activeLanguage]}
            </p>
            <div className="mb-6">
              <p className="font-semibold mb-2">This experience includes:</p>
              <ul className="space-y-2">
                {tourPackages[selectedPackage as keyof typeof tourPackages].includes.map((item, idx) => (
                  <li key={idx} className="flex items-center">
                    <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-3xl font-bold" style={{ color: '#478c0b' }}>
                {tourPackages[selectedPackage as keyof typeof tourPackages].price}
              </span>
              <span className="text-gray-500">
                {tourPackages[selectedPackage as keyof typeof tourPackages].duration}
              </span>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all"
                      style={{ backgroundColor: '#478c0b' }}>
                Book Now
              </button>
              <button className="flex-1 py-3 rounded-lg font-semibold border-2 hover:shadow-lg transition-all"
                      style={{ borderColor: '#478c0b', color: '#478c0b' }}
                      onClick={() => setSelectedPackage(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}