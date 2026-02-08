'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Settings, Send } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  audioUrl?: string;
  suggestions?: string[];
}

interface ChatSettings {
  voiceEnabled: boolean;
  autoListen: boolean; // Auto-listen after bot speaks
  language: 'en' | 'he' | 'ar';
  gender: 'male' | 'female';
  continuous: boolean; // Continuous conversation mode
}

export default function VoiceChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    voiceEnabled: true,
    autoListen: true,
    language: 'en',
    gender: 'male',
    continuous: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Assistant names based on gender
  const assistantName = settings.gender === 'male' ? 'Akh Yaakov' : 'Akhot Daniela';

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = settings.language === 'he' ? 'he-IL' : 
                                   settings.language === 'ar' ? 'ar-SA' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
          setInputText('');
          handleSendMessage(transcript);
          setIsListening(false);
        } else {
          setInputText(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInputText('');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const sendGreeting = async () => {
    // Only send greeting once per session
    if (hasGreeted || messages.length > 0) return;
    
    setHasGreeted(true);
    
    const greetingMessage: Message = {
      id: Date.now().toString(),
      text: "Shalom Shalom! Welcome to K'far Marketplace. I'm " + assistantName + ". How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages([greetingMessage]);
    
    if (settings.voiceEnabled) {
      await speakMessage(greetingMessage.text);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setInputText('Listening...');
    }
  };

  const speakMessage = async (text: string): Promise<void> => {
    if (!settings.voiceEnabled) return;
    
    setIsSpeaking(true);
    
    try {
      // Get audio from TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          gender: settings.gender,
          language: settings.language
        })
      });

      const data = await response.json();
      
      if (data.audioUrl) {
        // Play the audio
        const audio = new Audio(data.audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          // Auto-listen after bot speaks in continuous mode
          if (settings.continuous && settings.autoListen) {
            setTimeout(() => {
              toggleListening();
            }, 500);
          }
        };
        
        audio.onerror = () => {
          console.error('Audio playback error');
          setIsSpeaking(false);
          // Fallback to browser TTS
          fallbackToWebSpeech(text);
        };
        
        await audio.play();
      } else if (data.fallback) {
        fallbackToWebSpeech(text);
      }
    } catch (error) {
      console.error('TTS error:', error);
      fallbackToWebSpeech(text);
    }
  };
  const fallbackToWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.language === 'he' ? 'he-IL' : 
                       settings.language === 'ar' ? 'ar-SA' : 'en-US';
      utterance.pitch = settings.gender === 'female' ? 1.0 : 0.8;
      utterance.rate = 1.1;
      
      utterance.onend = () => {
        setIsSpeaking(false);
        if (settings.continuous && settings.autoListen) {
          setTimeout(() => toggleListening(), 500);
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      // Build conversation history INCLUDING the current message
      const allMessages = [...messages, userMessage];
      const conversationHistory = allMessages.map(m => `${m.sender}: ${m.text}`);
      
      // Send to chat API with FULL conversation history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          language: settings.language,
          assistantName: assistantName,
          gender: settings.gender,
          enableVoice: settings.voiceEnabled,
          conversationHistory: conversationHistory
        }),
      });
      
      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.error || 'No response received',
        sender: 'bot',
        timestamp: new Date(),
        audioUrl: data.audioUrl,
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response
      if (settings.voiceEnabled) {
        await speakMessage(botMessage.text);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered a problem. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          if (!hasGreeted) {
            sendGreeting();
          }
        }}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all duration-300 z-50 group"
        aria-label="Open voice chat"
      >
        <div className="relative">
          <Mic className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </div>
        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Voice Chat
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-lg flex items-center justify-between">
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
            <h3 className="font-semibold">K'far Voice Chat</h3>
            <p className="text-xs opacity-90">{assistantName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/20 rounded transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-100 p-4 border-b">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Continuous Mode</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, continuous: !prev.continuous }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.continuous ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.continuous ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-Listen</span>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoListen: !prev.autoListen }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings.autoListen ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.autoListen ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Voice</span>
              <select
                value={settings.gender}
                onChange={(e) => setSettings(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="male">Akh Yaakov</option>
                <option value="female">Akhot Daniela</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${
              message.sender === 'user' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            } rounded-lg p-3`}>
              <p className="text-sm">{message.text}</p>
              {message.audioUrl && (
                <button
                  onClick={() => {
                    const audio = new Audio(message.audioUrl);
                    audio.play();
                  }}
                  className="mt-2 text-xs opacity-70 hover:opacity-100"
                >
                  🔊 Replay
                </button>
              )}
              {message.suggestions && (
                <div className="mt-2 space-x-2">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Controls */}
      <div className="border-t p-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Mic Button */}
          <button
            onClick={toggleListening}
            disabled={isSpeaking || isProcessing}
            className={`p-4 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 text-white scale-110 animate-pulse' 
                : 'bg-green-600 text-white hover:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Speaker Button */}
          <button
            onClick={isSpeaking ? stopSpeaking : undefined}
            disabled={!isSpeaking}
            className={`p-3 rounded-full transition-all duration-300 ${
              isSpeaking 
                ? 'bg-orange-500 text-white animate-pulse' 
                : 'bg-gray-300 text-gray-500'
            } disabled:cursor-not-allowed`}
            aria-label={isSpeaking ? 'Stop speaking' : 'Speaker'}
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Status Text */}
        <div className="text-center mt-3">
          {isListening && (
            <p className="text-sm text-gray-600 animate-pulse">
              {inputText === 'Listening...' ? 'Listening...' : inputText}
            </p>
          )}
          {isSpeaking && (
            <p className="text-sm text-gray-600">Speaking...</p>
          )}
          {isProcessing && (
            <p className="text-sm text-gray-600">Processing...</p>
          )}
          {!isListening && !isSpeaking && !isProcessing && (
            <p className="text-sm text-gray-500">
              {settings.continuous ? 'Voice chat active' : 'Press mic to speak'}
            </p>
          )}
        </div>

        {/* Text Input (Hidden in continuous mode) */}
        {!settings.continuous && (
          <div className="mt-3 flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isProcessing}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}