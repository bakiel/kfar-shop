'use client';

import React from 'react';
import Image from 'next/image';

interface AboutVOPProps {
  audience?: 'community' | 'israeli' | 'international' | 'all';
  compact?: boolean;
}

export default function AboutVOP({ audience = 'all', compact = false }: AboutVOPProps) {
  const content = {
    community: {
      title: 'Our Village of Peace',
      subtitle: 'Building Divine Nation Together',
      description: `Since our exodus from America through Liberia to the Holy Land, we have built a thriving 
        community based on Divine principles. Our 3,100+ saints live by the laws of Yah, maintaining Divine 
        Nutrition, Hebrew culture, and spiritual growth.`,
      focus: 'Community achievements and internal development'
    },
    israeli: {
      title: 'הכירו את כפר השלום',
      subtitle: 'קהילה ייחודית בנגב',
      description: `מזה 55 שנה, הקהילה האפריקאית העברית חיה בדימונה כחלק מהחברה הישראלית. 
        אנו תורמים לכלכלה המקומית, משרתים בצה"ל, ומובילים את תנועת הטבעונות בישראל.`,
      focus: 'Integration and contribution to Israeli society'
    },
    international: {
      title: 'Village of Peace Story',
      subtitle: 'Kfar Community in Israel',
      description: `Discover a unique community that journeyed from Chicago to Israel, establishing a 
        100% vegan society based on biblical principles. Experience our culture, taste our cuisine, 
        and learn about sustainable living.`,
      focus: 'Cultural tourism and educational experiences'
    },
    all: {
      title: 'Village of Peace',
      subtitle: '55 Years of Heritage in the Holy Land',
      description: `Our community, led by Ben Ammi Ben-Israel, established the Village 
        of Peace in Dimona in 1969. Today, our 3,100+ member community lives by Divine principles, 
        pioneering veganism, sustainable living, and cultural preservation in Israel.`,
      focus: 'Comprehensive overview for all audiences'
    }
  };

  const selectedContent = content[audience];

  const milestones = [
    { year: '1967', event: 'Spiritual awakening in Chicago', icon: 'fa-star' },
    { year: '1969', event: 'First families arrive in Israel', icon: 'fa-plane' },
    { year: '1973', event: '100% vegan lifestyle adopted', icon: 'fa-leaf' },
    { year: '1983', event: 'Teva Deli founded', icon: 'fa-store' },
    { year: '2003', event: 'Official Israeli recognition', icon: 'fa-certificate' },
    { year: '2025', event: 'VOP-Market digital launch', icon: 'fa-globe' }
  ];

  if (compact) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
          {selectedContent.title}
        </h3>
        <p className="text-gray-700 mb-6">{selectedContent.description}</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold" style={{ color: '#478c0b' }}>3,100+</div>
            <p className="text-sm text-gray-600">Members</p>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: '#f6af0d' }}>55</div>
            <p className="text-sm text-gray-600">Years</p>
          </div>
          <div>
            <div className="text-3xl font-bold" style={{ color: '#c23c09' }}>100%</div>
            <p className="text-sm text-gray-600">Vegan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Main Introduction */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              {selectedContent.title}
            </h2>
            <p className="text-xl text-gray-600 mb-6">{selectedContent.subtitle}</p>
            <p className="text-gray-700 mb-6 leading-relaxed">{selectedContent.description}</p>
            
            {/* Key Points based on audience */}
            <div className="space-y-3">
              {audience === 'community' && (
                <>
                  <div className="flex items-center">
                    <i className="fas fa-crown mr-3" style={{ color: '#478c0b' }}></i>
                    <span>Living under Divine governance</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-book-open mr-3" style={{ color: '#478c0b' }}></i>
                    <span>Kingdom School educating our youth</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-hands-praying mr-3" style={{ color: '#478c0b' }}></i>
                    <span>United in faith and purpose</span>
                  </div>
                </>
              )}
              
              {audience === 'israeli' && (
                <>
                  <div className="flex items-center">
                    <i className="fas fa-handshake mr-3" style={{ color: '#478c0b' }}></i>
                    <span>שותפים בחברה הישראלית</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-shield-alt mr-3" style={{ color: '#478c0b' }}></i>
                    <span>משרתים בצה"ל</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-seedling mr-3" style={{ color: '#478c0b' }}></i>
                    <span>חלוצי הטבעונות בישראל</span>
                  </div>
                </>
              )}
              
              {audience === 'international' && (
                <>
                  <div className="flex items-center">
                    <i className="fas fa-globe-africa mr-3" style={{ color: '#478c0b' }}></i>
                    <span>African diaspora heritage site</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-leaf mr-3" style={{ color: '#478c0b' }}></i>
                    <span>Pioneer vegan community</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-heart mr-3" style={{ color: '#478c0b' }}></i>
                    <span>Cultural tourism destination</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="relative h-64 md:h-auto">
            <Image
              src="/images/community/village_of_peace_community_authentic_dimona_israel_50.jpg"
              alt="Village of Peace Community"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>
          Our Journey Through Time
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#cfe7c1' }}
              >
                <i className={`fas ${milestone.icon}`} style={{ color: '#478c0b' }}></i>
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: '#478c0b' }}>
                  {milestone.year}
                </p>
                <p className="text-gray-600">{milestone.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>
          Living by Divine Principles
        </h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'white' }}
            >
              <i className="fas fa-carrot text-3xl" style={{ color: '#478c0b' }}></i>
            </div>
            <h4 className="font-bold mb-2">Divine Nutrition</h4>
            <p className="text-sm text-gray-600">Genesis 1:29 plant-based diet</p>
          </div>
          
          <div className="text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'white' }}
            >
              <i className="fas fa-torah text-3xl" style={{ color: '#f6af0d' }}></i>
            </div>
            <h4 className="font-bold mb-2">Hebrew Heritage</h4>
            <p className="text-sm text-gray-600">Biblical identity & language</p>
          </div>
          
          <div className="text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'white' }}
            >
              <i className="fas fa-dove text-3xl" style={{ color: '#c23c09' }}></i>
            </div>
            <h4 className="font-bold mb-2">Peace & Harmony</h4>
            <p className="text-sm text-gray-600">Living in unity with all</p>
          </div>
          
          <div className="text-center">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'white' }}
            >
              <i className="fas fa-recycle text-3xl" style={{ color: '#478c0b' }}></i>
            </div>
            <h4 className="font-bold mb-2">Sustainability</h4>
            <p className="text-sm text-gray-600">Earth-conscious living</p>
          </div>
        </div>
      </div>

      {/* Community Impact */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>
          Our Impact & Contributions
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4" style={{ color: '#478c0b' }}>
              Economic Development
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-check mt-1 mr-3" style={{ color: '#478c0b' }}></i>
                <span>100+ community businesses providing employment</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check mt-1 mr-3" style={{ color: '#478c0b' }}></i>
                <span>₪18 million annual contribution to local economy</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check mt-1 mr-3" style={{ color: '#478c0b' }}></i>
                <span>20,000+ tourists bringing revenue to Negev</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-4" style={{ color: '#f6af0d' }}>
              Social Innovation
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-check mt-1 mr-3" style={{ color: '#f6af0d' }}></i>
                <span>Pioneered Israel's vegan movement since 1973</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check mt-1 mr-3" style={{ color: '#f6af0d' }}></i>
                <span>Model for sustainable desert communities</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-check mt-1 mr-3" style={{ color: '#f6af0d' }}></i>
                <span>Cultural bridge between Israel and Africa</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action based on audience */}
      <div className="text-center">
        {audience === 'community' && (
          <button 
            className="px-8 py-4 text-lg font-semibold rounded-full text-white hover:shadow-lg transition-all"
            style={{ backgroundColor: '#478c0b' }}
          >
            <i className="fas fa-users mr-2"></i>
            Join Community Initiatives
          </button>
        )}
        
        {audience === 'israeli' && (
          <button 
            className="px-8 py-4 text-lg font-semibold rounded-full hover:shadow-lg transition-all"
            style={{ backgroundColor: '#f6af0d', color: '#3a3a1d' }}
          >
            <i className="fas fa-calendar mr-2"></i>
            הזמן ביקור בכפר
          </button>
        )}
        
        {audience === 'international' && (
          <button 
            className="px-8 py-4 text-lg font-semibold rounded-full text-white hover:shadow-lg transition-all"
            style={{ backgroundColor: '#c23c09' }}
          >
            <i className="fas fa-plane mr-2"></i>
            Plan Your Journey
          </button>
        )}
        
        {audience === 'all' && (
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
              className="px-8 py-4 text-lg font-semibold rounded-full text-white hover:shadow-lg transition-all"
              style={{ backgroundColor: '#478c0b' }}
            >
              <i className="fas fa-info-circle mr-2"></i>
              Learn More
            </button>
            <button 
              className="px-8 py-4 text-lg font-semibold rounded-full hover:shadow-lg transition-all"
              style={{ backgroundColor: '#f6af0d', color: '#3a3a1d' }}
            >
              <i className="fas fa-map-signs mr-2"></i>
              Visit Us
            </button>
          </div>
        )}
      </div>
    </div>
  );
}