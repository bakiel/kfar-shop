'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import { FaQrcode, FaTags, FaHeadset, FaShieldAlt, FaRobot, FaBell, FaIdCard, FaHistory, FaStar } from 'react-icons/fa';
import { SiNfc } from 'react-icons/si';

interface SupportTicket {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  tags: string[];
  assignedTo?: string;
  createdAt: Date;
  lastUpdated: Date;
  messages: Message[];
  qrCode: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'product' | 'vendor' | 'customer' | 'support' | 'community';
  count: number;
}

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState('contact');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [contactMethod, setContactMethod] = useState<'qr' | 'form' | 'chat' | 'voice'>('form');
  const [language, setLanguage] = useState<'en' | 'he'>('en');

  // Sample tags data
  const sampleTags: Tag[] = [
    { id: '1', name: 'urgent', color: '#c23c09', category: 'support', count: 5 },
    { id: '2', name: 'payment-issue', color: '#f6af0d', category: 'support', count: 12 },
    { id: '3', name: 'vendor-inquiry', color: '#478c0b', category: 'vendor', count: 8 },
    { id: '4', name: 'shipping', color: '#3a3a1d', category: 'support', count: 23 },
    { id: '5', name: 'community-member', color: '#478c0b', category: 'customer', count: 156 },
    { id: '6', name: 'vip', color: '#f6af0d', category: 'customer', count: 34 },
    { id: '7', name: 'technical', color: '#c23c09', category: 'support', count: 18 },
    { id: '8', name: 'feedback', color: '#cfe7c1', category: 'support', count: 67 }
  ];

  const generateQRCode = (data: any) => {
    // In production, use a real QR code library
    return `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const createTicket = (formData: any) => {
    const newTicket: SupportTicket = {
      id: `TICKET-${Date.now()}`,
      title: formData.subject,
      category: formData.category,
      priority: determinePriority(formData.tags),
      status: 'open',
      tags: formData.tags,
      createdAt: new Date(),
      lastUpdated: new Date(),
      messages: [{
        id: '1',
        sender: formData.email,
        content: formData.message,
        timestamp: new Date()
      }],
      qrCode: generateQRCode(formData)
    };
    
    setTickets([...tickets, newTicket]);
    return newTicket;
  };

  const determinePriority = (tags: string[]): 'low' | 'medium' | 'high' | 'urgent' => {
    if (tags.includes('urgent')) return 'urgent';
    if (tags.includes('payment-issue')) return 'high';
    if (tags.includes('technical')) return 'medium';
    return 'low';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--cream-base)]">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[var(--leaf-green)] via-[var(--sun-gold)] to-[var(--earth-flame)] text-white py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Smart Support Center
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                AI-Powered, QR-Enabled, Community-Focused Support
              </p>
              
              {/* Contact Method Selection */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                  onClick={() => setContactMethod('qr')}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    contactMethod === 'qr' 
                      ? 'bg-white text-[var(--leaf-green)]' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  <FaQrcode className="inline mr-2" />
                  QR/NFC Support
                </button>
                <button
                  onClick={() => setContactMethod('form')}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    contactMethod === 'form' 
                      ? 'bg-white text-[var(--leaf-green)]' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  <FaTags className="inline mr-2" />
                  Tagged Form
                </button>
                <button
                  onClick={() => setContactMethod('chat')}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    contactMethod === 'chat' 
                      ? 'bg-white text-[var(--leaf-green)]' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  <FaRobot className="inline mr-2" />
                  AI Chat
                </button>
                <button
                  onClick={() => setContactMethod('voice')}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    contactMethod === 'voice' 
                      ? 'bg-white text-[var(--leaf-green)]' 
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                >
                  <FaHeadset className="inline mr-2" />
                  Voice Support
                </button>
              </div>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-all"
              >
                {language === 'en' ? 'עב / EN' : 'EN / עב'}
              </button>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Contact Methods */}
            <div className="lg:col-span-2">
              {/* QR/NFC Support */}
              {contactMethod === 'qr' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-xl p-8"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#3a3a1d' }}>
                    <FaQrcode style={{ color: '#478c0b' }} />
                    QR & NFC Quick Support
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* QR Code Scanner */}
                    <div className="text-center">
                      <div className="bg-gray-100 rounded-xl p-8 mb-4 relative overflow-hidden group cursor-pointer"
                           onClick={() => setShowQRScanner(true)}>
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--leaf-green)] to-[var(--sun-gold)] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <FaQrcode className="text-6xl mx-auto mb-4 text-gray-400 group-hover:text-[var(--leaf-green)] transition-colors" />
                        <p className="font-semibold">Scan QR Code</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Point your camera at any KFAR QR code
                        </p>
                      </div>
                      
                      <div className="flex gap-2 justify-center">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <i className="fas fa-check mr-1"></i>Orders
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          <i className="fas fa-check mr-1"></i>Products
                        </span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          <i className="fas fa-check mr-1"></i>Support
                        </span>
                      </div>
                    </div>

                    {/* NFC Reader */}
                    <div className="text-center">
                      <div className="bg-gray-100 rounded-xl p-8 mb-4 relative overflow-hidden group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--sun-gold)] to-[var(--earth-flame)] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <SiNfc className="text-6xl mx-auto mb-4 text-gray-400 group-hover:text-[var(--sun-gold)] transition-colors" />
                        <p className="font-semibold">Tap NFC Tag</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Hold your device near any KFAR NFC tag
                        </p>
                      </div>
                      
                      <div className="flex gap-2 justify-center">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          <i className="fas fa-check mr-1"></i>ID Cards
                        </span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          <i className="fas fa-check mr-1"></i>Vendors
                        </span>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                          <i className="fas fa-check mr-1"></i>Access
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* QR Use Cases */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <i className="fas fa-box text-2xl mb-2" style={{ color: '#478c0b' }}></i>
                      <p className="text-sm font-medium">Track Order</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <i className="fas fa-undo text-2xl mb-2" style={{ color: '#f6af0d' }}></i>
                      <p className="text-sm font-medium">Return Item</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <i className="fas fa-store text-2xl mb-2" style={{ color: '#c23c09' }}></i>
                      <p className="text-sm font-medium">Vendor Info</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                      <i className="fas fa-question-circle text-2xl mb-2" style={{ color: '#3a3a1d' }}></i>
                      <p className="text-sm font-medium">Get Help</p>
                    </div>
                  </div>

                  {/* Community ID Card Preview */}
                  <div className="mt-8 bg-gradient-to-br from-[var(--leaf-green)] to-[var(--sun-gold)] rounded-xl p-6 text-white">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <FaIdCard />
                      Digital Community ID
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm opacity-80 mb-1">Member Since</p>
                        <p className="font-semibold">2021</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-80 mb-1">Status</p>
                        <p className="font-semibold">Active Community Member</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-80 mb-1">Benefits</p>
                        <p className="font-semibold">VIP Support, Free Delivery</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="bg-white p-3 rounded-lg">
                          <FaQrcode className="text-4xl text-gray-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tagged Form Support */}
              {contactMethod === 'form' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-xl p-8"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#3a3a1d' }}>
                    <FaTags style={{ color: '#478c0b' }} />
                    Smart Tagged Support Form
                  </h2>

                  <form className="space-y-6">
                    {/* Contact Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[var(--leaf-green)] transition-colors"
                          placeholder="Your first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[var(--leaf-green)] transition-colors"
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[var(--leaf-green)] transition-colors"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input 
                          type="tel" 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[var(--leaf-green)] transition-colors"
                          placeholder="+972-XX-XXX-XXXX"
                        />
                      </div>
                    </div>

                    {/* Smart Tags Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Relevant Tags (helps us route your request faster)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {sampleTags.map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleTagSelect(tag.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              selectedTags.includes(tag.id)
                                ? 'text-white shadow-lg transform scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            style={{
                              backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined
                            }}
                          >
                            <FaTags className="inline mr-1 text-xs" />
                            {tag.name}
                            <span className="ml-2 text-xs opacity-75">({tag.count})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[var(--leaf-green)] transition-colors">
                        <option>General Inquiry</option>
                        <option>Order Support</option>
                        <option>Payment Issue</option>
                        <option>Technical Problem</option>
                        <option>Vendor Application</option>
                        <option>Community Question</option>
                        <option>Tourism Information</option>
                        <option>Product Return</option>
                        <option>Feedback/Suggestion</option>
                      </select>
                    </div>

                    {/* Priority Indicator */}
                    {selectedTags.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Estimated Priority Level:
                        </p>
                        <div className="flex items-center gap-2">
                          {determinePriority(selectedTags) === 'urgent' && (
                            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">
                              <i className="fas fa-exclamation-triangle mr-1"></i>Urgent
                            </span>
                          )}
                          {determinePriority(selectedTags) === 'high' && (
                            <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-semibold">
                              <i className="fas fa-exclamation-circle mr-1"></i>High
                            </span>
                          )}
                          {determinePriority(selectedTags) === 'medium' && (
                            <span className="px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-semibold">
                              <i className="fas fa-info-circle mr-1"></i>Medium
                            </span>
                          )}
                          {determinePriority(selectedTags) === 'low' && (
                            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold">
                              <i className="fas fa-check-circle mr-1"></i>Low
                            </span>
                          )}
                          <span className="text-sm text-gray-600">
                            Response time: {
                              determinePriority(selectedTags) === 'urgent' ? '< 1 hour' :
                              determinePriority(selectedTags) === 'high' ? '2-4 hours' :
                              determinePriority(selectedTags) === 'medium' ? '24 hours' :
                              '48 hours'
                            }
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea 
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[var(--leaf-green)] transition-colors h-32"
                        placeholder="Please describe your issue or question in detail..."
                      />
                    </div>

                    {/* File Attachments */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attachments (optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[var(--leaf-green)] transition-colors cursor-pointer">
                        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-2"></i>
                        <p className="text-sm text-gray-600">
                          Drag & drop files here or click to browse
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports: Images, PDFs, Documents (Max 10MB)
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-[var(--leaf-green)] to-[#3a7209] text-white rounded-lg font-semibold text-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
                    >
                      <i className="fas fa-paper-plane"></i>
                      Submit Support Request
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </form>
                </motion.div>
              )}

              {/* AI Chat Support */}
              {contactMethod === 'chat' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-xl p-8"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#3a3a1d' }}>
                    <FaRobot style={{ color: '#478c0b' }} />
                    AI-Powered Support Chat
                  </h2>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--leaf-green)] to-[var(--sun-gold)] rounded-full flex items-center justify-center">
                        <FaRobot className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="font-semibold">KFAR AI Assistant</h3>
                        <p className="text-sm text-gray-600">Powered by Community Knowledge</p>
                      </div>
                      <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <i className="fas fa-circle text-xs mr-1"></i>Online
                      </span>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {/* Sample Chat Messages */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <div className="bg-white rounded-lg p-3 max-w-md">
                          <p className="text-sm">Hello! I&apos;m your KFAR AI assistant. I can help you with:</p>
                          <ul className="text-sm mt-2 space-y-1">
                            <li>• Order tracking and support</li>
                            <li>• Product recommendations</li>
                            <li>• Vendor information</li>
                            <li>• Community questions</li>
                            <li>• Technical assistance</li>
                          </ul>
                          <p className="text-sm mt-2">What can I help you with today?</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <button className="p-3 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      Track Order
                    </button>
                    <button className="p-3 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      Return Item
                    </button>
                    <button className="p-3 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      Find Product
                    </button>
                    <button className="p-3 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                      Contact Vendor
                    </button>
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[var(--leaf-green)] transition-colors"
                      placeholder="Type your message..."
                    />
                    <button className="px-6 py-3 bg-[var(--leaf-green)] text-white rounded-lg font-medium hover:bg-opacity-90 transition-all">
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Voice Support */}
              {contactMethod === 'voice' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-xl p-8"
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: '#3a3a1d' }}>
                    <FaHeadset style={{ color: '#478c0b' }} />
                    Voice & Video Support
                  </h2>

                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-[var(--leaf-green)] to-[var(--sun-gold)] rounded-full mb-6 animate-pulse">
                      <FaHeadset className="text-white text-5xl" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-4">Connect with Community Support</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Speak directly with our community support team members who understand your needs
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      <button className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                        <i className="fas fa-phone text-3xl mb-3 text-gray-400 group-hover:text-[var(--leaf-green)] transition-colors"></i>
                        <p className="font-semibold">Voice Call</p>
                        <p className="text-sm text-gray-600 mt-1">Instant connection</p>
                      </button>
                      
                      <button className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                        <i className="fas fa-video text-3xl mb-3 text-gray-400 group-hover:text-[var(--sun-gold)] transition-colors"></i>
                        <p className="font-semibold">Video Call</p>
                        <p className="text-sm text-gray-600 mt-1">Face-to-face support</p>
                      </button>
                      
                      <button className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                        <i className="fas fa-calendar-alt text-3xl mb-3 text-gray-400 group-hover:text-[var(--earth-flame)] transition-colors"></i>
                        <p className="font-semibold">Schedule Call</p>
                        <p className="text-sm text-gray-600 mt-1">Book appointment</p>
                      </button>
                    </div>

                    <div className="mt-8 p-4 bg-green-50 rounded-lg inline-flex items-center gap-3">
                      <i className="fas fa-clock text-green-600"></i>
                      <span className="text-sm font-medium text-green-800">
                        Available: Sunday-Thursday 8:00-18:00 | Friday 8:00-14:00
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column - Support Dashboard */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                  <FaHistory style={{ color: '#478c0b' }} />
                  Your Support History
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Open Tickets</span>
                    <span className="font-semibold">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Resolved This Month</span>
                    <span className="font-semibold text-green-600">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Response</span>
                    <span className="font-semibold">2.5 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Satisfaction</span>
                    <span className="font-semibold flex items-center gap-1">
                      <FaStar className="text-yellow-500" />
                      4.8/5
                    </span>
                  </div>
                </div>

                <button className="w-full mt-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  View All Tickets
                </button>
              </motion.div>

              {/* Recent Notifications */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#3a3a1d' }}>
                  <FaBell style={{ color: '#f6af0d' }} />
                  Recent Updates
                </h3>

                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Order #1234 Delivered</p>
                    <p className="text-xs text-green-600 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Support ticket resolved</p>
                    <p className="text-xs text-blue-600 mt-1">Yesterday</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">New vendor response</p>
                    <p className="text-xs text-yellow-600 mt-1">3 days ago</p>
                  </div>
                </div>
              </motion.div>

              {/* Community Benefits */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gradient-to-br from-[var(--leaf-green)] to-[var(--sun-gold)] rounded-2xl shadow-xl p-6 text-white"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaShieldAlt />
                  Your Community Benefits
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-check-circle"></i>
                    <span className="text-sm">Priority Support Queue</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-check-circle"></i>
                    <span className="text-sm">Free Return Shipping</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-check-circle"></i>
                    <span className="text-sm">Extended Warranty</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-check-circle"></i>
                    <span className="text-sm">VIP Event Access</span>
                  </div>
                </div>

                <button className="w-full mt-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-all">
                  Upgrade Membership
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}