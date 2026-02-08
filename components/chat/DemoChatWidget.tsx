'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaUser, FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: any[];
  suggestions?: string[];
}

export default function DemoChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      handleInitialMessage();
    }
  }, [isOpen]);

  // Voice speaking function using ElevenLabs
  const speakText = async (text: string) => {
    if (!voiceEnabled || !text) return;
    
    setIsSpeaking(true);
    try {
      console.log('🎤 Speaking with ElevenLabs:', text.substring(0, 50) + '...');
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          gender: 'female' // Using Daniella voice
        })
      });

      const data = await response.json();
      
      if (data.audio && !data.fallback) {
        // Play ElevenLabs audio
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => setIsSpeaking(false);
        await audio.play();
        console.log('✅ ElevenLabs audio playing');
      } else {
        // Fallback to browser TTS
        console.log('⚠️ Using fallback browser TTS');
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('❌ Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const handleInitialMessage = async () => {
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: "Shalom! Welcome to KFAR Marketplace! I'm your AI assistant from the Village of Peace. I can help you discover our amazing vegan products, learn about our vendors, or share our 50+ year community story. What interests you?",
      timestamp: new Date(),
      suggestions: ['Show me popular products', 'Tell me about vendors', 'Community story', 'What makes you special?']
    };

    setMessages([welcomeMessage]);
    setConversationId(`kfar_demo_${Date.now()}`);
    
    // Speak the welcome message with ElevenLabs
    await speakText(welcomeMessage.content);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || message.trim();
    if (!textToSend) return;

    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');

    try {
      console.log('🚀 Sending to demo API:', textToSend);
      
      const response = await fetch('/api/chat/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversation_id: conversationId,
          voice_enabled: false // Disable voice for now
        })
      });

      console.log('📨 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success && data.response) {
        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.response.text,
          timestamp: new Date(data.response.timestamp),
          products: data.response.products,
          suggestions: data.response.suggestions
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // Speak the response with ElevenLabs
        await speakText(assistantMessage.content);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('💥 Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I'm having a small technical hiccup, but I'm still here to help! Our KFAR Marketplace has amazing vegan products from our Village of Peace community. Try asking me about our vendors or popular products!",
        timestamp: new Date(),
        suggestions: ['Show me products', 'Tell me about Teva Deli', 'Community story']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full border-4 border-white cursor-pointer flex items-center justify-center shadow-lg hover:shadow-xl z-[99999] transition-all duration-300 transform hover:scale-110"
        style={{ backgroundColor: '#478c0b' }}
        aria-label="Open KFAR AI Assistant"
      >
        {isOpen ? (
          <FaTimes className="text-white text-xl" />
        ) : (
          <div className="relative">
            <FaRobot className="text-white text-xl" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl z-[99998] flex flex-col overflow-hidden border-2"
            style={{ borderColor: '#478c0b' }}
          >
            {/* Header */}
            <div className="p-4 text-white relative overflow-hidden" style={{ backgroundColor: '#478c0b' }}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-4 translate-y-4"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <FaRobot className="text-green-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">KFAR AI Assistant</h3>
                      <p className="text-xs opacity-90">Village of Peace • Demo Ready</p>
                    </div>
                  </div>
                  
                  <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    ✅ Online
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FaRobot className="text-green-600 text-sm" />
                    </div>
                  )}
                  
                  <div className={`max-w-[280px] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>

                    {/* Products */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.products.slice(0, 2).map((product) => (
                          <div key={product.id} className="bg-white border rounded-lg p-3 shadow-sm">
                            <div className="flex gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-xs">🌱</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-800">{product.name}</h4>
                                <p className="text-xs text-gray-600 mb-1">{product.vendorName}</p>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-green-600">₪{product.price}</span>
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    View
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.suggestions.slice(0, 3).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => sendMessage(suggestion)}
                            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-blue-600 text-sm" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <FaRobot className="text-green-600 text-sm" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about our vegan products, vendors, or community..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    rows={2}
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  onClick={() => sendMessage()}
                  disabled={!message.trim() || isLoading}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>

              {/* Demo Status */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center gap-4">
                  <span>🤖 AI Active</span>
                  <span>•</span>
                  <span>🛍️ Live Product Data</span>
                  <span>•</span>
                  <span>🌱 50+ Years Experience</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
