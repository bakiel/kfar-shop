// components/chat/IntelligentChatWidget.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid';
import { 
  useIntelligentChat, 
  CONVERSATION_STARTERS,
  KNOWLEDGE_CATEGORIES 
} from '@/hooks/useIntelligentChat';
import Image from 'next/image';

export default function IntelligentChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showKnowledgeSearch, setShowKnowledgeSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    searchKnowledge,
    knowledgeResults,
    isSearching,
    askAbout,
    getVendorInfo,
    clearKnowledgeResults,
  } = useIntelligentChat({
    userName: 'Guest', // Would come from auth
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle conversation starters
  const handleStarter = (action: string) => {
    askAbout(action);
  };

  // Handle knowledge search
  const handleKnowledgeSearch = async (query: string, type?: string) => {
    await searchKnowledge(query, type as any);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-kfar-mint to-kfar-mint-dark shadow-2xl flex items-center justify-center ${
          isOpen ? 'hidden' : 'block'
        }`}
        aria-label="Open intelligent chat"
      >
        <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-kfar-mint to-kfar-mint-dark p-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full p-1">
                    <Image
                      src="/images/logos/kfar_icon_leaf_green.png"
                      alt="KFAR"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">KFAR Assistant</h3>
                    <p className="text-xs opacity-90">Intelligent marketplace guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowKnowledgeSearch(!showKnowledgeSearch)}
                  className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
                >
                  <MagnifyingGlassIcon className="h-3 w-3" />
                  Search Knowledge
                </button>
                <button
                  onClick={() => handleStarter('vendors')}
                  className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
                >
                  <BookOpenIcon className="h-3 w-3" />
                  Vendors
                </button>
                <button
                  onClick={() => handleStarter('community')}
                  className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
                >
                  <QuestionMarkCircleIcon className="h-3 w-3" />
                  About
                </button>
              </div>
            </div>

            {/* Knowledge Search Panel */}
            <AnimatePresence>
              {showKnowledgeSearch && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="bg-gray-50 border-b overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Search our knowledge base..."
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kfar-mint"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleKnowledgeSearch(e.currentTarget.value);
                          }
                        }}
                      />
                      <button
                        onClick={() => setShowKnowledgeSearch(false)}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Close
                      </button>
                    </div>
                    
                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2">
                      {KNOWLEDGE_CATEGORIES.map(cat => (
                        <button
                          key={cat.value}
                          onClick={() => handleKnowledgeSearch('', cat.value)}
                          className="px-3 py-1 bg-white border rounded-full text-xs hover:bg-gray-50 transition-colors"
                        >
                          {cat.icon} {cat.label}
                        </button>
                      ))}
                    </div>
                    
                    {/* Knowledge Results */}
                    {knowledgeResults.length > 0 && (
                      <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                        {knowledgeResults.map((result, idx) => (
                          <div key={idx} className="p-2 bg-white rounded-lg text-xs">
                            <div className="font-semibold flex items-center gap-1">
                              <span className="text-kfar-mint">
                                {KNOWLEDGE_CATEGORIES.find(c => c.value === result.type)?.icon}
                              </span>
                              {result.title}
                            </div>
                            <p className="text-gray-600 mt-1 line-clamp-2">
                              {result.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <SparklesIcon className="h-12 w-12 text-kfar-mint mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Welcome to KFAR Marketplace!
                  </h4>
                  <p className="text-sm text-gray-600 mb-6">
                    I know everything about our products, vendors, and community.
                    Ask me anything!
                  </p>
                  
                  {/* Conversation Starters */}
                  <div className="grid grid-cols-2 gap-2">
                    {CONVERSATION_STARTERS.slice(0, 4).map((starter) => (
                      <button
                        key={starter.action}
                        onClick={() => handleStarter(starter.action)}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <span className="text-xl mb-1">{starter.icon}</span>
                        <p className="text-xs text-gray-700">{starter.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-kfar-mint text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Tool Results */}
                        {message.toolInvocations && message.toolInvocations.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.toolInvocations.map((tool: any, toolIdx: number) => (
                              <div key={toolIdx} className="text-xs opacity-75">
                                {tool.toolName === 'searchProducts' && tool.result?.products && (
                                  <div>Found {tool.result.products.length} products</div>
                                )}
                                {tool.toolName === 'searchKnowledge' && tool.result?.found && (
                                  <div>Found {tool.result.found} related topics</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex gap-1">
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about products, vendors, recipes..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-kfar-mint text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 bg-kfar-mint text-white rounded-full hover:bg-kfar-mint-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Quick Vendor Access */}
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {['Teva Deli', 'Gahn Delight', "Queen's Cuisine", 'People Store'].map(vendor => (
                  <button
                    key={vendor}
                    type="button"
                    onClick={() => getVendorInfo(vendor)}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs whitespace-nowrap hover:bg-gray-200 transition-colors"
                  >
                    {vendor}
                  </button>
                ))}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}