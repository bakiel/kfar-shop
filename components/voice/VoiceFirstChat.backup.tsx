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

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          speak('Please allow microphone access to use voice shopping.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language, speak]);

  // Handle voice command
  const handleVoiceCommand = async (text: string) => {
    // Check for help/intro command first
    const helpCommands = ['help', 'what can you do', 'commands', 'how to use', 'introduction', 'capabilities'];
    if (helpCommands.some(cmd => text.toLowerCase().includes(cmd))) {
      const intro = AGENT_INTRO[language][currentVoice];
      await speak(intro, currentVoice);
      return;
    }
    
    const parsed = parseVoiceCommand(text, language);
    
    if (parsed.confidence > 0.7) {
      processCommand(text);
    } else {
      speak("I didn't quite catch that. Try saying 'show me vegan products' or 'what's on sale?'");
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) return;

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
        className={`fixed bottom-6 right-6 z-50 w-20 h-20 rounded-full bg-red-600 shadow-2xl flex items-center justify-center border-4 border-white ${
          isOpen ? 'hidden' : 'block'
        }`}
        aria-label="Open voice shopping"
      >
        <MicrophoneIcon className="h-10 w-10 text-white" />
        <motion.div
          className="absolute inset-0 rounded-full bg-white"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Voice Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
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
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - HIGH Contrast */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-kfar-gold rounded-full flex items-center justify-center">
                      <SparklesIcon className="h-7 w-7 text-gray-900" />
                    </div>
                    <h2 className="text-2xl font-bold">Voice Shopping</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Voice Selection - HIGH Visibility */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentVoice('yaakov')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      currentVoice === 'yaakov' 
                        ? 'bg-kfar-gold text-gray-900 shadow-md' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    Akh Yaakov
                  </button>
                  <button
                    onClick={() => setCurrentVoice('daniella')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      currentVoice === 'daniella' 
                        ? 'bg-kfar-gold text-gray-900 shadow-md' 
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    Akhot Daniella
                  </button>
                </div>
              </div>

              {/* Main Voice Area - HIGH Contrast */}
              <div className="p-8 bg-gray-100">{/* Changed from bg-gray-50 to bg-gray-100 */}
                {/* Voice Orb - Larger and Clearer */}
                <div className="flex justify-center mb-8">
                  <motion.div
                    {...orbAnimation}
                    className="relative w-40 h-40"
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
                      <MicrophoneIcon className="h-16 w-16 text-white" />
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

                {/* Status Text - Clearer */}
                <div className="text-center mb-6">
                  <p className="text-xl font-semibold text-gray-800">
                    {isListening ? '🔴 Listening... Speak now!' : 'Tap the microphone to start'}
                  </p>
                  {transcript && (
                    <p className="text-base text-gray-600 mt-3 italic bg-white p-3 rounded-lg shadow-sm">
                      "{transcript}"
                    </p>
                  )}
                </div>

                {/* Voice Suggestions - HIGH Visibility */}
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  <button
                    onClick={() => handleVoiceCommand("What's on sale?")}
                    className="px-5 py-2.5 bg-white hover:bg-gray-200 text-gray-900 rounded-full font-semibold shadow-md border-2 border-gray-400 transition-all hover:shadow-lg"
                  >
                    What's on sale?
                  </button>
                  <button
                    onClick={() => handleVoiceCommand("Show me best sellers")}
                    className="px-5 py-2.5 bg-white hover:bg-gray-200 text-gray-900 rounded-full font-semibold shadow-md border-2 border-gray-400 transition-all hover:shadow-lg"
                  >
                    Show me best sellers
                  </button>
                  <button
                    onClick={() => handleVoiceCommand("I need hummus")}
                    className="px-5 py-2.5 bg-white hover:bg-gray-200 text-gray-900 rounded-full font-semibold shadow-md border-2 border-gray-400 transition-all hover:shadow-lg"
                  >
                    I need hummus
                  </button>
                </div>

                {/* Product Results - Better Display */}
                {searchResults.length > 0 && (
                  <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-kfar-gold" />
                      Found Products:
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {searchResults.slice(0, 5).map((product) => (
                        <ProductCard key={product.id} product={product} compact />
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Fallback Toggle - Better Visibility */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowText(!showText)}
                    className="text-base text-kfar-mint hover:text-kfar-mint-dark font-medium hover:underline"
                  >
                    {showText ? 'Hide' : 'Show'} text input
                  </button>
                </div>

                {/* Text Input - Better Contrast */}
                {showText && (
                  <form onSubmit={handleTextSubmit} className="mt-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Type your request..."
                        className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-kfar-mint focus:ring-2 focus:ring-kfar-mint/20 text-gray-800 placeholder-gray-500"
                      />
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-br from-kfar-gold to-kfar-gold-dark text-white rounded-full font-semibold hover:shadow-lg transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Quick Actions Bar - Better Contrast */}
              <div className="bg-white px-6 py-5 border-t border-gray-200">
                <div className="flex justify-around">
                  <button className="flex flex-col items-center gap-2 text-gray-700 hover:text-kfar-mint transition-colors group">
                    <div className="p-3 bg-gray-100 group-hover:bg-kfar-mint/10 rounded-full transition-colors">
                      <ShoppingCartIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">Cart</span>
                  </button>
                  <button className="flex flex-col items-center gap-2 text-gray-700 hover:text-kfar-mint transition-colors group">
                    <div className="p-3 bg-gray-100 group-hover:bg-kfar-mint/10 rounded-full transition-colors">
                      <SparklesIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">Deals</span>
                  </button>
                  <button 
                    onClick={() => speak(AGENT_INTRO[language][currentVoice], currentVoice)}
                    className="flex flex-col items-center gap-2 text-gray-700 hover:text-kfar-mint transition-colors group"
                  >
                    <div className="p-3 bg-gray-100 group-hover:bg-kfar-mint/10 rounded-full transition-colors">
                      <QuestionMarkCircleIcon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium">Help</span>
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