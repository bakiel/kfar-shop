'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicrophoneIcon, 
  ShoppingCartIcon,
  SparklesIcon,
  XMarkIcon,
  QuestionMarkCircleIcon 
} from '@heroicons/react/24/solid';
import { useVoiceCommerce } from '@/hooks/useVoiceCommerce';
import { parseVoiceCommand, CommandIntent } from '@/lib/voice/voiceCommandParser';
import { VOICE_CONFIG, GREETINGS, SUGGESTIONS, AGENT_INTRO } from '@/config/voice';
import ProductCard from '@/components/chat/ProductCard';
import VoiceVisualizer from '@/components/chat/VoiceVisualizer';

interface VoiceFirstChatProps {
  language?: 'en' | 'he' | 'ar';
  defaultVoice?: 'yaakov' | 'daniella';
}

export default function VoiceFirstChat({ 
  language = 'en', 
  defaultVoice = 'daniella' 
}: VoiceFirstChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentVoice, setCurrentVoice] = useState(defaultVoice);
  const [showText, setShowText] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { 
    processCommand, 
    isProcessing, 
    currentProduct, 
    searchResults,
    speak: originalSpeak,
    getVoiceSuggestions 
  } = useVoiceCommerce();
  
  // Wrap speak function to manage audio
  const speak = useCallback(async (text: string, voice?: 'yaakov' | 'daniella') => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Use the voice commerce speak function
    await originalSpeak(text, voice || currentVoice);
  }, [originalSpeak, currentVoice]);

  // Debug log
  useEffect(() => {
    console.log('🎤 VoiceFirstChat mounted');
    return () => console.log('🎤 VoiceFirstChat unmounted');
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'he' ? 'he-IL' : language === 'ar' ? 'ar-SA' : 'en-US';
      
      recognition.onstart = () => {
        console.log('Voice recognition started');
        // Stop any audio playback when starting to listen
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        // Cancel any browser speech synthesis
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            // Process the final transcript
            handleVoiceCommand(transcript);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(interimTranscript || finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Handle voice command
  const handleVoiceCommand = useCallback((command: string) => {
    setTranscript(command);
    setIsListening(false);
    
    // Stop recognition while processing
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    // Parse and process command
    const parsedCommand = parseVoiceCommand(command);
    console.log('Parsed command:', parsedCommand);
    
    // Process the command
    processCommand(command);
  }, [processCommand, isListening]);

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Show error message if speech recognition not available
      speak("Sorry, voice recognition is not available in your browser. Please use text input instead.");
      setShowText(true);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      
      // Play greeting if first interaction
      if (!transcript) {
        const greeting = GREETINGS[language][currentVoice];
        speak(greeting);
      }
    }
  };

  // Handle text input
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleVoiceCommand(textInput);
      setTextInput('');
    }
  };

  // Voice orb animation
  const orbAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: isListening ? [1, 1.1, 1] : 1, 
      opacity: 1,
      transition: {
        scale: {
          repeat: isListening ? Infinity : 0,
          duration: 2
        }
      }
    },
    exit: { scale: 0.8, opacity: 0 }
  };

  return (
    <>
      {/* Floating Voice Button - HIGH VISIBILITY */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-red-600 shadow-2xl flex items-center justify-center border-3 border-white ${
          isOpen ? 'hidden' : 'block'
        }`}
        aria-label="Open voice shopping"
      >
        <MicrophoneIcon className="h-8 w-8 text-white" />
        <motion.div
          className="absolute inset-0 rounded-full bg-white"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Voice Interface - Fixed Size */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
              onAnimationComplete={() => {
                // Play introduction when first opened
                if (!hasPlayedIntro) {
                  setHasPlayedIntro(true);
                  setTimeout(() => {
                    speak(AGENT_INTRO[language][currentVoice], currentVoice);
                  }, 500);
                }
              }}
            >
              {/* Header - Compact */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-white">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-kfar-gold rounded-full flex items-center justify-center">
                      <SparklesIcon className="h-6 w-6 text-gray-900" />
                    </div>
                    <h2 className="text-xl font-bold">Voice Shopping</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Voice Selection - Compact */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentVoice('yaakov')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                      currentVoice === 'yaakov' 
                        ? 'bg-kfar-gold text-gray-900 shadow-md' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    Akh Yaakov
                  </button>
                  <button
                    onClick={() => setCurrentVoice('daniella')}
                    className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                      currentVoice === 'daniella' 
                        ? 'bg-kfar-gold text-gray-900 shadow-md' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    Akhot Daniella
                  </button>
                </div>
              </div>

              {/* Main Voice Area - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
                {/* Voice Orb - Reasonable Size */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    {...orbAnimation}
                    className="relative w-32 h-32"
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleListening}
                      className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
                        isListening 
                          ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/30' 
                          : 'bg-gradient-to-br from-kfar-mint to-kfar-mint-dark shadow-xl hover:shadow-2xl'
                      }`}
                    >
                      <MicrophoneIcon className="h-12 w-12 text-white" />
                    </motion.button>
                    
                    {/* Pulse Effect */}
                    {isListening && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-red-500"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </div>

                {/* Status Text */}
                <div className="text-center mb-4">
                  <p className="text-lg font-medium text-gray-800">
                    {isListening ? '🔴 Listening... Speak now!' : 'Tap the microphone to start'}
                  </p>
                  {transcript && (
                    <p className="text-sm text-gray-600 mt-2 italic bg-white p-2 rounded-lg shadow-sm">
                      "{transcript}"
                    </p>
                  )}
                </div>

                {/* Voice Suggestions - Compact */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <button
                    onClick={() => handleVoiceCommand("What's on sale?")}
                    className="px-4 py-2 bg-white hover:bg-gray-200 text-gray-900 rounded-full text-sm font-medium shadow-md border border-gray-300 transition-all"
                  >
                    What's on sale?
                  </button>
                  <button
                    onClick={() => handleVoiceCommand("Show me best sellers")}
                    className="px-4 py-2 bg-white hover:bg-gray-200 text-gray-900 rounded-full text-sm font-medium shadow-md border border-gray-300 transition-all"
                  >
                    Best sellers
                  </button>
                  <button
                    onClick={() => handleVoiceCommand("I need hummus")}
                    className="px-4 py-2 bg-white hover:bg-gray-200 text-gray-900 rounded-full text-sm font-medium shadow-md border border-gray-300 transition-all"
                  >
                    I need hummus
                  </button>
                </div>

                {/* Product Results - Compact */}
                {searchResults.length > 0 && (
                  <div className="mt-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <SparklesIcon className="h-4 w-4 text-kfar-gold" />
                      Found Products:
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.slice(0, 3).map((product) => (
                        <ProductCard key={product.id} product={product} compact />
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Fallback Toggle */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowText(!showText)}
                    className="text-sm text-kfar-mint hover:text-kfar-mint-dark font-medium hover:underline"
                  >
                    {showText ? 'Hide' : 'Show'} text input
                  </button>
                </div>

                {/* Text Input */}
                {showText && (
                  <form onSubmit={handleTextSubmit} className="mt-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type your request..."
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-full focus:outline-none focus:border-kfar-mint focus:ring-2 focus:ring-kfar-mint/20 text-sm"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-br from-kfar-gold to-kfar-gold-dark text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Quick Actions Bar - Compact */}
              <div className="bg-white px-4 py-3 border-t border-gray-200">
                <div className="flex justify-around">
                  <button className="flex flex-col items-center gap-1 text-gray-700 hover:text-kfar-mint transition-colors group">
                    <div className="p-2 bg-gray-100 group-hover:bg-kfar-mint/10 rounded-full transition-colors">
                      <ShoppingCartIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">Cart</span>
                  </button>
                  <button className="flex flex-col items-center gap-1 text-gray-700 hover:text-kfar-mint transition-colors group">
                    <div className="p-2 bg-gray-100 group-hover:bg-kfar-mint/10 rounded-full transition-colors">
                      <SparklesIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">Deals</span>
                  </button>
                  <button 
                    onClick={() => speak(AGENT_INTRO[language][currentVoice], currentVoice)}
                    className="flex flex-col items-center gap-1 text-gray-700 hover:text-kfar-mint transition-colors group"
                  >
                    <div className="p-2 bg-gray-100 group-hover:bg-kfar-mint/10 rounded-full transition-colors">
                      <QuestionMarkCircleIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">Help</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
