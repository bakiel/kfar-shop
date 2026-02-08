'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVolumeUp, FaShoppingCart, FaUser, FaRobot } from 'react-icons/fa';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audio_url?: string;
  products?: any[];
  suggestions?: string[];
}

interface VoiceSettings {
  enabled: boolean;
  voice_id: string;
  autoPlay: boolean;
}

const DEMO_VOICES = {
  daniella: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Daniella (Friendly Female)', accent: 'Israeli' },
  yaakov: { id: 'ZMK5OD2jmsdse3EKE4W5', name: 'Yaakov (Wise Male)', accent: 'Israeli' },
  sarah: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Sarah (Professional)', accent: 'American' },
  jessica: { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica (Warm)', accent: 'American' }
};

export default function EnhancedChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Daniella
    autoPlay: true
  });
  const [isListening, setIsListening] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

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

  const handleInitialMessage = async () => {
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: "Shalom! Welcome to KFAR Marketplace! I'm your AI assistant from the Village of Peace. I can help you discover our amazing vegan products, learn about our vendors, or share our community story. Try asking me about our best sellers!",
      timestamp: new Date(),
      suggestions: ['Show me popular products', 'Tell me about vendors', 'What makes you special?', 'Find protein options']
    };

    setMessages([welcomeMessage]);
    setConversationId(`kfar_${Date.now()}`);

    // Generate welcome audio
    if (voiceSettings.enabled && voiceSettings.autoPlay) {
      await generateAudio(welcomeMessage.content);
    }
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
      const response = await fetch('/api/chat/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversation_id: conversationId,
          voice_enabled: voiceSettings.enabled,
          voice_id: voiceSettings.voice_id
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.response.text,
          timestamp: new Date(data.response.timestamp),
          audio_url: data.response.audio_url,
          products: data.response.products,
          suggestions: data.response.suggestions
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Auto-play audio if enabled
        if (assistantMessage.audio_url && voiceSettings.autoPlay) {
          playAudio(assistantMessage.audio_url);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAudio = async (text: string) => {
    try {
      const response = await fetch(`/api/chat/enhanced?text=${encodeURIComponent(text)}&voice_id=${voiceSettings.voice_id}`);
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (voiceSettings.autoPlay) {
        playAudio(audioUrl);
      }
    } catch (error) {
      console.error('Audio generation error:', error);
    }
  };

  const playAudio = (audioUrl: string) => {
    // Stop current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    setCurrentAudio(audio);
    
    audio.play().catch(error => {
      console.error('Audio playback error:', error);
    });

    audio.onended = () => {
      setCurrentAudio(null);
    };
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.current?.stop();
      setIsListening(false);
    } else {
      recognition.current?.start();
      setIsListening(true);
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
          <i className="fas fa-times text-white text-xl"></i>
        ) : (
          <div className="relative">
            <FaRobot className="text-white text-xl" />
            {voiceSettings.enabled && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
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
                      <p className="text-xs opacity-90">Village of Peace • Always Here to Help</p>
                    </div>
                  </div>
                  
                  {/* Voice Toggle */}
                  <button
                    onClick={() => setVoiceSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`p-2 rounded-full transition-all ${voiceSettings.enabled ? 'bg-white/20' : 'bg-white/10'}`}
                    title={voiceSettings.enabled ? 'Voice enabled' : 'Voice disabled'}
                  >
                    {voiceSettings.enabled ? (
                      <FaVolumeUp className="text-white" />
                    ) : (
                      <FaMicrophoneSlash className="text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Settings Panel */}
            {voiceSettings.enabled && (
              <div className="px-4 py-2 bg-green-50 border-b">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Voice:</span>
                  <select
                    value={voiceSettings.voice_id}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, voice_id: e.target.value }))}
                    className="text-xs border rounded px-2 py-1"
                  >
                    {Object.entries(DEMO_VOICES).map(([key, voice]) => (
                      <option key={key} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

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
                      
                      {/* Audio Player */}
                      {msg.audio_url && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => playAudio(msg.audio_url!)}
                            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                          >
                            <FaVolumeUp className="text-xs" />
                          </button>
                          <span className="text-xs opacity-75">Play audio</span>
                        </div>
                      )}
                    </div>

                    {/* Products */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.products.slice(0, 2).map((product) => (
                          <div key={product.id} className="bg-white border rounded-lg p-3 shadow-sm">
                            <div className="flex gap-3">
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={50}
                                height={50}
                                className="rounded-lg object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/images/fallbacks/kfar-product-fallback.svg';
                                }}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-800">{product.name}</h4>
                                <p className="text-xs text-gray-600 mb-1">{product.vendorName}</p>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-green-600">₪{product.price}</span>
                                  <Link
                                    href={`/product/${product.id}`}
                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                  >
                                    View
                                  </Link>
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
                <div className="flex-1 relative">
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
                
                <div className="flex flex-col gap-1">
                  {/* Voice Input */}
                  {recognition.current && (
                    <button
                      onClick={toggleListening}
                      className={`p-2 rounded-lg transition-all ${
                        isListening 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                    >
                      <FaMicrophone className="text-sm" />
                    </button>
                  )}
                  
                  {/* Send Button */}
                  <button
                    onClick={() => sendMessage()}
                    disabled={!message.trim() || isLoading}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <i className="fas fa-paper-plane text-sm"></i>
                  </button>
                </div>
              </div>

              {/* Demo Instructions */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center gap-4">
                  <span>🎤 Voice enabled</span>
                  <span>•</span>
                  <span>🛍️ Live product search</span>
                  <span>•</span>
                  <span>🌱 Community expert</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
