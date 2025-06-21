'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('tourism');
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setScrollProgress(scrollPercent);
      setIsHeaderCompact(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['tourism', 'services', 'about', 'education'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  const showSection = (sectionId: string) => {
    setActiveTab(sectionId);
  };

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
        {/* Hero Section */}
        <section 
        className="relative min-h-[80vh] flex items-center justify-center text-white text-center"
        style={{
          background: `linear-gradient(135deg, rgba(71, 140, 11, 0.9), rgba(246, 175, 13, 0.8)), url('/images/community/5.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Discover Village of Peace</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Experience 50+ years of heritage, culture, and community life in the heart of Israel</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                className="px-8 py-4 text-white rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)' }}
                onClick={() => showSection('tourism')}
              >
                <i className="fas fa-map-signs"></i>
                Explore Tours
              </button>
              <button 
                className="px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, #f6af0d, #e09b00)',
                  color: '#3a3a1d'
                }}
                onClick={() => showSection('education')}
              >
                <i className="fas fa-graduation-cap"></i>
                Learn Culture
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Navigation Tabs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Navigation Tabs */}
          <div className="flex flex-col md:flex-row bg-white rounded-2xl p-1.5 shadow-xl mb-8 max-w-5xl mx-auto">
            <button 
              className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'tourism' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ backgroundColor: activeTab === 'tourism' ? '#478c0b' : 'transparent' }}
              onClick={() => showSection('tourism')}
            >
              <i className="fas fa-mountain"></i>
              Tourism & Experiences
            </button>
            <button 
              className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'services' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ backgroundColor: activeTab === 'services' ? '#478c0b' : 'transparent' }}
              onClick={() => showSection('services')}
            >
              <i className="fas fa-tools"></i>
              Community Services
            </button>
            <button 
              className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'about' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ backgroundColor: activeTab === 'about' ? '#478c0b' : 'transparent' }}
              onClick={() => showSection('about')}
            >
              <i className="fas fa-home"></i>
              About VOP
            </button>
            <button 
              className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'education' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ backgroundColor: activeTab === 'education' ? '#478c0b' : 'transparent' }}
              onClick={() => showSection('education')}
            >
              <i className="fas fa-book-open"></i>
              Cultural Education
            </button>
          </div>

          {/* Tourism & Experiences Section */}
          <div className={`${activeTab === 'tourism' ? 'block' : 'hidden'} animate-fadeIn`}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Tourism & Experiences</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Immerse yourself in authentic Village of Peace culture through guided tours, workshops, and unique experiences</p>
            </div>

            {/* Tour Packages */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-red-500">
                <img src="/images/community/3.jpg" alt="Sacred Visitation" className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">Sacred Visitation</h3>
                  <p className="text-gray-600 mb-4">Journey to Israel's holiest sites including Jerusalem, the Live Sea, and Jericho with spiritual guidance from our community elders.</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold" style={{ color: '#478c0b' }}>₪350</span>
                    <span className="text-sm text-gray-500">Full day</span>
                  </div>
                  <ul className="text-sm text-gray-600 mb-4">
                    <li className="flex items-center mb-1">
                      <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                      Jerusalem Old City tour
                    </li>
                    <li className="flex items-center mb-1">
                      <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                      Live Sea healing experience
                    </li>
                    <li className="flex items-center mb-1">
                      <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                      Jericho historical sites
                    </li>
                  </ul>
                  <button 
                    className="w-full py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)' }}
                  >
                    Book Experience
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-red-500">
                <img src="/images/community/food/1.jpg" alt="Cooking Workshop" className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">Vegan Cooking Workshop</h3>
                  <p className="text-gray-600 mb-4">Learn traditional AHIC recipes and modern vegan techniques from community chefs.</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold" style={{ color: '#478c0b' }}>₪180</span>
                    <span className="text-sm text-gray-500">4 hours</span>
                  </div>
                  <ul className="text-sm text-gray-600 mb-4">
                    <li className="flex items-center mb-1">
                      <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                      Hands-on cooking experience
                    </li>
                    <li className="flex items-center mb-1">
                      <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                      Recipe collection included
                    </li>
                    <li className="flex items-center mb-1">
                      <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                      Take home your creations
                    </li>
                  </ul>
                  <button 
                    className="w-full py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)' }}
                  >
                    Book Workshop
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-red-500">
                <img src="/images/community/agriculture/1.jpg" alt="Agricultural Tour" className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">Organic Farm Experience</h3>
                  <p className="text-gray-600 mb-4">Work alongside community farmers and learn sustainable agriculture practices in our organic greenhouses.</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold" style={{ color: '#478c0b' }}>₪150</span>
                    <span className="text-sm text-gray-500">5 hours</span>
                  </div>
                  <ul className="text-sm text-gray-600 mb-4">
                    <li className="flex items-center mb-1">
                      <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                      Hands-on farming work
                    </li>
                    <li className="flex items-center mb-1">
                      <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                      Organic produce to take home
                    </li>
                    <li className="flex items-center mb-1">
                      <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                      Farm-to-table lunch
                    </li>
                  </ul>
                  <button 
                    className="w-full py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)' }}
                  >
                    Book Experience
                  </button>
                </div>
              </div>
            </div>

            {/* Accommodation Options */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-3xl font-bold mb-6 text-gray-800 text-center">Accommodation Options</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                  <img src="/images/community/5.jpg" alt="Guesthouse" className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h4 className="text-xl font-bold mb-2">Community Guesthouse</h4>
                    <p className="text-gray-600 mb-3">Warm hospitality in the heart of our welcoming village</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold" style={{ color: '#478c0b' }}>₪200/night</span>
                      <button 
                        className="px-4 py-2 text-white rounded text-sm font-semibold"
                        style={{ backgroundColor: '#478c0b' }}
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                  <img src="/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_20.jpg" alt="Homestay" className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h4 className="text-xl font-bold mb-2">Family Homestay</h4>
                    <p className="text-gray-600 mb-3">Stay with VOP families for authentic experience</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold" style={{ color: '#478c0b' }}>₪150/night</span>
                      <button 
                        className="px-4 py-2 text-white rounded text-sm font-semibold"
                        style={{ backgroundColor: '#478c0b' }}
                      >
                        Inquire
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                  <img src="/images/community/15.jpg" alt="Cultural Performance" className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h4 className="text-xl font-bold mb-2">Cultural Performances</h4>
                    <p className="text-gray-600 mb-3">Experience our world-renowned choir and dance</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold" style={{ color: '#478c0b' }}>₪50/show</span>
                      <button 
                        className="px-4 py-2 text-white rounded text-sm font-semibold"
                        style={{ backgroundColor: '#478c0b' }}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visitor Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-3xl font-bold mb-6 text-gray-800">Visitor Information</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold mb-4" style={{ color: '#478c0b' }}>Getting Here</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Village of Peace, Dimona, Israel</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-car mr-3" style={{ color: '#478c0b' }}></i>
                      <span>1 hour drive from Beer Sheva</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-bus mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Public transport available from Dimona</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-plane mr-3" style={{ color: '#478c0b' }}></i>
                      <span>2 hours from Ben Gurion Airport</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-4" style={{ color: '#478c0b' }}>Best Time to Visit</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <i className="fas fa-sun mr-3" style={{ color: '#f6af0d' }}></i>
                      <span>Spring (March-May): Perfect weather</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-leaf mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Fall (September-November): Harvest season</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-snowflake mr-3 text-blue-500"></i>
                      <span>Winter (December-February): Mild climate</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-calendar mr-3 text-purple-500"></i>
                      <span>Jewish holidays: Special celebrations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Services Section */}
          <div className={`${activeTab === 'services' ? 'block' : 'hidden'} animate-fadeIn`}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Community Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Professional trades and services provided by skilled Village of Peace community members</p>
            </div>

            {/* Service Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-yellow-500">
                <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                  <i className="fas fa-hammer"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">Construction & Trades</h3>
                <p className="text-gray-600 mb-4">Carpentry, plumbing, electrical, and general construction services</p>
                <button 
                  className="px-6 py-2 rounded-full font-semibold transition-all duration-300"
                  style={{ 
                    backgroundColor: '#f6af0d',
                    color: '#3a3a1d'
                  }}
                >
                  View Services
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-yellow-500">
                <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                  <i className="fas fa-spa"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">Health & Wellness</h3>
                <p className="text-gray-600 mb-4">Natural healing, massage therapy, and holistic health services</p>
                <button 
                  className="px-6 py-2 rounded-full font-semibold transition-all duration-300"
                  style={{ 
                    backgroundColor: '#f6af0d',
                    color: '#3a3a1d'
                  }}
                >
                  View Services
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-yellow-500">
                <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">Education & Tutoring</h3>
                <p className="text-gray-600 mb-4">Hebrew lessons, academic tutoring, and cultural education</p>
                <button 
                  className="px-6 py-2 rounded-full font-semibold transition-all duration-300"
                  style={{ 
                    backgroundColor: '#f6af0d',
                    color: '#3a3a1d'
                  }}
                >
                  View Services
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-yellow-500">
                <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                  <i className="fas fa-palette"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">Arts & Creativity</h3>
                <p className="text-gray-600 mb-4">Art classes, music lessons, and creative workshops</p>
                <button 
                  className="px-6 py-2 rounded-full font-semibold transition-all duration-300"
                  style={{ 
                    backgroundColor: '#f6af0d',
                    color: '#3a3a1d'
                  }}
                >
                  View Services
                </button>
              </div>
            </div>

            {/* Featured Service Providers */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-3xl font-bold mb-6 text-gray-800">Featured Service Providers</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="Service Provider" className="w-16 h-16 rounded-full object-cover mr-4" />
                    <div>
                      <h4 className="text-xl font-bold">Brother Yaacov</h4>
                      <p style={{ color: '#478c0b' }}>Master Carpenter</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">30+ years experience in traditional woodworking and modern construction</p>
                  <div className="flex items-center mb-4">
                    <div className="text-yellow-500 mr-2">
                      <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                    </div>
                    <span className="text-gray-600">(47 reviews)</span>
                  </div>
                  <button 
                    className="w-full py-3 text-white rounded font-semibold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Contact Service
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Service Provider" className="w-16 h-16 rounded-full object-cover mr-4" />
                    <div>
                      <h4 className="text-xl font-bold">Sister Miriam</h4>
                      <p style={{ color: '#478c0b' }}>Healing Arts Practitioner</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">Natural healing, herbal medicine, and spiritual wellness guidance</p>
                  <div className="flex items-center mb-4">
                    <div className="text-yellow-500 mr-2">
                      <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                    </div>
                    <span className="text-gray-600">(63 reviews)</span>
                  </div>
                  <button 
                    className="w-full py-3 text-white rounded font-semibold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Book Session
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" alt="Service Provider" className="w-16 h-16 rounded-full object-cover mr-4" />
                    <div>
                      <h4 className="text-xl font-bold">Brother David</h4>
                      <p style={{ color: '#478c0b' }}>Hebrew Language Teacher</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">Biblical Hebrew and modern Hebrew instruction for all levels</p>
                  <div className="flex items-center mb-4">
                    <div className="text-yellow-500 mr-2">
                      <i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i>
                    </div>
                    <span className="text-gray-600">(28 reviews)</span>
                  </div>
                  <button 
                    className="w-full py-3 text-white rounded font-semibold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Schedule Lesson
                  </button>
                </div>
              </div>
            </div>

            {/* Service Booking System */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-3xl font-bold mb-6 text-gray-800">Request Community Services</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option>Select service type...</option>
                        <option>Construction & Trades</option>
                        <option>Health & Wellness</option>
                        <option>Education & Tutoring</option>
                        <option>Arts & Creativity</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                      <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Describe your service needs..."></textarea>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full py-3 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                      style={{ backgroundColor: '#478c0b' }}
                    >
                      Submit Request
                    </button>
                  </form>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-4" style={{ color: '#478c0b' }}>Service Guidelines</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <i className="fas fa-check mt-1 mr-3" style={{ color: '#478c0b' }}></i>
                      <span>All services provided by community members</span>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-check mt-1 mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Fair pricing and transparent billing</span>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-check mt-1 mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Quality guaranteed by community standards</span>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-check mt-1 mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Supporting local community economy</span>
                    </div>
                    <div className="flex items-start">
                      <i className="fas fa-check mt-1 mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Spiritual and cultural values respected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About VOP Section */}
          <div className={`${activeTab === 'about' ? 'block' : 'hidden'} animate-fadeIn`}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">About Village of Peace</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover the rich heritage and culture of our African Hebrew Israelite community in Dimona, Israel</p>
            </div>

            {/* Community Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-gray-800">Our Community Story</h3>
                  <p className="text-gray-600 mb-4">
                    The Village of Peace (Kfar Shalom) was established in 1967 when African Hebrew Israelites, led by Ben Ammi Ben-Israel, 
                    made their historic migration from America to Israel. Our community represents a unique blend of African heritage, 
                    Hebrew culture, and modern Israeli entrepreneurship.
                  </p>
                  <p className="text-gray-600 mb-4">
                    For over 50 years, we have built a thriving community based on principles of health, peace, and sustainable business. 
                    Our vegan lifestyle, eco-friendly practices, and commitment to quality have made us pioneers in plant-based products and 
                    sustainable commerce.
                  </p>
                  <p className="text-gray-600">
                    Today, our community is home to over 3,000 residents and continues to welcome customers from around the world who 
                    come to enjoy our authentic products and experience our sustainable business model.
                  </p>
                </div>
                <div>
                  <img src="/images/community/1.jpg" alt="Community Life" className="w-full h-full object-cover rounded-xl" />
                </div>
              </div>
            </div>

            {/* Community Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-3xl font-bold mb-8 text-gray-800 text-center">Community Timeline</h3>
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border-l-4 hover:shadow-md transition-all duration-300 hover:translate-x-2" style={{ borderColor: '#478c0b' }}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl font-bold mr-4" style={{ color: '#478c0b' }}>1967</span>
                    <h4 className="text-xl font-bold">Community Founded</h4>
                  </div>
                  <p className="text-gray-600">African Hebrew Israelites arrive in Israel, establishing the foundation for what would become a thriving business community.</p>
                </div>

                <div className="bg-white rounded-xl p-6 border-l-4 hover:shadow-md transition-all duration-300 hover:translate-x-2" style={{ borderColor: '#478c0b' }}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl font-bold mr-4" style={{ color: '#478c0b' }}>1970s</span>
                    <h4 className="text-xl font-bold">Early Settlement</h4>
                  </div>
                  <p className="text-gray-600">Community establishes roots in Dimona, developing agricultural projects and beginning the journey toward official recognition.</p>
                </div>

                <div className="bg-white rounded-xl p-6 border-l-4 hover:shadow-md transition-all duration-300 hover:translate-x-2" style={{ borderColor: '#478c0b' }}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl font-bold mr-4" style={{ color: '#478c0b' }}>1983</span>
                    <h4 className="text-xl font-bold">Teva Deli Founded</h4>
                  </div>
                  <p className="text-gray-600">Launch of Israel\'s first vegan food manufacturing company, pioneering the plant-based food industry in the country.</p>
                </div>

                <div className="bg-white rounded-xl p-6 border-l-4 hover:shadow-md transition-all duration-300 hover:translate-x-2" style={{ borderColor: '#478c0b' }}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl font-bold mr-4" style={{ color: '#478c0b' }}>1990s</span>
                    <h4 className="text-xl font-bold">Cultural Recognition</h4>
                  </div>
                  <p className="text-gray-600">Growing recognition of community contributions to Israeli society, including military service and cultural exchange programs.</p>
                </div>

                <div className="bg-white rounded-xl p-6 border-l-4 hover:shadow-md transition-all duration-300 hover:translate-x-2" style={{ borderColor: '#478c0b' }}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl font-bold mr-4" style={{ color: '#478c0b' }}>2003</span>
                    <h4 className="text-xl font-bold">Official Recognition</h4>
                  </div>
                  <p className="text-gray-600">Israeli government grants permanent residency status, officially recognizing the community\'s place in Israeli society.</p>
                </div>

                <div className="bg-white rounded-xl p-6 border-l-4 hover:shadow-md transition-all duration-300 hover:translate-x-2" style={{ borderColor: '#478c0b' }}>
                  <div className="flex items-center mb-2">
                    <span className="text-2xl font-bold mr-4" style={{ color: '#478c0b' }}>2024</span>
                    <h4 className="text-xl font-bold">Digital Marketplace Launch</h4>
                  </div>
                  <p className="text-gray-600">KiFar Marketplace launches, bringing community businesses and culture to the global digital marketplace.</p>
                </div>
              </div>
            </div>

            {/* Community Values */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-3xl font-bold mb-8 text-gray-800 text-center">Our Core Values</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-leaf"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Healthy Products</h4>
                  <p className="text-gray-600">100% vegan products, natural ingredients, and quality assurance for customer well-being.</p>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-dove"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Peace & Harmony</h4>
                  <p className="text-gray-600">Living in peace with all creation, promoting harmony between peoples and respect for all life.</p>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-book"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Cultural Heritage</h4>
                  <p className="text-gray-600">Preserving traditions, sharing culture, and maintaining our unique Hebrew African identity.</p>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-heart"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Community Unity</h4>
                  <p className="text-gray-600">Strong family bonds, mutual support, and collective responsibility for community wellbeing.</p>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-globe"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Environmental Stewardship</h4>
                  <p className="text-gray-600">Sustainable practices, organic agriculture, and responsible use of natural resources.</p>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Education & Growth</h4>
                  <p className="text-gray-600">Lifelong learning, cultural education, and sharing knowledge with the world.</p>
                </div>
              </div>
            </div>

            {/* Community Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-8" style={{ borderWidth: '2px', borderColor: '#f6af0d' }}>
              <h3 className="text-3xl font-bold mb-8 text-gray-800 text-center">Community by Numbers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#478c0b' }}>3,000+</div>
                  <div className="text-gray-600">Community Members</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#f6af0d' }}>50+</div>
                  <div className="text-gray-600">Years of Heritage</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#c23c09' }}>100+</div>
                  <div className="text-gray-600">Community Businesses</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#478c0b' }}>40+</div>
                  <div className="text-gray-600">Countries Reached</div>
                </div>
              </div>
            </div>
          </div>

          {/* Cultural Education Section */}
          <div className={`${activeTab === 'education' ? 'block' : 'hidden'} animate-fadeIn`}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Cultural Education Center</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Learn about African Hebrew Israelite values, traditions, and way of life through our comprehensive educational programs</p>
            </div>

            {/* Educational Programs */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-3xl font-bold mb-8 text-gray-800">Educational Programs</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-language"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Hebrew Language Classes</h4>
                  <p className="text-gray-600 mb-4">Learn Biblical and modern Hebrew with native speakers and cultural context.</p>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Beginner to Advanced</span>
                  </div>
                  <button 
                    className="w-full py-3 text-white rounded font-semibold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Enroll Now
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-history"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">AHIC History Course</h4>
                  <p className="text-gray-600 mb-4">Comprehensive study of African Hebrew Israelite community history and development.</p>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">8-week course</span>
                  </div>
                  <button 
                    className="w-full py-3 text-white rounded font-semibold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Learn More
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-utensils"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Vegan Lifestyle Workshop</h4>
                  <p className="text-gray-600 mb-4">Learn the principles and practices of healthy vegan living from community experts.</p>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Monthly workshops</span>
                  </div>
                  <button 
                    className="w-full py-3 text-white rounded font-semibold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Join Workshop
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-music"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Community Music & Arts</h4>
                  <p className="text-gray-600 mb-4">Explore traditional songs, dances, and artistic expressions of our community.</p>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Weekly sessions</span>
                  </div>
                  <button 
                    className="w-full py-3 text-white rounded font-semibold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Participate
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-praying-hands"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Spiritual Practices</h4>
                  <p className="text-gray-600 mb-4">Learn about community spiritual traditions, meditation, and prayer practices.</p>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Respectful observation</span>
                  </div>
                  <button 
                    className="w-full py-3 text-white rounded font-semibold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Inquire
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-4" style={{ color: '#478c0b' }}>
                    <i className="fas fa-seedling"></i>
                  </div>
                  <h4 className="text-xl font-bold mb-3">Sustainable Living</h4>
                  <p className="text-gray-600 mb-4">Discover eco-friendly practices and sustainable agriculture methods used in VOP.</p>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Hands-on learning</span>
                  </div>
                  <button 
                    className="w-full py-3 text-white rounded font-semibold"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>

            {/* Workshop Schedule */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-3xl font-bold mb-8 text-gray-800">Weekly Workshop Schedule</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-xl p-6" style={{ backgroundColor: '#cfe7c1' }}>
                  <h4 className="text-lg font-bold mb-3" style={{ color: '#3a3a1d' }}>Monday</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Hebrew Beginners</span>
                      <span className="text-sm text-gray-600">10:00-11:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vegan Cooking</span>
                      <span className="text-sm text-gray-600">15:00-17:00</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ backgroundColor: '#cfe7c1' }}>
                  <h4 className="text-lg font-bold mb-3" style={{ color: '#3a3a1d' }}>Tuesday</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Community History</span>
                      <span className="text-sm text-gray-600">9:00-10:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Music & Dance</span>
                      <span className="text-sm text-gray-600">16:00-17:30</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ backgroundColor: '#cfe7c1' }}>
                  <h4 className="text-lg font-bold mb-3" style={{ color: '#3a3a1d' }}>Wednesday</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Hebrew Advanced</span>
                      <span className="text-sm text-gray-600">10:00-11:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sustainable Living</span>
                      <span className="text-sm text-gray-600">14:00-16:00</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ backgroundColor: '#cfe7c1' }}>
                  <h4 className="text-lg font-bold mb-3" style={{ color: '#3a3a1d' }}>Thursday</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Spiritual Practices</span>
                      <span className="text-sm text-gray-600">8:00-9:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arts & Crafts</span>
                      <span className="text-sm text-gray-600">15:00-16:30</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ backgroundColor: '#cfe7c1' }}>
                  <h4 className="text-lg font-bold mb-3" style={{ color: '#3a3a1d' }}>Friday</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Family Programs</span>
                      <span className="text-sm text-gray-600">10:00-12:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sabbath Prep</span>
                      <span className="text-sm text-gray-600">14:00-15:00</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl p-6" style={{ backgroundColor: '#cfe7c1' }}>
                  <h4 className="text-lg font-bold mb-3" style={{ color: '#3a3a1d' }}>Sunday</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Community Tours</span>
                      <span className="text-sm text-gray-600">9:00-12:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cultural Exchange</span>
                      <span className="text-sm text-gray-600">15:00-17:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Resources */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-3xl font-bold mb-8 text-gray-800">Learning Resources</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-bold mb-4" style={{ color: '#478c0b' }}>Digital Library</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <i className="fas fa-book mr-3" style={{ color: '#478c0b' }}></i>
                      <div>
                        <div className="font-medium">Community History Archive</div>
                        <div className="text-sm text-gray-600">50+ years of documented history</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <i className="fas fa-video mr-3" style={{ color: '#478c0b' }}></i>
                      <div>
                        <div className="font-medium">Documentary Collection</div>
                        <div className="text-sm text-gray-600">Films about community life</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <i className="fas fa-microphone mr-3" style={{ color: '#478c0b' }}></i>
                      <div>
                        <div className="font-medium">Audio Recordings</div>
                        <div className="text-sm text-gray-600">Speeches and traditional music</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <i className="fas fa-image mr-3" style={{ color: '#478c0b' }}></i>
                      <div>
                        <div className="font-medium">Photo Gallery</div>
                        <div className="text-sm text-gray-600">Historical and contemporary images</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-4" style={{ color: '#478c0b' }}>Study Materials</h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <i className="fas fa-scroll mr-3" style={{ color: '#478c0b' }}></i>
                      <div>
                        <div className="font-medium">Hebrew Study Guides</div>
                        <div className="text-sm text-gray-600">Beginner to advanced materials</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <i className="fas fa-utensils mr-3" style={{ color: '#478c0b' }}></i>
                      <div>
                        <div className="font-medium">Recipe Collections</div>
                        <div className="text-sm text-gray-600">Traditional vegan recipes</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <i className="fas fa-seedling mr-3" style={{ color: '#478c0b' }}></i>
                      <div>
                        <div className="font-medium">Gardening Guides</div>
                        <div className="text-sm text-gray-600">Organic farming techniques</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <i className="fas fa-heart mr-3" style={{ color: '#478c0b' }}></i>
                      <div>
                        <div className="font-medium">Wellness Resources</div>
                        <div className="text-sm text-gray-600">Holistic health practices</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cultural Exchange Program */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-3xl font-bold mb-6 text-gray-800">Cultural Exchange Program</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-gray-600 mb-4">
                    Our Cultural Exchange Program connects visitors and the global diaspora with authentic Village of Peace experiences. 
                    Participants live within the community, share meals with families, and participate in daily activities.
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                      <span>1-4 week programs available</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Homestay with community families</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Work-study opportunities</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Language immersion</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                      <span>Cultural mentorship</span>
                    </div>
                  </div>
                  <button 
                    className="px-8 py-3 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    Apply for Exchange
                  </button>
                </div>
                <div>
                  <img src="/images/community/8.jpg" alt="Cultural Exchange" className="w-full h-full object-cover rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default AboutPage;