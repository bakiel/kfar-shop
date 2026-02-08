'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicrophoneIcon, SpeakerWaveIcon, XMarkIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { StreamingTTSService } from '@/lib/elevenlabs/streaming-tts-service';

interface EnhancedVoiceChatProps {
  assistantName: string;
  gender: 'male' | 'female';
  language: string;
  onClose?: () => void;
}

export default function EnhancedVoiceChat({ 
  assistantName, 
  gender, 
  language,
  onClose 
}: EnhancedVoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Initializing...');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const serviceRef = useRef<StreamingTTSService | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const shouldListenRef = useRef(false);
  const isClosingRef = useRef(false);

  // Get voice ID based on gender - using working voice IDs
  const getVoiceId = () => {
    return gender === 'female' 
      ? process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_DANIELLA || 'EXAVITQu4vr4xnSDxMaL' // Sarah voice
      : process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_YAAKOV || 'ZMK5OD2jmsdse3EKE4W5'; // Daniel voice
  };

  // Setup speech recognition
  const setupSpeechRecognition = () => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      setStatus('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false; // Change to false for better control
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = language === 'he' ? 'he-IL' : language === 'ar' ? 'ar-SA' : 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      setStatus('Listening... Speak now');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Show interim results for feedback
      if (interimTranscript) {
        setStatus('Hearing: ' + interimTranscript);
      }
      
      if (finalTranscript) {
        console.log('Final transcript:', finalTranscript);
        setTranscript(prev => prev + '\nYou: ' + finalTranscript);
        shouldListenRef.current = false;
        recognition.stop();
        processUserInput(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      // Only log errors that aren't from intentional stops
      if (!isClosingRef.current && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          setStatus('No speech detected. Click microphone to try again.');
        } else if (event.error === 'not-allowed') {
          setStatus('Microphone access denied');
        } else if (event.error === 'network') {
          setStatus('Network error. Check your connection.');
        }
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // Auto-restart if we should be listening
      if (shouldListenRef.current && !isClosingRef.current && !isProcessing) {
        setTimeout(() => startListening(), 500);
      }
    };

    recognition.onspeechend = () => {
      console.log('Speech ended');
      recognition.stop();
    };

    recognition.onnomatch = () => {
      console.log('No match found');
      setStatus('Could not understand. Please try again.');
    };

    recognitionRef.current = recognition;
  };

  // Initialize on component mount
  useEffect(() => {
    setupSpeechRecognition();
    
    return () => {
      isClosingRef.current = true;
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [language]);

  // Process user input and get AI response
  const processUserInput = async (userText: string) => {
    try {
      setIsProcessing(true);
      setStatus('Thinking...');
      setIsSpeaking(true);
      
      // Call the chat API to get response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          language: language,
          assistantName: assistantName,
          gender: gender,
          conversationHistory: transcript.split('\n').filter(line => line.trim())
        })
      });

      const data = await response.json();
      
      if (data.response && serviceRef.current) {
        console.log('AI response:', data.response);
        setTranscript(prev => prev + '\n' + assistantName + ': ' + data.response);
        setStatus('Speaking...');
        
        // Clear audio queue
        audioQueueRef.current = [];
        
        // Stream the response
        const sentences = data.response.match(/[^.!?]+[.!?]+/g) || [data.response];
        
        for (let i = 0; i < sentences.length; i++) {
          serviceRef.current.sendText(sentences[i].trim(), i === sentences.length - 1);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Wait for speech to complete then listen again
        setTimeout(() => {
          setIsSpeaking(false);
          setIsProcessing(false);
          shouldListenRef.current = true;
          startListening();
        }, sentences.length * 500 + 1000);
      }
    } catch (error) {
      console.error('Error processing input:', error);
      setStatus('Error occurred. Click microphone to try again.');
      setIsSpeaking(false);
      setIsProcessing(false);
    }
  };

  // Initialize WebSocket connection
  const initializeService = async () => {
    try {
      setStatus('Connecting...');
      
      const service = new StreamingTTSService({
        apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
        voiceId: getVoiceId(),
        optimizeStreamingLatency: 2
      });

      service.on('audio', (audioData: ArrayBuffer) => {
        audioQueueRef.current.push(audioData);
        if (!isPlayingRef.current) {
          playNextAudio();
        }
      });

      service.on('error', (error: any) => {
        console.error('Service error:', error);
        setStatus('Connection error');
      });

      service.on('disconnected', () => {
        setIsConnected(false);
        setStatus('Disconnected');
      });

      await service.connect();
      serviceRef.current = service;
      setIsConnected(true);
      setStatus('Connected');
      
      // Send welcome message
      const welcomeText = `Shalom! I'm ${assistantName}. How can I help you today?`;
      setTranscript(assistantName + ': ' + welcomeText);
      setIsSpeaking(true);
      setStatus('Speaking...');
      service.sendText(welcomeText, true);
      
      // Start listening after welcome
      setTimeout(() => {
        setIsSpeaking(false);
        shouldListenRef.current = true;
        startListening();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to initialize:', error);
      setStatus('Failed to connect');
    }
  };

  // Play audio queue
  const playNextAudio = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift()!;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    try {
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        playNextAudio();
      };
      
      source.start();
    } catch (error) {
      console.error('Audio playback error:', error);
      playNextAudio();
    }
  };

  // Start listening with manual trigger
  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking && !isProcessing) {
      try {
        console.log('Starting speech recognition...');
        recognitionRef.current.start();
      } catch (error: any) {
        console.error('Failed to start recognition:', error);
        setStatus('Click microphone to speak');
      }
    }
  };

  // Manual microphone trigger
  const handleMicrophoneClick = () => {
    if (isListening) {
      // Stop listening
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setStatus('Stopped listening');
    } else {
      // Start listening
      shouldListenRef.current = true;
      startListening();
    }
  };

  // Start conversation
  const startConversation = async () => {
    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      isClosingRef.current = false;
      await initializeService();
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setStatus('Microphone access required');
    }
  };

  // End conversation
  const endConversation = () => {
    isClosingRef.current = true;
    shouldListenRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
    }
    
    if (serviceRef.current) {
      serviceRef.current.disconnect();
      serviceRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsConnected(false);
    if (onClose) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{assistantName}</h2>
              <p className="text-green-100">Voice Assistant</p>
            </div>
            <button
              onClick={endConversation}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {!isConnected ? (
            // Start screen
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <PhoneIcon className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-gray-600">
                Ready to start a voice conversation with {assistantName}?
              </p>
              <p className="text-sm text-gray-500">
                Make sure your microphone is enabled
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startConversation}
                className="px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
              >
                Start Conversation
              </motion.button>
            </div>
          ) : (
            // Active conversation
            <div className="space-y-6">
              {/* Voice Activity Indicator */}
              <div className="flex justify-center">
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMicrophoneClick}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isSpeaking ? 'bg-green-100' : isListening ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    disabled={isSpeaking || isProcessing}
                  >
                    {isSpeaking ? (
                      <SpeakerWaveIcon className="h-16 w-16 text-green-600" />
                    ) : (
                      <MicrophoneIcon className={`h-16 w-16 ${
                        isListening ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    )}
                  </motion.button>
                  
                  {/* Voice activity animation */}
                  {(isListening || isSpeaking) && (
                    <div className="absolute inset-0 -m-2 pointer-events-none">
                      <div className="w-36 h-36 rounded-full border-4 border-current opacity-50 animate-ping" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">{status}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {!isSpeaking && !isListening && 'Click the microphone to speak'}
                </p>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {transcript}
                  </p>
                </div>
              )}

              {/* End Call Button */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endConversation}
                  className="px-6 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors"
                >
                  End Conversation
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}