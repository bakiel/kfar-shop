'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, MicrophoneIcon, SpeakerWaveIcon, SpeakerXMarkIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobeAltIcon, UserIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import dynamic from 'next/dynamic';

// Dynamically import EnhancedVoiceChat to avoid SSR issues
const EnhancedVoiceChat = dynamic(() => import('./EnhancedVoiceChat'), { ssr: false });

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

interface ChatSettings {
  language: 'en' | 'he' | 'ar';
  gender: 'male' | 'female';
  voiceEnabled: boolean;
}

// Voice configuration - using actual ElevenLabs voice IDs
const VOICE_CONFIG = {
  male: {
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_YAAKOV || 'ZMK5OD2jmsdse3EKE4W5',
    name: 'Akh Yaakov',
    pitch: 0.9,
    speakingRate: 1.0
  },
  female: {
    id: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_DANIELLA || '85DL3i4Z7PIWbcOYSlQl', 
    name: 'Akhot Daniella',
    pitch: 1.1,
    speakingRate: 1.0
  }
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showEnhancedVoice, setShowEnhancedVoice] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    language: 'he',
    gender: 'male',
    voiceEnabled: true // Changed to true by default
  });
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Track conversation history for context
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  
  const assistantName = settings.gender === 'male' ? 'Akh Yaakov' : 'Akhot Daniella';
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const getWelcomeMessage = () => {
    const greetings = {
      en: `Shalom Shalom! Welcome to K'far Marketplace. I'm ${assistantName}. How can I help you today?`,
      he: `שלום שלום! ברוכים הבאים ל-K'far Marketplace. אני ${assistantName}. איך אוכל לעזור לך היום?`,
      ar: `شالوم شالوم! مرحبا بكم في سوق كفار. أنا ${assistantName}. كيف يمكنني مساعدتك اليوم؟`
    };
    return greetings[settings.language];
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = settings.language === 'he' ? 'he-IL' : settings.language === 'ar' ? 'ar-SA' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [settings.language]);

  // Initialize welcome message and conversation history when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg = {
        id: '1',
        text: getWelcomeMessage(),
        sender: 'bot' as const,
        timestamp: new Date(),
        suggestions: settings.language === 'he' 
          ? ['חפש מוצרים', 'מידע על חנויות', 'מתכונים טבעוניים']
          : settings.language === 'ar'
          ? ['ابحث عن منتجات', 'معلومات عن المتاجر', 'وصفات نباتية']
          : ['Browse marketplace', "Today's specials", 'About K\'far']
      };
      setMessages([welcomeMsg]);
      // Initialize conversation history
      setConversationHistory([`Bot: ${welcomeMsg.text}`]);
    }
  }, [isOpen]);

  // Reset conversation when settings change
  useEffect(() => {
    if (messages.length > 0) {
      // Clear messages and history when language or assistant changes
      setMessages([]);
      setConversationHistory([]);
    }
  }, [settings.language, settings.gender]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Text-to-Speech function - using Web Speech API
  const speakText = async (text: string) => {
    console.log('speakText called with:', text);
    console.log('Voice enabled:', settings.voiceEnabled);
    
    if (!settings.voiceEnabled) {
      console.log('Voice is disabled');
      return;
    }
    
    try {
      setIsSpeaking(true);
      console.log('Calling fallbackToWebSpeech...');
      
      // Always use Web Speech API for now (ElevenLabs requires API key)
      fallbackToWebSpeech(text);
      
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };



  // Fallback to browser's speech synthesis
  const fallbackToWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Language settings
      utterance.lang = settings.language === 'he' ? 'he-IL' : settings.language === 'ar' ? 'ar-SA' : 'en-US';
      
      // Voice characteristics
      utterance.pitch = settings.gender === 'female' ? 1.1 : 0.9;
      utterance.rate = 1.0;
      utterance.volume = 1.0;
      
      // Function to set voice and speak
      const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
        
        if (voices.length > 0) {
          // Try to find preferred voice based on language and gender
          let selectedVoice = null;
          
          // First try to find voice matching language and gender
          selectedVoice = voices.find(voice => {
            const voiceLang = voice.lang.toLowerCase();
            const targetLang = utterance.lang.toLowerCase();
            const isLangMatch = voiceLang.startsWith(targetLang.split('-')[0]);
            const isGenderMatch = settings.gender === 'female' ? 
              voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') :
              voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man');
            return isLangMatch && (isGenderMatch || true); // Accept any gender if no match
          });
          
          // If no exact match, just find one with the right language
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => 
              voice.lang.toLowerCase().startsWith(utterance.lang.toLowerCase().split('-')[0])
            );
          }
          
          // If still no match, use first available voice
          if (!selectedVoice && voices.length > 0) {
            selectedVoice = voices[0];
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
          }
        }
        
        utterance.onend = () => {
          console.log('Speech ended');
          setIsSpeaking(false);
        };
        
        utterance.onerror = (event) => {
          console.error('Speech error:', event);
          setIsSpeaking(false);
        };
        
        // Speak the text
        window.speechSynthesis.speak(utterance);
        console.log('Speaking:', text.substring(0, 50) + '...');
      };
      
      // Check if voices are already loaded
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak();
      } else {
        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
          setVoiceAndSpeak();
        };
        // Try to trigger voice loading
        window.speechSynthesis.getVoices();
      }
    } else {
      console.error('Speech synthesis not supported');
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation history BEFORE sending
    const updatedHistory = [...conversationHistory, `User: ${inputText}`];
    setConversationHistory(updatedHistory);
    
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputText,
          language: settings.language,
          assistantName: assistantName,
          gender: settings.gender,
          conversationHistory: updatedHistory // Send the updated history
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Chat response received:', data);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.error || 'No response received',
        sender: 'bot',
        timestamp: new Date(),
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update conversation history with bot response
      setConversationHistory(prev => [...prev, `Bot: ${botMessage.text}`]);
      
      // Speak the response if voice is enabled
      console.log('About to speak. Voice enabled:', settings.voiceEnabled, 'Response:', data.response);
      if (settings.voiceEnabled && data.response) {
        console.log('Calling speakText with response');
        await speakText(data.response);
      } else {
        console.log('Not speaking because:', !settings.voiceEnabled ? 'voice disabled' : 'no response');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      console.error('Error details:', error.message);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: settings.language === 'he' 
          ? 'סליחה, נתקלתי בבעיה. אנא נסה שוב.'
          : settings.language === 'ar'
          ? 'عذرًا، واجهت مشكلة. يرجى المحاولة مرة أخرى.'
          : 'Sorry, I encountered a problem. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    inputRef.current?.focus();
  };

  const handleSettingsChange = (newSettings: ChatSettings) => {
    setSettings(newSettings);
    if (!newSettings.voiceEnabled && isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
  };

  const getPlaceholder = () => {
    const placeholders = {
      en: "Type your message...",
      he: "הקלד הודעה...",
      ar: "اكتب رسالتك..."
    };
    return placeholders[settings.language];
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full p-4 shadow-lg ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-96 h-full sm:h-[600px] bg-white sm:rounded-lg shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <UserCircleIcon className="h-5 w-5" />
                    {assistantName}
                  </h3>
                  <p className="text-sm opacity-90">K'far Marketplace Guide</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Phone button - disabled if no ElevenLabs API key */}
                  {process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY && (
                    <button
                      onClick={() => setShowEnhancedVoice(true)}
                      className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                      title="Start voice conversation"
                    >
                      <PhoneIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleSettingsChange({...settings, voiceEnabled: !settings.voiceEnabled})}
                    className={`text-white hover:bg-white/20 rounded-full p-1 transition-colors ${settings.voiceEnabled ? 'bg-white/20' : ''}`}
                    title={settings.voiceEnabled ? 'Disable voice' : 'Enable voice'}
                  >
                    {settings.voiceEnabled ? <SpeakerWaveIcon className="h-5 w-5" /> : <SpeakerXMarkIcon className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Always Visible Language & Gender Options */}
              <div className="bg-green-700/50 rounded-lg p-2 space-y-2">
                {/* Language Selection */}
                <div className="flex items-center gap-2">
                  <GlobeAltIcon className="h-4 w-4 opacity-70" />
                  <div className="flex gap-1 flex-1">
                    <button
                      onClick={() => handleSettingsChange({...settings, language: 'he'})}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        settings.language === 'he' 
                          ? 'bg-white text-green-700 shadow-sm' 
                          : 'bg-green-600/50 hover:bg-green-600 text-white'
                      }`}
                    >
                      עברית
                    </button>
                    <button
                      onClick={() => handleSettingsChange({...settings, language: 'en'})}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        settings.language === 'en' 
                          ? 'bg-white text-green-700 shadow-sm' 
                          : 'bg-green-600/50 hover:bg-green-600 text-white'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleSettingsChange({...settings, language: 'ar'})}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        settings.language === 'ar' 
                          ? 'bg-white text-green-700 shadow-sm' 
                          : 'bg-green-600/50 hover:bg-green-600 text-white'
                      }`}
                    >
                      العربية
                    </button>
                  </div>
                </div>
                
                {/* Gender/Assistant Selection */}
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 opacity-70" />
                  <div className="flex gap-1 flex-1">
                    <button
                      onClick={() => handleSettingsChange({...settings, gender: 'male'})}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        settings.gender === 'male' 
                          ? 'bg-white text-green-700 shadow-sm' 
                          : 'bg-green-600/50 hover:bg-green-600 text-white'
                      }`}
                      title="Male voice"
                    >
                      <span className="hidden sm:inline">Akh Yaakov</span>
                      <span className="sm:hidden">Male</span>
                    </button>
                    <button
                      onClick={() => handleSettingsChange({...settings, gender: 'female'})}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        settings.gender === 'female' 
                          ? 'bg-white text-green-700 shadow-sm' 
                          : 'bg-green-600/50 hover:bg-green-600 text-white'
                      }`}
                      title="Female voice"
                    >
                      <span className="hidden sm:inline">Akhot Daniella</span>
                      <span className="sm:hidden">Female</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    {message.suggestions && (
                      <div className="mt-2 space-y-1">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded px-2 py-1 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Container */}
            <div className="border-t bg-white p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={toggleListening}
                  className={`rounded-full p-2 transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                >
                  <MicrophoneIcon className="h-5 w-5" />
                </motion.button>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={getPlaceholder()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  dir="auto"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="bg-green-600 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Voice Chat Modal */}
      {showEnhancedVoice && (
        <React.Suspense fallback={null}>
          <div style={{ display: showEnhancedVoice ? 'block' : 'none' }}>
            <EnhancedVoiceChat
              assistantName={assistantName}
              gender={settings.gender}
              language={settings.language}
              onClose={() => setShowEnhancedVoice(false)}
            />
          </div>
        </React.Suspense>
      )}
    </>
  );
}