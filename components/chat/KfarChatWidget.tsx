'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  MicrophoneIcon,
  PaperAirplaneIcon,
  ShoppingBagIcon,
  LinkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useKfarChat } from '@/hooks/useKfarChat';
import ProductCard from './ProductCard';
import VoiceVisualizer from './VoiceVisualizer';

export default function KfarChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  const { 
    messages, 
    isListening,
    isSpeaking,
    isLoading,
    suggestedProducts,
    currentVoice,
    setCurrentVoice,
    sendMessage,
    startListening,
    stopListening 
  } = useKfarChat('daniella');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleVoiceHold = () => {
    if (!isSpeaking) {
      startListening();
    }
  };

  const handleVoiceRelease = () => {
    if (isListening) {
      stopListening();
    }
  };

  return (
    <>
      {/* Floating Button - HIGH CONTRAST */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full bg-gray-900 shadow-2xl flex items-center justify-center border-4 border-white ${
          isOpen ? 'hidden' : 'block'
        }`}
        aria-label="Open KFAR marketplace assistant"
      >
        <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
        {/* Strong pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[450px] h-full sm:h-[650px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            {/* Header with HIGH contrast */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-kfar-gold rounded-full flex items-center justify-center">
                    <ShoppingBagIcon className="h-6 w-6 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">KFAR Assistant</h3>
                    <p className="text-sm text-gray-300">Your marketplace guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Mode Toggle - HIGH contrast */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setMode('text')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'text' 
                      ? 'bg-kfar-gold text-gray-900 shadow-md' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  💬 Text Chat
                </button>
                <button
                  onClick={() => setMode('voice')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'voice' 
                      ? 'bg-kfar-gold text-gray-900 shadow-md' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  🎤 Voice Chat
                </button>
              </div>
              
              {/* Voice Selection - Only shown in voice mode */}
              {mode === 'voice' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setCurrentVoice('yaakov')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      currentVoice === 'yaakov' 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                  >
                    Akh Yaakov
                  </button>
                  <button
                    onClick={() => setCurrentVoice('daniella')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      currentVoice === 'daniella' 
                        ? 'bg-white/30 text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                  >
                    Akhot Daniella
                  </button>
                </div>
              )}
            </div>

            {/* Messages Area - HIGH contrast background */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">{/* Changed from bg-gray-50 to bg-gray-100 */}
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <SparklesIcon className="h-10 w-10 text-yellow-400" />
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 mb-2">
                    Welcome to KFAR Marketplace!
                  </h4>
                  <p className="text-lg text-gray-700 mb-4 font-medium">
                    Ask me about products, vendors, or paste a product link
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['🥗 Show vegan products', '📍 Find local vendors', '⭐ Today\'s specials'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion.substring(2))}
                        className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-bold shadow-md border-2 border-gray-700 transition-all hover:shadow-lg"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg' // Changed from gold to blue
                        : 'bg-white text-gray-900 shadow-md border-2 border-gray-300' // Added stronger border
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-base leading-relaxed">{message.text}</p>
                    {message.products && message.products.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {message.products.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                    <p className="text-xs mt-3 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl shadow-md border-2 border-gray-400">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 bg-gray-900 rounded-full animate-bounce" />
                      <div className="w-3 h-3 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-3 h-3 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Products - HIGH visibility */}
              {suggestedProducts.length > 0 && (
                <div className="mt-6 p-4 bg-gray-900 rounded-xl border-2 border-gray-700">
                  <h5 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-yellow-400" />
                    You might also like:
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} compact />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - HIGH contrast */}
            {mode === 'text' ? (
              <form onSubmit={handleSubmit} className="p-4 bg-gray-200 border-t-4 border-gray-400">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about products or paste a link..."
                      className="w-full px-5 py-3 pr-12 border-3 border-gray-600 rounded-full focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 transition-all text-gray-900 placeholder-gray-600 bg-white font-medium"
                      disabled={isLoading}
                    />
                    <LinkIcon className="absolute right-4 top-3.5 h-5 w-5 text-gray-600" />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!input.trim() || isLoading}
                    className="p-4 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all"
                  >
                    <PaperAirplaneIcon className="h-6 w-6" />
                  </motion.button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-gray-200 border-t-4 border-gray-400">
                <VoiceVisualizer isActive={isListening || isSpeaking} />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseDown={handleVoiceHold}
                  onMouseUp={handleVoiceRelease}
                  onTouchStart={handleVoiceHold}
                  onTouchEnd={handleVoiceRelease}
                  disabled={isSpeaking}
                  className={`w-full py-5 rounded-full font-bold text-white text-lg transition-all ${
                    isListening 
                      ? 'bg-red-600 shadow-2xl' 
                      : 'bg-green-600 shadow-lg hover:shadow-xl hover:bg-green-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <MicrophoneIcon className="h-7 w-7 inline mr-2" />
                  {isListening ? '🔴 Release to Send' : isSpeaking ? '🔊 Speaking...' : '🎤 Hold to Talk'}
                </motion.button>
                <p className="text-sm text-gray-700 text-center mt-2 font-medium">
                  {isListening ? 'Listening...' : 'Hold the button and speak'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}