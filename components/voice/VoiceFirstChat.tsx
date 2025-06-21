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
import { useAudioQueue } from '@/hooks/useAudioQueue';
import { useConversationManager } from '@/hooks/useConversationManager';
import { useVoiceActivityDetection } from '@/hooks/useVoiceActivityDetection';
import { parseVoiceCommand, CommandIntent } from '@/lib/voice/voiceCommandParser';
import { VOICE_CONFIG, GREETINGS, SUGGESTIONS, AGENT_INTRO } from '@/config/voice';
import ProductCard from '@/components/chat/ProductCard';
import VoiceVisualizer from '@/components/chat/VoiceVisualizer';
import Image from 'next/image';

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
  const [recognitionActive, setRecognitionActive] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const conversation = useConversationManager();
  const lastProcessedTranscript = useRef<string>('');
  const processedCommands = useRef<Set<string>>(new Set());
  
  // Audio queue with conversation callbacks
  const { speak, stopAllAudio } = useAudioQueue({
    onAudioStart: () => conversation.startSpeaking(),
    onAudioEnd: () => conversation.stopSpeaking(),
    maxQueueSize: 1 // Reduced to 1 to prevent any queuing
  });
  
  // Voice activity detection
  const vad = useVoiceActivityDetection({
    onSpeechStart: () => {
      if (conversation.state === 'speaking') {
        console.log('🛑 User started speaking - stopping assistant');
        stopAllAudio();
      }
    },
    onSpeechEnd: () => {
      console.log('🔇 User stopped speaking');
    }
  });
  
  const { 
    processCommand, 
    isProcessing, 
    currentProduct, 
    searchResults,
    getVoiceSuggestions 
  } = useVoiceCommerce();

  // Stop all audio and recognition when closing
  const stopAllAudioAndRecognition = useCallback(() => {
    console.log('🛑 Stopping all audio and recognition');
    
    // Use the audio queue's stop function
    stopAllAudio();
    
    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
    }
    
    setIsListening(false);
    setRecognitionActive(false);
  }, [stopAllAudio]);

  // Handle closing the chat
  const handleClose = useCallback(() => {
    stopAllAudioAndRecognition();
    setIsOpen(false);
  }, [stopAllAudioAndRecognition]);

  // Stop audio when component unmounts or isOpen changes
  useEffect(() => {
    if (!isOpen) {
      stopAllAudioAndRecognition();
    }
    
    return () => {
      stopAllAudioAndRecognition();
    };
  }, [isOpen, stopAllAudioAndRecognition]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'he' ? 'he-IL' : language === 'ar' ? 'ar-SA' : 'en-US';
      recognition.maxAlternatives = 3; // Get multiple interpretations
      
      // Adjust timing for better responsiveness
      if ('speechRecognitionTimeout' in recognition) {
        (recognition as any).speechRecognitionTimeout = 10000; // 10 seconds
      }
      if ('interimResultsTimeout' in recognition) {
        (recognition as any).interimResultsTimeout = 2000; // 2 seconds
      }
      
      recognition.onstart = () => {
        console.log('Voice recognition started');
        setRecognitionActive(true);
        conversation.startListening();
        // Stop any audio playback when starting to listen
        stopAllAudio();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript.trim();
          if (event.results[i].isFinal) {
            // Prevent processing duplicate transcripts
            if (transcript && transcript !== lastProcessedTranscript.current) {
              lastProcessedTranscript.current = transcript;
              finalTranscript = transcript;
              
              // Create a unique key for this command
              const commandKey = `${transcript}_${Date.now()}`;
              
              // Only process if we haven't seen this exact command recently
              if (!processedCommands.current.has(commandKey)) {
                processedCommands.current.add(commandKey);
                
                // Clean up old commands after 5 seconds
                setTimeout(() => {
                  processedCommands.current.delete(commandKey);
                }, 5000);
                
                // Process the final transcript
                handleVoiceCommand(transcript);
              }
            }
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(interimTranscript || finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setRecognitionActive(false);
        conversation.stopListening();
        
        // Auto-restart recognition for recoverable errors
        if ((event.error === 'aborted' || event.error === 'no-speech' || event.error === 'network') && isOpen) {
          setTimeout(() => {
            if (isOpen && !recognitionActive && !isProcessing) {
              console.log(`Auto-restarting recognition after ${event.error}`);
              // Start fresh recognition
              try {
                recognitionRef.current?.start();
                setIsListening(true);
              } catch (e) {
                console.log('Failed to restart recognition:', e);
              }
            }
          }, event.error === 'no-speech' ? 100 : 500);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        setRecognitionActive(false);
        conversation.stopListening();
        
        // Auto-restart if chat is still open, was listening, and not processing
        if (isOpen && isListening && !isProcessing) {
          setTimeout(() => {
            if (isOpen && !isProcessing && !recognitionActive) {
              console.log('Auto-restarting recognition...');
              try {
                recognitionRef.current?.start();
                setIsListening(true);
              } catch (e) {
                console.log('Failed to restart recognition:', e);
              }
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
    }
  }, [language, stopAllAudioAndRecognition]);

  // Handle voice command
  const handleVoiceCommand = useCallback((command: string) => {
    // Don't process if assistant is speaking
    if (!conversation.canListen) {
      console.log('❌ Cannot process command while speaking');
      return;
    }
    
    setTranscript(command);
    setIsListening(false);
    conversation.startProcessing();
    
    // Stop recognition while processing
    if (recognitionRef.current && recognitionActive) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Recognition already stopped');
      }
    }
    
    // Parse and process command
    const parsedCommand = parseVoiceCommand(command);
    console.log('Parsed command:', parsedCommand);
    
    // Process the command with proper state handling
    processCommand(command);
  }, [processCommand, recognitionActive, conversation]);

  // Toggle listening with better error handling
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setShowText(true);
      return;
    }

    if (isListening || recognitionActive) {
      // Stop recognition
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (e) {
        console.log('Error stopping recognition:', e);
      }
      setIsListening(false);
      setRecognitionActive(false);
    } else {
      // Start recognition with error handling
      setTranscript('');
      try {
        // Ensure any previous instance is stopped
        if (recognitionActive) {
          recognitionRef.current.abort();
          setRecognitionActive(false);
          // Wait a bit before restarting
          setTimeout(() => {
            recognitionRef.current.start();
            setIsListening(true);
          }, 100);
        } else {
          recognitionRef.current.start();
          setIsListening(true);
        }
        
        // Play greeting if first interaction
        if (!transcript) {
          const greeting = GREETINGS[language][currentVoice];
          speak(greeting);
        }
      } catch (e) {
        console.error('Error starting recognition:', e);
        setIsListening(false);
        setRecognitionActive(false);
        setShowText(true);
      }
    }
  }, [isListening, recognitionActive, transcript, language, currentVoice, speak]);

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
      {/* Floating Voice Button - Brand Red */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-red-600 shadow-2xl flex items-center justify-center border-4 border-white ${
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

      {/* Voice Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
              onAnimationComplete={() => {
                // Play introduction when first opened
                if (!hasPlayedIntro && isOpen) {
                  setHasPlayedIntro(true);
                  setTimeout(() => {
                    speak(AGENT_INTRO[language][currentVoice], currentVoice);
                  }, 500);
                }
              }}
            >
              {/* Header - Brand Mint Gradient */}
              <div className="bg-gradient-to-r from-kfar-mint-dark to-kfar-mint p-4 text-white">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    {/* KFAR Logo */}
                    <div className="relative w-12 h-12 bg-white rounded-full p-1 shadow-lg">
                      <Image
                        src="/images/logos/kfar_icon_leaf_green.png"
                        alt="KFAR Logo"
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Voice Shopping</h2>
                      <p className="text-xs opacity-90">Kifar Marketplace</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Voice Selection - Brand Colors */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentVoice('yaakov');
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                      currentVoice === 'yaakov' 
                        ? 'bg-kfar-gold text-gray-900 shadow-lg' 
                        : 'bg-white/90 text-gray-900 hover:bg-white border-2 border-white/50'
                    }`}
                  >
                    Akh Yaakov
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentVoice('daniella');
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                      currentVoice === 'daniella' 
                        ? 'bg-kfar-gold text-gray-900 shadow-lg' 
                        : 'bg-white/90 text-gray-900 hover:bg-white border-2 border-white/50'
                    }`}
                  >
                    Akhot Daniella
                  </button>
                </div>
              </div>

              {/* Main Voice Area - Cream Background */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#FFF8E7]">
                {/* Voice Orb - Brand Mint */}
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
                  <p className="text-lg font-black text-gray-900">
                    {isProcessing ? '🤔 Processing your request...' : 
                     isListening ? '🔴 Listening... Speak now!' : 
                     'Tap the microphone to start'}
                  </p>
                  {transcript && (
                    <p className="text-base text-gray-900 mt-2 font-semibold bg-white p-3 rounded-lg shadow-lg border-2 border-kfar-gold/30">
                      "{transcript}"
                    </p>
                  )}
                  {isProcessing && (
                    <div className="mt-2 flex justify-center">
                      <motion.div
                        className="flex gap-1"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 bg-kfar-mint rounded-full" />
                        <div className="w-2 h-2 bg-kfar-mint rounded-full" />
                        <div className="w-2 h-2 bg-kfar-mint rounded-full" />
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Voice Suggestions - Brand Colors */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <button
                    onClick={() => handleVoiceCommand("What's on sale?")}
                    className="px-4 py-3 bg-kfar-mint hover:bg-kfar-mint-dark text-white rounded-full text-sm font-bold shadow-lg transition-all"
                  >
                    What's on sale?
                  </button>
                  <button
                    onClick={() => handleVoiceCommand("Show me best sellers")}
                    className="px-4 py-3 bg-kfar-mint hover:bg-kfar-mint-dark text-white rounded-full text-sm font-bold shadow-lg transition-all"
                  >
                    Best sellers
                  </button>
                  <button
                    onClick={() => handleVoiceCommand("I need hummus")}
                    className="px-4 py-3 bg-kfar-mint hover:bg-kfar-mint-dark text-white rounded-full text-sm font-bold shadow-lg transition-all"
                  >
                    I need hummus
                  </button>
                </div>

                {/* Product Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 bg-white p-4 rounded-xl shadow-xl border-2 border-kfar-gold/30">
                    <h3 className="text-base font-black text-gray-900 mb-3 flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5 text-kfar-gold" />
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
                    className="text-base text-kfar-mint hover:text-kfar-mint-dark font-black underline underline-offset-4"
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
                        className="flex-1 px-4 py-3 border-2 border-kfar-mint rounded-full focus:outline-none focus:border-kfar-mint-dark focus:ring-2 focus:ring-kfar-mint/20 text-gray-900 placeholder-gray-600 font-semibold bg-white"
                      />
                      <button
                        type="submit"
                        className="px-5 py-3 bg-kfar-gold hover:bg-kfar-gold-dark text-gray-900 rounded-full text-sm font-black shadow-lg transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Quick Actions Bar - Brand Colors */}
              <div className="bg-white px-4 py-3 border-t-2 border-kfar-gold/30">
                <div className="flex justify-around">
                  <button 
                    onClick={() => handleVoiceCommand("What's in my cart?")}
                    className="flex flex-col items-center gap-1 text-gray-900 hover:text-kfar-mint-dark transition-colors group">
                    <div className="p-3 bg-kfar-mint group-hover:bg-kfar-mint-dark rounded-full transition-all">
                      <ShoppingCartIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-black">Cart</span>
                  </button>
                  <button 
                    onClick={() => handleVoiceCommand("What's on sale?")}
                    className="flex flex-col items-center gap-1 text-gray-900 hover:text-kfar-mint-dark transition-colors group">
                    <div className="p-3 bg-kfar-mint group-hover:bg-kfar-mint-dark rounded-full transition-all">
                      <SparklesIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-black">Deals</span>
                  </button>
                  <button 
                    onClick={() => speak(AGENT_INTRO[language][currentVoice], currentVoice)}
                    className="flex flex-col items-center gap-1 text-gray-900 hover:text-kfar-mint-dark transition-colors group"
                  >
                    <div className="p-3 bg-kfar-mint group-hover:bg-kfar-mint-dark rounded-full transition-all">
                      <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-black">Help</span>
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
