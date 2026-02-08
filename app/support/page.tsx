'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';

const SupportPage = () => {
  const [activeSection, setActiveSection] = useState('contact');
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  const [language, setLanguage] = useState('en');

  const showSection = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'he' : 'en');
  };

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
              src="/images/hero/15.jpg"
              alt="Village of Peace Community Support"
              className="w-full h-full object-cover opacity-20"
              onError={(e) => {
                e.currentTarget.src = '/images/backgrounds/2.jpg';
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">Support & Information</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">Complete guidance for your KiFar Marketplace experience</p>
            
            {/* Navigation Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeSection === 'contact' 
                    ? 'bg-yellow-500 text-gray-800' 
                    : 'bg-green-600 text-white hover:bg-transparent hover:text-white hover:border-2 hover:border-green-600'
                }`}
                onClick={() => showSection('contact')}
              >
                <i className="fas fa-headset"></i>
                Contact & Support
              </button>
              <button 
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeSection === 'faq' 
                    ? 'bg-yellow-500 text-gray-800' 
                    : 'bg-green-600 text-white hover:bg-transparent hover:text-white hover:border-2 hover:border-green-600'
                }`}
                onClick={() => showSection('faq')}
              >
                <i className="fas fa-question-circle"></i>
                FAQ & Help
              </button>
              <button 
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeSection === 'shipping' 
                    ? 'bg-yellow-500 text-gray-800' 
                    : 'bg-green-600 text-white hover:bg-transparent hover:text-white hover:border-2 hover:border-green-600'
                }`}
                onClick={() => showSection('shipping')}
              >
                <i className="fas fa-shipping-fast"></i>
                Shipping & Returns
              </button>
              <button 
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeSection === 'privacy' 
                    ? 'bg-yellow-500 text-gray-800' 
                    : 'bg-green-600 text-white hover:bg-transparent hover:text-white hover:border-2 hover:border-green-600'
                }`}
                onClick={() => showSection('privacy')}
              >
                <i className="fas fa-shield-alt"></i>
                Privacy & Terms
              </button>
            </div>
          </div>
        </section>

        {/* Contact & Support Section */}
        <section className={`py-16 ${activeSection === 'contact' ? 'block' : 'hidden'}`} style={{ backgroundColor: '#f9fafb' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Contact & Support</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Connect with our Village of Peace community for help, guidance, and support</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8" style={{ borderLeft: '4px solid #cfe7c1' }}>
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Get In Touch</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300" style={{ border: '2px solid transparent' }}>
                    <i className="fas fa-map-marker-alt text-2xl mr-4" style={{ color: '#478c0b' }}></i>
                    <div>
                      <h4 className="font-semibold">Visit Us</h4>
                      <p className="text-gray-600">Village of Peace, Dimona, Israel</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300" style={{ border: '2px solid transparent' }}>
                    <i className="fas fa-phone text-2xl mr-4" style={{ color: '#478c0b' }}></i>
                    <div>
                      <h4 className="font-semibold">Call Us</h4>
                      <p className="text-gray-600">+972-8-6567788</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300" style={{ border: '2px solid transparent' }}>
                    <i className="fas fa-envelope text-2xl mr-4" style={{ color: '#478c0b' }}></i>
                    <div>
                      <h4 className="font-semibold">Email Support</h4>
                      <p className="text-gray-600">support@kfar.org</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300" style={{ border: '2px solid transparent' }}>
                    <i className="fas fa-clock text-2xl mr-4" style={{ color: '#478c0b' }}></i>
                    <div>
                      <h4 className="font-semibold">Support Hours</h4>
                      <p className="text-gray-600">Sunday-Thursday: 8:00-18:00</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Support */}
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <h4 className="font-semibold mb-4">Quick Support QR</h4>
                  <div className="w-32 h-32 bg-gray-200 mx-auto mb-4 flex items-center justify-center rounded-lg">
                    <i className="fas fa-qrcode text-4xl text-gray-400"></i>
                  </div>
                  <p className="text-sm text-gray-600">Scan for instant support access</p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Send Us a Message</h3>
                
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const button = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
                  const originalText = button.innerHTML;
                  button.innerHTML = '<span class="flex items-center justify-center gap-2"><i class="fas fa-check"></i>Message Sent!</span>';
                  button.style.backgroundColor = '#22c55e';
                  
                  setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.backgroundColor = '#478c0b';
                    (e.target as HTMLFormElement).reset();
                  }, 3000);
                }}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input type="text" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors" placeholder="Your first name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input type="text" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors" placeholder="Your last name" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors" placeholder="your.email@example.com" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors">
                      <option>General Inquiry</option>
                      <option>Order Support</option>
                      <option>Technical Issue</option>
                      <option>Vendor Question</option>
                      <option>Community Information</option>
                      <option>Tourism Inquiry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors h-32" placeholder="How can we help you?"></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#478c0b' }}
                  >
                    <i className="fas fa-paper-plane"></i>
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-white rounded-2xl shadow-lg p-8" style={{ borderLeft: '4px solid #cfe7c1' }}>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Community Guidelines</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#478c0b' }}>Cultural Respect</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Honor AHIC values and traditions
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Respectful communication with community members
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Appropriate language and behavior
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Cultural sensitivity in all interactions
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#478c0b' }}>Marketplace Ethics</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Honest reviews and feedback
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Fair dealing with vendors
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Respectful dispute resolution
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Community-first approach
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ & Help Section */}
        <section className={`py-16 ${activeSection === 'faq' ? 'block' : 'hidden'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">FAQ & Help Center</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Find answers to common questions about KiFar Marketplace</p>
            </div>

            {/* Search Box */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 transition-colors" 
                  placeholder="Search for help topics..."
                />
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* FAQ Categories */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderLeft: '4px solid #cfe7c1' }}>
                <i className="fas fa-shopping-cart text-4xl mb-4" style={{ color: '#478c0b' }}></i>
                <h3 className="text-xl font-semibold mb-2">Shopping & Orders</h3>
                <p className="text-gray-600">Questions about purchasing, cart, and order management</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderLeft: '4px solid #cfe7c1' }}>
                <i className="fas fa-credit-card text-4xl mb-4" style={{ color: '#f6af0d' }}></i>
                <h3 className="text-xl font-semibold mb-2">Payments & QR</h3>
                <p className="text-gray-600">Payment methods, QR codes, and billing questions</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ borderLeft: '4px solid #cfe7c1' }}>
                <i className="fas fa-users text-4xl mb-4" style={{ color: '#c23c09' }}></i>
                <h3 className="text-xl font-semibold mb-2">Community & Culture</h3>
                <p className="text-gray-600">Questions about VOP community and AHIC values</p>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(0)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">How do I use QR codes for payment?</h4>
                    <i className={`fas fa-chevron-down transition-transform duration-300 ${activeFAQ === 0 ? 'rotate-180' : ''}`}></i>
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${activeFAQ === 0 ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="p-6 bg-gray-50">
                    <p className="text-gray-600 mb-4">QR codes are the primary payment method at KiFar Marketplace. Here's how to use them:</p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                      <li>Complete your shopping and proceed to checkout</li>
                      <li>A unique QR code will be generated for your order</li>
                      <li>Open your mobile payment app (bank app, digital wallet, etc.)</li>
                      <li>Scan the QR code with your phone's camera</li>
                      <li>Confirm the payment amount and complete the transaction</li>
                      <li>You'll receive instant confirmation and order processing</li>
                    </ol>
                    <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: '#cfe7c1' }}>
                      <p><strong>Tip:</strong> QR codes support multiple currencies (₪, $, €, £) and work with all major Israeli and international payment systems.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(1)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">What makes KiFar Marketplace special?</h4>
                    <i className={`fas fa-chevron-down transition-transform duration-300 ${activeFAQ === 1 ? 'rotate-180' : ''}`}></i>
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${activeFAQ === 1 ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="p-6 bg-gray-50">
                    <p className="text-gray-600 mb-4">KiFar Marketplace is more than just an e-commerce platform:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600">
                      <li><strong>Community-Centered:</strong> All vendors are Village of Peace community businesses</li>
                      <li><strong>Cultural Authenticity:</strong> Products reflect 50+ years of AHIC heritage</li>
                      <li><strong>Ethical Commerce:</strong> 100% vegan products with fair trade practices</li>
                      <li><strong>Global Connection:</strong> Connects VOP with worldwide diaspora community</li>
                      <li><strong>QR-First Technology:</strong> Modern payment solutions with traditional values</li>
                      <li><strong>Educational Experience:</strong> Learn about AHIC culture while shopping</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(2)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">How do I become a vendor on KiFar Marketplace?</h4>
                    <i className={`fas fa-chevron-down transition-transform duration-300 ${activeFAQ === 2 ? 'rotate-180' : ''}`}></i>
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${activeFAQ === 2 ? 'max-h-[600px]' : 'max-h-0'}`}>
                  <div className="p-6 bg-gray-50">
                    <p className="text-gray-600 mb-4">Becoming a KFAR vendor requires community alignment and quality standards:</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold mb-2" style={{ color: '#478c0b' }}>Requirements:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>Community member or alignment with AHIC values</li>
                          <li>100% vegan product offerings</li>
                          <li>Quality standards compliance</li>
                          <li>Business license and documentation</li>
                          <li>Cultural sensitivity and respect</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2" style={{ color: '#478c0b' }}>Application Process:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>Submit vendor application form</li>
                          <li>Business verification and review</li>
                          <li>Community alignment assessment</li>
                          <li>Product quality evaluation</li>
                          <li>Interview with community leaders</li>
                          <li>Onboarding and training</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(3)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">Can tourists and visitors use KiFar Marketplace?</h4>
                    <i className={`fas fa-chevron-down transition-transform duration-300 ${activeFAQ === 3 ? 'rotate-180' : ''}`}></i>
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${activeFAQ === 3 ? 'max-h-[600px]' : 'max-h-0'}`}>
                  <div className="p-6 bg-gray-50">
                    <p className="text-gray-600 mb-4">Absolutely! KiFar Marketplace welcomes visitors and provides special support:</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold mb-2" style={{ color: '#478c0b' }}>Visitor Features:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>Multi-currency support (₪, $, €, £)</li>
                          <li>International shipping options</li>
                          <li>Cultural education and context</li>
                          <li>Tourist-specific product recommendations</li>
                          <li>Guest checkout (no account required)</li>
                          <li>Hebrew and English language support</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2" style={{ color: '#478c0b' }}>Special Services:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>Visitor welcome packages</li>
                          <li>Cultural significance explanations</li>
                          <li>Gift wrapping and shipping assistance</li>
                          <li>Tourism experience integration</li>
                          <li>Memory preservation services</li>
                          <li>Follow-up connection opportunities</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleFAQ(4)}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-semibold">What if I have problems with my order?</h4>
                    <i className={`fas fa-chevron-down transition-transform duration-300 ${activeFAQ === 4 ? 'rotate-180' : ''}`}></i>
                  </div>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ${activeFAQ === 4 ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="p-6 bg-gray-50">
                    <p className="text-gray-600 mb-4">We're committed to resolving any issues quickly and fairly:</p>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl" style={{ backgroundColor: '#cfe7c1' }}>
                        <h5 className="font-semibold mb-2">Immediate Steps:</h5>
                        <p className="text-gray-600">Contact us immediately via phone (+972-8-6567788), email (support@kfar.org), or QR code support. Our community-centered approach ensures personal attention to every concern.</p>
                      </div>
                      <div>
                        <h5 className="font-semibold mb-2" style={{ color: '#478c0b' }}>Common Resolutions:</h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          <li>Direct communication with vendor for quick resolution</li>
                          <li>Full refund or replacement for defective products</li>
                          <li>Community mediation for dispute resolution</li>
                          <li>Cultural sensitivity support for misunderstandings</li>
                          <li>Express shipping for delayed orders</li>
                          <li>Personal follow-up from community leaders</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Shipping & Returns Section */}
        <section className={`py-16 ${activeSection === 'shipping' ? 'block' : 'hidden'}`} style={{ backgroundColor: '#f9fafb' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Shipping & Returns</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Complete policies and procedures for delivery and returns</p>
            </div>

            {/* Shipping Options */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" style={{ borderLeft: '4px solid #478c0b' }}>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Shipping Options</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300" style={{ border: '2px solid transparent' }}>
                  <i className="fas fa-home text-3xl mb-4" style={{ color: '#478c0b' }}></i>
                  <h4 className="font-semibold mb-2">Local Pickup</h4>
                  <p className="text-gray-600 text-sm">Collect from VOP vendors</p>
                  <p className="font-semibold mt-2" style={{ color: '#478c0b' }}>Free</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300" style={{ border: '2px solid transparent' }}>
                  <i className="fas fa-truck text-3xl mb-4 text-blue-600"></i>
                  <h4 className="font-semibold mb-2">Local Delivery</h4>
                  <p className="text-gray-600 text-sm">Dimona & surrounding areas</p>
                  <p className="text-blue-600 font-semibold mt-2">₪25-50</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300" style={{ border: '2px solid transparent' }}>
                  <i className="fas fa-shipping-fast text-3xl mb-4" style={{ color: '#f6af0d' }}></i>
                  <h4 className="font-semibold mb-2">National Shipping</h4>
                  <p className="text-gray-600 text-sm">Throughout Israel</p>
                  <p className="font-semibold mt-2" style={{ color: '#f6af0d' }}>₪15-35</p>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300" style={{ border: '2px solid transparent' }}>
                  <i className="fas fa-globe text-3xl mb-4" style={{ color: '#c23c09' }}></i>
                  <h4 className="font-semibold mb-2">International</h4>
                  <p className="text-gray-600 text-sm">Global diaspora delivery</p>
                  <p className="font-semibold mt-2" style={{ color: '#c23c09' }}>$15-85</p>
                </div>
              </div>

              <div className="p-6 rounded-xl" style={{ backgroundColor: '#cfe7c1' }}>
                <h4 className="font-semibold mb-3">Community Member Benefits</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <i className="fas fa-star mr-2" style={{ color: '#f6af0d' }}></i>
                    VOP residents: Free local delivery
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-star mr-2" style={{ color: '#f6af0d' }}></i>
                    Community members: 50% off national shipping
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-star mr-2" style={{ color: '#f6af0d' }}></i>
                    Diaspora members: Special international rates
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-star mr-2" style={{ color: '#f6af0d' }}></i>
                    Bulk orders: Additional shipping discounts
                  </li>
                </ul>
              </div>
            </div>

            {/* Processing Times */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" style={{ borderLeft: '4px solid #478c0b' }}>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Processing & Delivery Times</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#478c0b' }}>Order Processing</h4>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <i className="fas fa-clock mr-2" style={{ color: '#478c0b' }}></i>
                      <strong>Standard Orders:</strong> 1-2 business days
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-clock mr-2" style={{ color: '#478c0b' }}></i>
                      <strong>Custom Products:</strong> 3-7 business days
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-clock mr-2" style={{ color: '#478c0b' }}></i>
                      <strong>Bulk Orders:</strong> 2-5 business days
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-clock mr-2" style={{ color: '#478c0b' }}></i>
                      <strong>Holiday Items:</strong> 1-3 business days
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-blue-600">Delivery Estimates</h4>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">
                      <i className="fas fa-truck mr-2 text-blue-500"></i>
                      <strong>Local (Dimona):</strong> Same day or next day
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-truck mr-2 text-blue-500"></i>
                      <strong>Israel:</strong> 1-3 business days
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-truck mr-2 text-blue-500"></i>
                      <strong>International:</strong> 5-14 business days
                    </li>
                    <li className="flex items-center">
                      <i className="fas fa-truck mr-2 text-blue-500"></i>
                      <strong>Express:</strong> 1-2 business days (additional cost)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Returns Policy */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" style={{ borderLeft: '4px solid #478c0b' }}>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Returns & Exchanges</h3>
              
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#478c0b' }}>Return Window</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      30 days for most products
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      7 days for perishable items
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      14 days for custom orders
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      No time limit for defective items
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-blue-600">Return Conditions</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2 text-blue-500"></i>
                      Items in original packaging
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2 text-blue-500"></i>
                      Unused and in original condition
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2 text-blue-500"></i>
                      Include order receipt or QR code
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2 text-blue-500"></i>
                      Contact vendor before returning
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-6 rounded-xl" style={{ backgroundColor: '#cfe7c1' }}>
                <h4 className="font-semibold mb-3">Easy QR Return Process</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Scan your order confirmation QR code</li>
                  <li>Select "Return Item" from the options</li>
                  <li>Choose reason for return and upload photos if needed</li>
                  <li>Print return label or arrange pickup</li>
                  <li>Track return progress and receive refund notification</li>
                </ol>
              </div>
            </div>

            {/* International Shipping */}
            <div className="bg-white rounded-2xl shadow-lg p-8" style={{ borderLeft: '4px solid #478c0b' }}>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">International Shipping</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <i className="fas fa-globe-americas text-4xl mb-4" style={{ color: '#478c0b' }}></i>
                  <h4 className="font-semibold mb-2">Americas</h4>
                  <p className="text-gray-600 text-sm mb-2">USA, Canada, South America</p>
                  <p className="font-semibold" style={{ color: '#478c0b' }}>7-14 days</p>
                </div>
                
                <div className="text-center">
                  <i className="fas fa-globe-europe text-4xl mb-4 text-blue-600"></i>
                  <h4 className="font-semibold mb-2">Europe</h4>
                  <p className="text-gray-600 text-sm mb-2">EU, UK, Scandinavia</p>
                  <p className="text-blue-600 font-semibold">5-10 days</p>
                </div>
                
                <div className="text-center">
                  <i className="fas fa-globe-asia text-4xl mb-4" style={{ color: '#f6af0d' }}></i>
                  <h4 className="font-semibold mb-2">Asia & Australia</h4>
                  <p className="text-gray-600 text-sm mb-2">Asia-Pacific region</p>
                  <p className="font-semibold" style={{ color: '#f6af0d' }}>10-21 days</p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <h4 className="font-semibold mb-2 text-yellow-800">Important International Notes</h4>
                <ul className="space-y-1 text-yellow-700 text-sm">
                  <li>• Customs duties and taxes may apply in destination country</li>
                  <li>• Some products may have shipping restrictions</li>
                  <li>• Delivery times may vary during holidays</li>
                  <li>• All international orders require customs declarations</li>
                  <li>• Contact us for special shipping arrangements</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy & Terms Section */}
        <section className={`py-16 ${activeSection === 'privacy' ? 'block' : 'hidden'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Privacy & Terms</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">Legal information and policies governing KiFar Marketplace</p>
            </div>

            {/* Privacy Policy */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" style={{ borderLeft: '4px solid #478c0b' }}>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Privacy Policy</h3>
              
              <div className="space-y-6 text-gray-600">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Information We Collect</h4>
                  <p className="mb-4">We collect information to provide better services to all our users and to honor our community values:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Personal Information:</strong> Name, email, phone number, and shipping address when you create an account or make a purchase</li>
                    <li><strong>Payment Information:</strong> Secure payment data processed through encrypted QR systems</li>
                    <li><strong>Community Status:</strong> Village of Peace membership status for community benefits</li>
                    <li><strong>Shopping Behavior:</strong> Products viewed, purchases made, and preferences to improve recommendations</li>
                    <li><strong>Technical Information:</strong> Device information, IP address, and usage data for security and optimization</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">How We Use Your Information</h4>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Process orders and provide customer service</li>
                    <li>Communicate about orders, community events, and marketplace updates</li>
                    <li>Personalize your shopping experience and recommendations</li>
                    <li>Maintain security and prevent fraud</li>
                    <li>Improve our platform and services</li>
                    <li>Connect you with community resources and benefits</li>
                  </ul>
                </div>

                <div className="p-6 rounded-xl" style={{ backgroundColor: '#cfe7c1' }}>
                  <h4 className="font-semibold mb-3">Community Commitment</h4>
                  <p>As a Village of Peace community platform, we are committed to protecting your privacy with the same care and respect we show in our personal relationships. Your data is never sold to third parties, and we only share information when necessary to fulfill your orders or comply with legal requirements.</p>
                </div>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" style={{ borderLeft: '4px solid #478c0b' }}>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Terms of Service</h3>
              
              <div className="space-y-6 text-gray-600">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Marketplace Agreement</h4>
                  <p className="mb-4">By using KiFar Marketplace, you agree to these terms and our community values:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Respectful interaction with vendors and community members</li>
                    <li>Honest reviews and feedback about products and services</li>
                    <li>Compliance with payment terms and marketplace policies</li>
                    <li>Cultural sensitivity in all communications and interactions</li>
                    <li>Responsible use of the platform and its features</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Community Standards</h4>
                  <p className="mb-4">KiFar Marketplace upholds the values of the Village of Peace community:</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Honor AHIC spiritual and cultural values</li>
                      <li>Support vegan and ethical product standards</li>
                      <li>Promote community economic development</li>
                      <li>Maintain respectful and honest communication</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Preserve and share cultural heritage</li>
                      <li>Support global diaspora connections</li>
                      <li>Encourage learning and cultural exchange</li>
                      <li>Foster community prosperity and growth</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* User Rights */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" style={{ borderLeft: '4px solid #478c0b' }}>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Your Rights & Responsibilities</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4" style={{ color: '#478c0b' }}>Your Rights</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Access and update your personal information
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Delete your account and data
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Opt out of marketing communications
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Request data portability
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Fair treatment and dispute resolution
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check mt-1 mr-2" style={{ color: '#478c0b' }}></i>
                      Cultural respect and sensitivity
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-blue-600">Your Responsibilities</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-user-check mt-1 mr-2 text-blue-500"></i>
                      Provide accurate account information
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-user-check mt-1 mr-2 text-blue-500"></i>
                      Respect community values and guidelines
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-user-check mt-1 mr-2 text-blue-500"></i>
                      Honor payment commitments
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-user-check mt-1 mr-2 text-blue-500"></i>
                      Use platform responsibly
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-user-check mt-1 mr-2 text-blue-500"></i>
                      Report problems or concerns
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-user-check mt-1 mr-2 text-blue-500"></i>
                      Maintain cultural sensitivity
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8" style={{ borderLeft: '4px solid #478c0b' }}>
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Legal Information</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Governing Law</h4>
                  <p className="text-gray-600 mb-4">These terms are governed by Israeli law and the principles of the Village of Peace community. Any disputes will be resolved through:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Community mediation first</li>
                    <li>Israeli commercial law procedures</li>
                    <li>Jurisdiction in Israeli courts</li>
                    <li>Cultural sensitivity in all proceedings</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800">Contact Information</h4>
                  <div className="space-y-3 text-gray-600">
                    <div>
                      <strong>KiFar Marketplace</strong><br/>
                      Village of Peace<br/>
                      Dimona, Israel
                    </div>
                    <div>
                      <strong>Email:</strong> legal@kfar.org<br/>
                      <strong>Phone:</strong> +972-8-6567788<br/>
                      <strong>Hours:</strong> Sunday-Thursday 8:00-18:00
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-50 border-l-4 border-green-400 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-800">Questions or Concerns?</h4>
                <p className="text-green-700">If you have any questions about these policies or need clarification about your rights and responsibilities, please contact us. We're committed to transparent communication and will respond to all inquiries with the respect and care that reflects our community values.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SupportPage;