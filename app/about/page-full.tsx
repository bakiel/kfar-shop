'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';

const AboutPage = () => {
  const [activeTab, setActiveTab] = useState('story');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showSection = (sectionId: string) => {
    setActiveTab(sectionId);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center text-white text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(71, 140, 11, 0.9), rgba(246, 175, 13, 0.8)), url(/images/backgrounds/1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Discover Village of Peace</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Experience 55+ years of heritage, culture, and community life in the heart of Israel</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={() => showSection('tourism')}
                className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)' }}
              >
                <i className="fas fa-map-signs"></i>
                Explore Tours
              </button>
              <button 
                onClick={() => showSection('education')}
                className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f6af0d, #e09b00)', color: '#3a3a1d' }}
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
                activeTab === 'story' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ backgroundColor: activeTab === 'story' ? '#478c0b' : 'transparent' }}
              onClick={() => showSection('story')}
            >
              <i className="fas fa-home"></i>
              <span>Our Story</span>
            </button>
            <button 
              className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'tourism' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ backgroundColor: activeTab === 'tourism' ? '#478c0b' : 'transparent' }}
              onClick={() => showSection('tourism')}
            >
              <i className="fas fa-mountain"></i>
              <span>Tourism</span>
            </button>
            <button 
              className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'services' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ backgroundColor: activeTab === 'services' ? '#478c0b' : 'transparent' }}
              onClick={() => showSection('services')}
            >
              <i className="fas fa-tools"></i>
              <span>Services</span>
            </button>
            <button 
              className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'education' ? 'text-white shadow-lg' : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ backgroundColor: activeTab === 'education' ? '#478c0b' : 'transparent' }}
              onClick={() => showSection('education')}
            >
              <i className="fas fa-book-open"></i>
              <span>Education</span>
            </button>
          </div>

          {/* Our Story Section */}
          <div className={`${activeTab === 'story' ? 'block' : 'hidden'} animate-fadeIn`}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#3a3a1d' }}>About Village of Peace</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover the rich heritage and culture of our community in Dimona, Israel</p>
            </div>

            {/* Community Overview */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 transition-all duration-300 hover:shadow-2xl">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-3xl font-bold mb-4" style={{ color: '#3a3a1d' }}>Our Community Story</h3>
                  <p className="text-gray-600 mb-4">
                    The Village of Peace (Kfar Shalom) was established in 1969 when a group of African Americans, 
                    made their spiritual journey from America to the Holy Land. Our community represents a unique blend of African heritage, 
                    Hebrew culture, and modern Israeli life.
                  </p>
                  <p className="text-gray-600 mb-4">
                    For over 55 years, we have built a thriving community based on principles of health, peace, and spiritual growth. 
                    Our vegan lifestyle, sustainable practices, and commitment to education have made us pioneers in healthy living and 
                    environmental consciousness.
                  </p>
                  <p className="text-gray-600">
                    Today, our community is home to over 3,000 residents and continues to welcome visitors from around the world who 
                    come to learn about our unique way of life and spiritual practices.
                  </p>
                </div>
                <div className="relative h-96 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/community/village_of_peace_community_authentic_dimona_israel_20.jpg" 
                    alt="Community Life" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Community Timeline */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>Community Timeline</h3>
              <div className="space-y-6">
                {[
                  { year: '1969', title: 'The Great Journey Begins', description: 'A group of African Americans begin their spiritual exodus from Chicago to the Holy Land, establishing the foundation of our community.' },
                  { year: '1970s', title: 'Early Settlement', description: 'Community establishes roots in Dimona, developing agricultural projects and beginning the journey toward official recognition.' },
                  { year: '1983', title: 'Teva Deli Founded', description: 'Launch of Israel\'s first vegan food manufacturing company, pioneering the plant-based food industry in the country.' },
                  { year: '1990s', title: 'Cultural Recognition', description: 'Growing recognition of community contributions to Israeli society, including military service and cultural exchange programs.' },
                  { year: '2003', title: 'Official Recognition', description: 'Israeli government grants permanent residency status, officially recognizing the community\'s place in Israeli society.' },
                  { year: '2024', title: 'Digital Marketplace Launch', description: 'KiFar Marketplace launches, bringing community businesses and culture to the global digital marketplace.' }
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="bg-white rounded-2xl p-6 transition-all duration-300 hover:transform hover:translate-x-2 hover:shadow-lg"
                    style={{ borderLeft: '5px solid #478c0b' }}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl font-bold mr-4" style={{ color: '#478c0b' }}>{item.year}</span>
                      <h4 className="text-xl font-bold">{item.title}</h4>
                    </div>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Values */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>Our Core Values</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: 'fa-leaf', title: 'Healthy Living', description: 'Complete vegan lifestyle, natural foods, and holistic health practices for optimal well-being.' },
                  { icon: 'fa-dove', title: 'Peace & Harmony', description: 'Living in peace with all creation, promoting harmony between peoples and respect for all life.' },
                  { icon: 'fa-book', title: 'Spiritual Growth', description: 'Continuous learning, spiritual development, and connection to our Hebrew heritage and identity.' },
                  { icon: 'fa-heart', title: 'Community Unity', description: 'Strong family bonds, mutual support, and collective responsibility for community wellbeing.' },
                  { icon: 'fa-globe', title: 'Environmental Care', description: 'Sustainable practices, organic agriculture, and responsible use of natural resources.' },
                  { icon: 'fa-graduation-cap', title: 'Education & Growth', description: 'Lifelong learning, cultural education, and sharing knowledge with the world.' }
                ].map((value, index) => (
                  <div key={index} className="text-center">
                    <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                      <i className={`fas ${value.icon}`}></i>
                    </div>
                    <h4 className="text-xl font-bold mb-3">{value.title}</h4>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Statistics */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border-2" style={{ borderColor: '#f6af0d' }}>
              <h3 className="text-3xl font-bold mb-8 text-center" style={{ color: '#3a3a1d' }}>Community by Numbers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#478c0b' }}>3,000+</div>
                  <div className="text-gray-600">Community Members</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2" style={{ color: '#f6af0d' }}>55+</div>
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

          {/* Tourism Section */}
          <div className={`${activeTab === 'tourism' ? 'block' : 'hidden'} animate-fadeIn`}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Tourism & Experiences</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Immerse yourself in authentic Village of Peace culture through guided tours, workshops, and unique experiences</p>
            </div>

            {/* Tour Packages */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[
                {
                  title: 'Heritage Walking Tour',
                  image: '/images/community/village_of_peace_community_authentic_dimona_israel_14.jpg',
                  description: 'Explore 55+ years of VOP history with community elders sharing authentic stories and traditions.',
                  price: '₪120',
                  duration: '3 hours',
                  features: ['Community history sites', 'Elder storytelling sessions', 'Traditional meal included']
                },
                {
                  title: 'Vegan Cooking Workshop',
                  image: '/images/community/village_of_peace_community_authentic_dimona_israel_15.jpg',
                  description: 'Learn traditional vegan recipes and modern techniques from community chefs.',
                  price: '₪180',
                  duration: '4 hours',
                  features: ['Hands-on cooking experience', 'Recipe collection included', 'Take home your creations']
                },
                {
                  title: 'Organic Farm Experience',
                  image: '/images/community/village_of_peace_community_authentic_dimona_israel_16.jpg',
                  description: 'Work alongside community farmers and learn sustainable agriculture practices.',
                  price: '₪150',
                  duration: '5 hours',
                  features: ['Hands-on farming work', 'Organic produce to take home', 'Farm-to-table lunch']
                }
              ].map((tour, index) => (
                <div key={index} className="bg-white rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-2xl border-2 border-transparent hover:border-red-500">
                  <div className="relative h-48">
                    <Image src={tour.image} alt={tour.title || "Image"} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3" style={{ color: '#3a3a1d' }}>{tour.title}</h3>
                    <p className="text-gray-600 mb-4">{tour.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold" style={{ color: '#478c0b' }}>{tour.price}</span>
                      <span className="text-sm text-gray-500">{tour.duration}</span>
                    </div>
                    <ul className="text-sm text-gray-600 mb-4">
                      {tour.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center mb-1">
                          <i className="fas fa-check mr-2" style={{ color: '#478c0b' }}></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button 
                      className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)' }}
                    >
                      Book Experience
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Accommodation Options */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h3 className="text-3xl font-bold mb-6 text-center" style={{ color: '#3a3a1d' }}>Accommodation Options</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { type: 'Community Guesthouse', description: 'Comfortable rooms within the village community', price: '₪200/night', image: '/images/community/village_of_peace_community_authentic_dimona_israel_17.jpg' },
                  { type: 'Family Homestay', description: 'Stay with VOP families for authentic experience', price: '₪150/night', image: '/images/community/village_of_peace_community_authentic_dimona_israel_18.jpg' },
                  { type: 'Desert Camping', description: 'Eco-friendly camping under the stars', price: '₪80/night', image: '/images/community/village_of_peace_community_authentic_dimona_israel_19.jpg' }
                ].map((option, index) => (
                  <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="relative h-32">
                      <Image src={option.image} alt={option.type || "Image"} fill className="object-cover" />
                    </div>
                    <div className="p-4">
                      <h4 className="text-xl font-bold mb-2">{option.type}</h4>
                      <p className="text-gray-600 mb-3">{option.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold" style={{ color: '#478c0b' }}>{option.price}</span>
                        <button className="px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-md" style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)', color: 'white' }}>
                          Reserve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visitor Information */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-3xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Visitor Information</h3>
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Community Services</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Professional trades and services provided by skilled Village of Peace community members</p>
            </div>

            {/* Service Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { icon: 'fa-hammer', title: 'Construction & Trades', description: 'Carpentry, plumbing, electrical, and general construction services' },
                { icon: 'fa-spa', title: 'Health & Wellness', description: 'Natural healing, massage therapy, and holistic health services' },
                { icon: 'fa-graduation-cap', title: 'Education & Tutoring', description: 'Hebrew lessons, academic tutoring, and cultural education' },
                { icon: 'fa-palette', title: 'Arts & Creativity', description: 'Art classes, music lessons, and creative workshops' }
              ].map((service, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 text-center transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl border-2 border-transparent hover:border-yellow-400">
                  <div className="text-5xl mb-4" style={{ color: '#478c0b' }}>
                    <i className={`fas ${service.icon}`}></i>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <button 
                    className="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #f6af0d, #e09b00)', color: '#3a3a1d' }}
                  >
                    View Services
                  </button>
                </div>
              ))}
            </div>

            {/* Featured Service Providers */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h3 className="text-3xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Featured Service Providers</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Brother Yaacov', role: 'Master Carpenter', experience: '30+ years experience in traditional woodworking and modern construction', rating: 5, reviews: 47 },
                  { name: 'Sister Miriam', role: 'Healing Arts Practitioner', experience: 'Natural healing, herbal medicine, and spiritual wellness guidance', rating: 5, reviews: 63 },
                  { name: 'Brother David', role: 'Hebrew Language Teacher', experience: 'Biblical Hebrew and modern Hebrew instruction for all levels', rating: 5, reviews: 28 }
                ].map((provider, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 rounded-full mr-4 flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: '#478c0b' }}>
                        {provider.name.split(' ')[1][0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{provider.name}</h4>
                        <p style={{ color: '#478c0b' }}>{provider.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{provider.experience}</p>
                    <div className="flex items-center mb-4">
                      <div className="flex mr-2" style={{ color: '#f6af0d' }}>
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="fas fa-star"></i>
                        ))}
                      </div>
                      <span className="text-gray-600">({provider.reviews} reviews)</span>
                    </div>
                    <button 
                      className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)' }}
                    >
                      Contact Service
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Request Form */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-3xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Request Community Services</h3>
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
                      className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)' }}
                    >
                      Submit Request
                    </button>
                  </form>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-4" style={{ color: '#478c0b' }}>Service Guidelines</h4>
                  <div className="space-y-3">
                    {[
                      'All services provided by community members',
                      'Fair pricing and transparent billing',
                      'Quality guaranteed by community standards',
                      'Supporting local community economy',
                      'Spiritual and cultural values respected'
                    ].map((guideline, index) => (
                      <div key={index} className="flex items-start">
                        <i className="fas fa-check mt-1 mr-3" style={{ color: '#478c0b' }}></i>
                        <span>{guideline}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cultural Education Section */}
          <div className={`${activeTab === 'education' ? 'block' : 'hidden'} animate-fadeIn`}>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Cultural Education Center</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Learn about Village of Peace values, traditions, and way of life through our comprehensive educational programs</p>
            </div>

            {/* Educational Programs */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h3 className="text-3xl font-bold mb-8" style={{ color: '#3a3a1d' }}>Educational Programs</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: 'fa-language', title: 'Hebrew Language Classes', description: 'Learn Biblical and modern Hebrew with native speakers and cultural context.', duration: 'Beginner to Advanced' },
                  { icon: 'fa-history', title: 'Community History Course', description: 'Comprehensive study of Village of Peace community history and development.', duration: '8-week course' },
                  { icon: 'fa-utensils', title: 'Vegan Lifestyle Workshop', description: 'Learn the principles and practices of healthy vegan living from community experts.', duration: 'Monthly workshops' },
                  { icon: 'fa-music', title: 'Community Music & Arts', description: 'Explore traditional songs, dances, and artistic expressions of our community.', duration: 'Weekly sessions' },
                  { icon: 'fa-praying-hands', title: 'Spiritual Practices', description: 'Learn about community spiritual traditions, meditation, and prayer practices.', duration: 'Respectful observation' },
                  { icon: 'fa-seedling', title: 'Sustainable Living', description: 'Discover eco-friendly practices and sustainable agriculture methods used in VOP.', duration: 'Hands-on learning' }
                ].map((program, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6">
                    <div className="text-3xl mb-4" style={{ color: '#478c0b' }}>
                      <i className={`fas ${program.icon}`}></i>
                    </div>
                    <h4 className="text-xl font-bold mb-3">{program.title}</h4>
                    <p className="text-gray-600 mb-4">{program.description}</p>
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">{program.duration}</span>
                    </div>
                    <button 
                      className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)' }}
                    >
                      Enroll Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Workshop Schedule */}
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
              <h3 className="text-3xl font-bold mb-8" style={{ color: '#3a3a1d' }}>Weekly Workshop Schedule</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { day: 'Monday', workshops: [{ name: 'Hebrew Beginners', time: '10:00-11:30' }, { name: 'Vegan Cooking', time: '15:00-17:00' }] },
                  { day: 'Tuesday', workshops: [{ name: 'Community History', time: '9:00-10:30' }, { name: 'Music & Dance', time: '16:00-17:30' }] },
                  { day: 'Wednesday', workshops: [{ name: 'Hebrew Advanced', time: '10:00-11:30' }, { name: 'Sustainable Living', time: '14:00-16:00' }] },
                  { day: 'Thursday', workshops: [{ name: 'Spiritual Practices', time: '8:00-9:30' }, { name: 'Arts & Crafts', time: '15:00-16:30' }] },
                  { day: 'Friday', workshops: [{ name: 'Family Programs', time: '10:00-12:00' }, { name: 'Sabbath Prep', time: '14:00-15:00' }] },
                  { day: 'Sunday', workshops: [{ name: 'Community Tours', time: '9:00-12:00' }, { name: 'Cultural Exchange', time: '15:00-17:00' }] }
                ].map((schedule, index) => (
                  <div key={index} className="rounded-2xl p-6" style={{ backgroundColor: '#cfe7c1' }}>
                    <h4 className="text-lg font-bold mb-3" style={{ color: '#478c0b' }}>{schedule.day}</h4>
                    <div className="space-y-2">
                      {schedule.workshops.map((workshop, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{workshop.name}</span>
                          <span className="text-sm text-gray-600">{workshop.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Exchange Program */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-3xl font-bold mb-6" style={{ color: '#3a3a1d' }}>Cultural Exchange Program</h3>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-gray-600 mb-4">
                    Our Cultural Exchange Program connects visitors and the global diaspora with authentic Village of Peace experiences. 
                    Participants live within the community, share meals with families, and participate in daily activities.
                  </p>
                  <div className="space-y-3 mb-6">
                    {[
                      '1-4 week programs available',
                      'Homestay with community families',
                      'Work-study opportunities',
                      'Language immersion',
                      'Cultural mentorship'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <i className="fas fa-check mr-3" style={{ color: '#478c0b' }}></i>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #478c0b, #3a7209)', color: 'white' }}
                  >
                    Apply for Exchange
                  </button>
                </div>
                <div className="relative h-64 rounded-2xl overflow-hidden">
                  <Image
                    src="/images/community/village_of_peace_community_authentic_dimona_israel_21.jpg" 
                    alt="Cultural Exchange" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </Layout>
  );
};

export default AboutPage;