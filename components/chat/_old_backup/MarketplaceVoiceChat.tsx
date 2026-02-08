'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function MarketplaceVoiceChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<string>('');

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        transcriptRef.current = transcript;
        
        if (event.results[current].isFinal) {
          handleVoiceInput(transcript);
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        transcriptRef.current = '';
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);
  // Initialize chat with greeting
  const initializeChat = async () => {
    if (hasInitialized) return;
    setHasInitialized(true);
    
    const greeting: Message = {
      id: Date.now().toString(),
      text: "Shalom Shalom! Welcome to K'far Marketplace. I'm Akh Yaakov, your voice assistant. Just click the microphone and tell me what you're looking for!",
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages([greeting]);
    await speakMessage(greeting.text);
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Handle voice input
  const handleVoiceInput = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process with AI
    await processWithAI(text);
  };

  // Process message with AI
  const processWithAI = async (text: string) => {
    setIsProcessing(true);
    
    try {
      // Get conversation history INCLUDING the user's message that we just added
      const allMessages = [...messages, { sender: 'user', text }];
      const history = allMessages.map(m => `${m.sender}: ${m.text}`);
      
      console.log('Sending to AI with history:', history);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          language: 'en',
          assistantName: 'Akh Yaakov',
          gender: 'male',
          enableVoice: true,
          conversationHistory: history
        }),
      });
      
      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'I didn\'t quite catch that. Could you please repeat?',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      await speakMessage(botMessage.text);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m having trouble connecting. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  // Speak message using TTS
  const speakMessage = async (text: string): Promise<void> => {
    setIsSpeaking(true);
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          gender: 'male'
        })
      });

      const data = await response.json();
      
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          // Auto-listen after bot speaks for continuous conversation
          setTimeout(() => {
            if (isOpen) toggleListening();
          }, 500);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          // Fallback to browser TTS
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 0.8;
            utterance.rate = 1.1;
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
          }
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Open/close handlers
  const openChat = () => {
    setIsOpen(true);
    if (!hasInitialized) {
      initializeChat();
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    stopSpeaking();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all duration-300 z-50 group animate-pulse-soft"
        aria-label="Open voice chat"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          <Mic className="w-3 h-3 absolute -bottom-1 -right-1" />
        </div>
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Voice Assistant
        </span>
      </button>
    );
  }
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">K'far Voice Assistant</h3>
            <p className="text-xs opacity-90">Akh Yaakov</p>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
              message.sender === 'user' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-800 shadow-sm'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Control */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleListening}
            disabled={isSpeaking || isProcessing}
            className={`p-4 rounded-full transition-all duration-300 transform ${
              isListening 
                ? 'bg-red-500 text-white scale-110 animate-pulse' 
                : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-3 bg-orange-500 text-white rounded-full animate-pulse"
              aria-label="Stop speaking"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="text-center mt-2">
          {isListening && (
            <p className="text-sm text-gray-600 animate-pulse">
              Listening... {transcriptRef.current}
            </p>
          )}
          {isSpeaking && (
            <p className="text-sm text-gray-600">Speaking...</p>
          )}
          {!isListening && !isSpeaking && !isProcessing && (
            <p className="text-sm text-gray-500">
              Click the microphone to speak
            </p>
          )}
        </div>
      </div>
    </div>
  );
}