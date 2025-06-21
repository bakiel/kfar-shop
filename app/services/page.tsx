'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { servicesData, getServicesByCategory, getActiveServices, getUpcomingEvents, getServiceStats } from '@/lib/data/services-data';

const ServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchLiveEvents();
  }, []);

  // Helper function to get Hebrew day names
  const getHebrewDay = (day: string) => {
    const hebrewDays: { [key: string]: string } = {
      'sunday': 'Yom Rishon',
      'monday': 'Yom Sheni',
      'tuesday': 'Yom Shlishi',
      'wednesday': 'Yom Revi\'i',
      'thursday': 'Yom Chamishi',
      'friday': 'Yom Shishi',
      'saturday': 'Shabbat',
      'every thursday': 'Every Yom Chamishi'
    };
    return hebrewDays[day.toLowerCase()] || day;
  };

  const fetchLiveEvents = async () => {
    try {
      // Skip the external API call and use demo events directly
      // This avoids issues with external servers and Chrome extensions
      setLiveEvents([
        {
          id: 'demo-1',
          title: 'Village Weekly Market',
          slug: 'weekly-market',
          description: 'Thursday community market featuring local produce, crafts, and prepared foods',
          long_description: 'Join us every Thursday for our vibrant weekly market! Browse fresh organic produce, handmade crafts, delicious prepared vegan foods, and unique items from local artisans. Live music, food tastings, and a wonderful community atmosphere.',
          category: 'market',
          category_name: 'Community Market',
          category_icon: 'fa-store',
          start_date: 'Every Thursday',
          start_time: '15:00',
          end_time: '20:00',
          venue_name: 'Community Square',
          venue_address: 'Central Plaza, Village of Peace',
          is_free: true,
          recurrence_rule: 'weekly',
          tags: ['market', 'weekly', 'community', 'local', 'produce', 'crafts'],
          featured: true,
          featured_image: '/images/events/weekly-market.jpg',
          contact_email: 'market@villageofpeace.org',
          contact_phone: '+972-50-123-7890'
        },
        {
          id: 'demo-2',
          title: 'Ethiopian Vegan Cooking Workshop',
          slug: 'ethiopian-cooking-workshop',
          description: 'Learn to make authentic Ethiopian vegan dishes',
          long_description: 'Join Chef Miriam for an immersive cooking workshop where you\'ll learn to prepare traditional Ethiopian vegan dishes including injera bread, various vegetable stews, and spice blends. All ingredients provided.',
          category: 'workshop',
          category_name: 'Workshops',
          category_icon: 'fa-chalkboard-teacher',
          start_date: 'February 15, 2025',
          start_time: '14:00',
          end_time: '17:00',
          venue_name: 'Community Kitchen',
          venue_address: 'Education Center, Village of Peace',
          is_free: false,
          price_range: '₪120 per person',
          registration_required: true,
          special_features: ['Hands-on cooking', 'Recipe booklet included', 'Take home your creations'],
          tags: ['cooking', 'workshop', 'ethiopian', 'vegan', 'education'],
          featured_image: '/images/events/cooking-workshop.jpg',
          contact_name: 'Chef Miriam',
          contact_phone: '+972-50-456-7890',
          contact_email: 'workshops@tevadeli.com'
        },
        {
          id: 'demo-3',
          title: 'African Hebrew Music Festival',
          slug: 'music-festival-2025',
          description: 'Celebrate our musical heritage with live performances',
          long_description: 'An evening of traditional and contemporary African Hebrew music featuring local artists, guest performers, and community choir. Food vendors, art displays, and dancing under the stars.',
          category: 'cultural',
          category_name: 'Cultural Events',
          category_icon: 'fa-palette',
          start_date: 'March 21, 2025',
          start_time: '18:00',
          end_time: '23:00',
          venue_name: 'Amphitheater',
          venue_address: 'Cultural Center, Village of Peace',
          is_free: true,
          special_features: ['Live performances', 'Food vendors', 'Art displays', 'Dancing'],
          tags: ['music', 'festival', 'cultural', 'community', 'celebration'],
          featured: true,
          featured_image: '/images/events/music-festival.jpg',
          contact_email: 'culture@villageofpeace.org'
        }
      ]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const stats = getServiceStats();
  
  // Extract all services from categories
  const services = servicesData.flatMap(category => category.services);
  const serviceCategories = servicesData;

  // Filter services based on category and search
  let filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = !showOnlyActive || service.status === 'active';
    
    return matchesCategory && matchesSearch && matchesStatus;
  });

  // If Events & Community category is selected, also include live events as services
  if (selectedCategory === 'events-community' && liveEvents.length > 0) {
    const eventServices = liveEvents.map(event => ({
      id: event.id,
      name: event.title || event.name,
      slug: event.slug,
      category: 'events-community',
      status: 'active' as const,
      icon: event.category_icon || 'fa-calendar',
      description: event.description,
      longDescription: event.long_description,
      provider: event.organizer_name || 'Village of Peace',
      contact: {
        phone: event.contact_phone,
        email: event.contact_email,
        whatsapp: event.contact_whatsapp
      },
      operatingHours: [{
        day: event.start_date || 'Upcoming',
        open: event.start_time || '',
        close: event.end_time || ''
      }],
      location: {
        address: event.venue_address || '',
        area: event.venue_name || 'Village of Peace'
      },
      priceRange: event.is_free ? 'Free' : event.price_range,
      tags: event.tags || [],
      featured: event.featured || false,
      event: {
        date: event.start_date,
        time: `${event.start_time} - ${event.end_time}`,
        venue: event.venue_name,
        registrationRequired: event.registration_required
      }
    }));
    
    // Add event services to the beginning of filtered services
    filteredServices = [...eventServices, ...filteredServices];
  }

  // Use live events if available, fallback to static data
  const upcomingEvents = liveEvents.length > 0 ? liveEvents : getUpcomingEvents().slice(0, 3);

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: '#fef9ef' }}>
        {/* Hero Section */}
        <section 
          className="py-20 text-white relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #478c0b, #f6af0d)',
            minHeight: '400px'
          }}
        >
          {/* Community Background Image */}
          <div className="absolute inset-0">
            <img 
              src="/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_10.jpg"
              alt="Village of Peace Community"
              className="w-full h-full object-cover opacity-20"
              onError={(e) => {
                e.currentTarget.src = '/images/backgrounds/1.jpg';
              }}
            />
          </div>
          
          {/* Background Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`
            }} />
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">Community Services</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Discover authentic services from the Village of Peace community - from essential home services to cultural events and professional expertise
            </p>
            
            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{stats.active}</div>
                <div className="text-sm opacity-90">Active Services</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-sm opacity-90">Total Services</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{stats.categories}</div>
                <div className="text-sm opacity-90">Categories</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white shadow-sm sticky top-24 z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search services, providers, or keywords..."
                    className="w-full px-12 py-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-all text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="fas fa-times text-xl"></i>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Active Only Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: '#478c0b' }}
                />
                <span className="font-medium" style={{ color: '#3a3a1d' }}>Active Only</span>
              </label>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="py-6 bg-gray-50 border-b">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: selectedCategory === 'all' ? '#478c0b' : undefined
                }}
              >
                <i className="fas fa-th-large mr-2"></i>
                All Services ({filteredServices.length})
              </button>
              
              {serviceCategories.map(category => {
                const categoryServices = getServicesByCategory(category.id);
                const activeCount = categoryServices.filter(s => s.status === 'active').length;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? 'text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: selectedCategory === category.id ? category.color : undefined
                    }}
                  >
                    <i className={`fas ${category.icon}`}></i>
                    {category.name}
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      {activeCount}/{categoryServices.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              {/* Sidebar - Upcoming Events */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-xl shadow-lg p-6 sticky top-48">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                    <i className="fas fa-calendar-alt" style={{ color: '#f6af0d' }}></i>
                    Upcoming Events
                  </h3>
                  
                  {loadingEvents ? (
                    <div className="text-center py-4">
                      <i className="fas fa-spinner fa-spin text-gray-400"></i>
                    </div>
                  ) : upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map(event => {
                        // Handle both live events and static service events
                        const isLiveEvent = 'title' in event;
                        const eventName = isLiveEvent ? event.title : event.name;
                        const eventSlug = event.slug;
                        const eventIcon = isLiveEvent ? (event.category_icon || 'fa-calendar') : event.icon;
                        const eventDate = isLiveEvent ? event.start_date : event.event?.date;
                        const eventTime = isLiveEvent ? `${event.start_time} - ${event.end_time}` : event.event?.time;
                        
                        return (
                          <div
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowEventModal(true);
                            }}
                            className="block p-4 rounded-lg border-2 border-gray-100 hover:border-yellow-400 transition-all hover:shadow-md cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f6af0d20' }}>
                                <i className={`fas ${eventIcon} text-sm`} style={{ color: '#f6af0d' }}></i>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm" style={{ color: '#3a3a1d' }}>{eventName}</h4>
                                {(eventDate || eventTime) && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {eventDate} {eventTime && `• ${eventTime}`}
                                  </p>
                                )}
                                {isLiveEvent && event.venue_name && (
                                  <p className="text-xs text-gray-500">{event.venue_name}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No upcoming events</p>
                  )}
                  
                  <button
                    onClick={() => setSelectedCategory('events-community')}
                    className="block w-full mt-6 text-center py-3 rounded-lg font-medium transition-all hover:shadow-md"
                    style={{ backgroundColor: '#f6af0d20', color: '#f6af0d' }}
                  >
                    View All Events
                  </button>
                </div>
              </div>

              {/* Services Grid */}
              <div className="md:col-span-3">
                {filteredServices.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredServices.map((service, index) => {
                      const category = serviceCategories.find(c => c.id === service.category);
                      
                      return (
                        <div
                          key={service.id}
                          className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                          }`}
                          style={{ 
                            animationDelay: `${index * 50}ms`,
                            transitionDelay: `${index * 50}ms`
                          }}
                        >
                          {/* Service Header */}
                          <div 
                            className="p-6 text-white relative overflow-hidden"
                            style={{
                              background: service.status === 'active' 
                                ? `linear-gradient(135deg, ${category?.color}, ${category?.color}dd)`
                                : 'linear-gradient(135deg, #9ca3af, #6b7280)'
                            }}
                          >
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <i className={`fas ${service.icon} text-6xl absolute -right-4 -top-4 transform rotate-12`}></i>
                            </div>
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                  <i className={`fas ${service.icon} text-2xl`}></i>
                                </div>
                                {service.featured && (
                                  <span className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                                    Featured
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="text-xl font-bold mb-1">{service.name}</h3>
                              <p className="text-sm opacity-90">{service.provider}</p>
                              
                              {service.rating && (
                                <div className="flex items-center gap-2 mt-3">
                                  <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <i 
                                        key={i} 
                                        className={`fas fa-star text-xs ${i < Math.floor(service.rating!) ? 'text-yellow-300' : 'text-white/30'}`}
                                      ></i>
                                    ))}
                                  </div>
                                  <span className="text-xs">({service.reviewCount} reviews)</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Service Body */}
                          <div className="p-6">
                            <p className="text-gray-600 mb-4">{service.description}</p>
                            
                            {/* Service Details */}
                            <div className="space-y-3 mb-4">
                              {service.operatingHours && (
                                <div className="flex items-center gap-3 text-sm">
                                  <i className="fas fa-clock" style={{ color: '#478c0b', width: '20px' }}></i>
                                  <span className="text-gray-600">
                                    {service.operatingHours.sunday || 'Hours vary - contact for details'}
                                  </span>
                                </div>
                              )}
                              
                              {service.location && (
                                <div className="flex items-center gap-3 text-sm">
                                  <i className="fas fa-map-marker-alt" style={{ color: '#f6af0d', width: '20px' }}></i>
                                  <span className="text-gray-600">{service.location.area}</span>
                                </div>
                              )}
                              
                              {service.priceRange && (
                                <div className="flex items-center gap-3 text-sm">
                                  <i className="fas fa-shekel-sign" style={{ color: '#c23c09', width: '20px' }}></i>
                                  <span className="text-gray-600">{service.priceRange}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Tags */}
                            {service.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {service.tags.slice(0, 3).map(tag => (
                                  <span 
                                    key={tag}
                                    className="px-3 py-1 rounded-full text-xs font-medium"
                                    style={{ 
                                      backgroundColor: `${category?.color}20`,
                                      color: category?.color
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              {service.status === 'active' ? (
                                <>
                                  <Link
                                    href={`/services/${service.slug}`}
                                    className="flex-1 py-3 rounded-lg font-medium text-center transition-all hover:shadow-md"
                                    style={{ 
                                      backgroundColor: `${category?.color}20`,
                                      color: category?.color
                                    }}
                                  >
                                    View Details
                                  </Link>
                                  {service.contact.phone && (
                                    <a
                                      href={`tel:${service.contact.phone}`}
                                      className="px-4 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all"
                                    >
                                      <i className="fas fa-phone"></i>
                                    </a>
                                  )}
                                </>
                              ) : (
                                <div className="flex-1 py-3 rounded-lg font-medium text-center bg-gray-100 text-gray-500">
                                  <i className="fas fa-clock mr-2"></i>
                                  Coming Soon
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                    <h3 className="text-2xl font-bold text-gray-600 mb-2">No services found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
          {/* Community Background Image */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
              style={{
                backgroundImage: `url('/images/community/village_of_peace_community_authentic_dimona_israel_african_hebrew_israelites_01.jpg')`,
                backgroundAttachment: 'fixed'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-transparent to-white/95" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                Become a Service Provider
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join our growing community of trusted service providers. Connect with thousands of customers seeking quality services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/vendor/onboarding"
                  className="px-8 py-4 rounded-xl text-white font-semibold hover:shadow-lg transition-all"
                  style={{ backgroundColor: '#478c0b' }}
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  Add Your Service
                </Link>
                <Link
                  href="/support"
                  className="px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                  style={{ 
                    backgroundColor: '#f6af0d20',
                    color: '#f6af0d'
                  }}
                >
                  <i className="fas fa-info-circle mr-2"></i>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Event Detail Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowEventModal(false)}>
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
              
              <div 
                className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                style={{
                  animation: 'fadeIn 0.3s ease-in-out'
                }}
              >
                {/* Event Image */}
                {selectedEvent.featured_image && (
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={selectedEvent.featured_image} 
                      alt={selectedEvent.title || selectedEvent.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/backgrounds/1.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                )}
                
                {/* Modal Header with Gradient */}
                <div 
                  className={`relative text-white p-8 ${selectedEvent.featured_image ? '-mt-24' : 'h-40'} pb-12`}
                  style={{ 
                    background: selectedEvent.featured_image ? 'transparent' : 'linear-gradient(135deg, #478c0b, #f6af0d)'
                  }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <i className="fas fa-times text-white"></i>
                  </button>
                  
                  {/* Event Category Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                    <i className={`fas ${selectedEvent.category_icon || 'fa-calendar'} text-sm`}></i>
                    <span className="text-sm font-medium capitalize">
                      {selectedEvent.category_name || selectedEvent.category || 'Event'}
                    </span>
                  </div>
                  
                  <h2 className="text-4xl font-bold mb-2">
                    {selectedEvent.title || selectedEvent.name}
                  </h2>
                  
                  <p className="text-xl opacity-90">
                    {selectedEvent.venue_name || selectedEvent.location?.area || 'Village of Peace'}
                  </p>
                </div>
                
                {/* Modal Body */}
                <div className="p-8 -mt-8">
                  {/* Event Info Cards */}
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {/* Date & Time Card */}
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <i className="fas fa-calendar-alt text-2xl mb-2" style={{ color: '#f6af0d' }}></i>
                      <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>Date & Time</h4>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {getHebrewDay(selectedEvent.start_date || selectedEvent.event?.date || 'Upcoming')}
                      </p>
                      <p className="text-xs text-gray-500">
                        ({selectedEvent.start_date || selectedEvent.event?.date || 'Upcoming'})
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedEvent.start_time} - {selectedEvent.end_time || selectedEvent.event?.time || 'TBD'}
                      </p>
                      {selectedEvent.recurrence_rule && (
                        <p className="text-xs text-green-600 mt-2">
                          <i className="fas fa-sync mr-1"></i>
                          {selectedEvent.recurrence_rule === 'weekly' ? 'Every week' : selectedEvent.recurrence_rule}
                        </p>
                      )}
                    </div>
                    
                    {/* Location Card */}
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <i className="fas fa-map-marker-alt text-2xl mb-2" style={{ color: '#c23c09' }}></i>
                      <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>Location</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedEvent.venue_name || 'Community Center'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedEvent.venue_address || selectedEvent.venue_area || 'Village of Peace, Dimona'}
                      </p>
                    </div>
                    
                    {/* Price Card */}
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <i className="fas fa-ticket-alt text-2xl mb-2" style={{ color: '#478c0b' }}></i>
                      <h4 className="font-semibold" style={{ color: '#3a3a1d' }}>Entry</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedEvent.is_free ? 'Free Entry' : (selectedEvent.price_range || selectedEvent.priceRange || 'Contact for pricing')}
                      </p>
                      {selectedEvent.registration_required && (
                        <p className="text-xs text-orange-600 mt-2">
                          <i className="fas fa-user-check mr-1"></i>
                          Registration required
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
                      About This Event
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {selectedEvent.long_description || selectedEvent.description}
                    </p>
                    
                    {/* Features */}
                    {selectedEvent.special_features && selectedEvent.special_features.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3" style={{ color: '#3a3a1d' }}>Event Features</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          {selectedEvent.special_features.map((feature: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <i className="fas fa-check-circle" style={{ color: '#478c0b' }}></i>
                              <span className="text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                      <div className="mt-6">
                        <div className="flex flex-wrap gap-2">
                          {selectedEvent.tags.map((tag: string) => (
                            <span 
                              key={tag}
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: '#478c0b20',
                                color: '#478c0b'
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Contact & Actions */}
                  <div className="border-t pt-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                      {/* Contact Info */}
                      <div className="flex gap-6">
                        {selectedEvent.contact_phone && (
                          <a 
                            href={`tel:${selectedEvent.contact_phone}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <i className="fas fa-phone"></i>
                            <span>{selectedEvent.contact_phone}</span>
                          </a>
                        )}
                        {selectedEvent.contact_email && (
                          <a 
                            href={`mailto:${selectedEvent.contact_email}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <i className="fas fa-envelope"></i>
                            <span>Email</span>
                          </a>
                        )}
                        {selectedEvent.contact_whatsapp && (
                          <a 
                            href={`https://wa.me/${selectedEvent.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <i className="fab fa-whatsapp"></i>
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {selectedEvent.registration_required ? (
                          <button 
                            className="px-6 py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            style={{ backgroundColor: '#478c0b' }}
                          >
                            <i className="fas fa-user-plus mr-2"></i>
                            Register Now
                          </button>
                        ) : (
                          <button 
                            className="px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                            style={{ 
                              backgroundColor: '#f6af0d20',
                              color: '#f6af0d'
                            }}
                          >
                            <i className="fas fa-calendar-plus mr-2"></i>
                            Add to Calendar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ServicesPage;