'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  MicrophoneIcon,
  KeyboardIcon
} from '@heroicons/react/24/outline';
import { useHybridChat } from '@/hooks/useHybridChat';
import { VoiceAssistant, Language } from '@/config/voice';

// Lazy load components to prevent SSR issues
import dynamic from 'next/dynamic';

const VoiceInterface = dynamic(() => import('./VoiceInterface'), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center"><div className="animate-pulse">Loading voice interface...</div></div>
});

const TextInterface = dynamic(() => import('./TextInterface'), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center"><div className="animate-pulse">Loading text interface...</div></div>
});

const AssistantSelector = dynamic(() => import('./AssistantSelector'), {
  ssr: false,
  loading: () => <div className="w-32 h-8 bg-white/20 rounded animate-pulse" />
});

export default function HybridChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [assistant, setAssistant] = useState<VoiceAssistant>('yaakov');
  const [language, setLanguage] = useState<Language>('he');
  
  const { 
    messages, 
    isListening, 
    isSpeaking, 
    sendMessage,
    startListening,
    stopListening 
  } = useHybridChat({
    assistant,
    language,
    mode
  });

  // Tab key handler for mode switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && isOpen) {
        e.preventDefault();
        setMode(prev => prev === 'voice' ? 'text' : 'voice');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg flex items-center justify-center ${
          isOpen ? 'hidden' : 'block'
        }`}
        aria-label="Open chat"
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 right-0 sm:bottom-4 sm:right-4 z-50 w-full sm:w-96 h-full sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex justify-between items-center mb-3">
                <AssistantSelector
                  current={assistant}
                  onChange={setAssistant}
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {/* Mode & Language Controls */}
              <div className="flex items-center justify-between">
                {/* Mode Toggle */}
                <div className="flex items-center gap-2 bg-white/20 rounded-full p-1">
                  <button
                    onClick={() => setMode('voice')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      mode === 'voice' 
                        ? 'bg-white text-blue-600' 
                        : 'text-white/80 hover:text-white'
                    }`}
                    aria-label="Voice mode"
                  >
                    <MicrophoneIcon className="h-4 w-4 inline mr-1" />
                    Voice
                  </button>
                  <button
                    onClick={() => setMode('text')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      mode === 'text' 
                        ? 'bg-white text-blue-600' 
                        : 'text-white/80 hover:text-white'
                    }`}
                    aria-label="Text mode"
                  >
                    <KeyboardIcon className="h-4 w-4 inline mr-1" />
                    Text
                  </button>
                </div>
                
                {/* Language Selector */}
                <div className="flex gap-1">
                  {[
                    { code: 'he' as Language, label: 'עב' },
                    { code: 'en' as Language, label: 'EN' },
                    { code: 'ar' as Language, label: 'عر' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        language === lang.code
                          ? 'bg-white text-blue-600'
                          : 'bg-white/20 text-white/80 hover:bg-white/30'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-hidden">
              {mode === 'voice' ? (
                <VoiceInterface
                  messages={messages}
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  onStartListening={startListening}
                  onStopListening={stopListening}
                  assistant={assistant}
                  language={language}
                />
              ) : (
                <TextInterface
                  messages={messages}
                  onSendMessage={sendMessage}
                  language={language}
                />
              )}
            </div>

            {/* Mode Switch Hint */}
            <div className="text-center text-xs text-gray-500 p-2 bg-gray-50">
              Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Tab</kbd> to switch modes
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}