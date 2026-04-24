import { useState, useEffect, useRef, useCallback } from 'react';
import { ElevenLabsWebSocketService } from '@/lib/elevenlabs/websocket-service';
import { VOICE_CONFIG, VoiceAssistant, Language } from '@/config/voice';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

interface UseHybridChatOptions {
  assistant: VoiceAssistant;
  language: Language;
  mode: 'voice' | 'text';
}

export function useHybridChat({ assistant, language, mode }: UseHybridChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const wsServiceRef = useRef<ElevenLabsWebSocketService | null>(null);
  const recognitionRef = useRef<any>(null);
  const conversationHistoryRef = useRef<string[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (mode === 'voice' && !wsServiceRef.current) {
      initializeVoiceService();
    }
    
    return () => {
      if (wsServiceRef.current) {
        wsServiceRef.current.disconnect();
        wsServiceRef.current = null;
      }
    };
  }, [mode, assistant]);

  const initializeVoiceService = async () => {
    try {
      setConnectionStatus('connecting');
      
      const voiceConfig = VOICE_CONFIG[assistant];
      const service = new ElevenLabsWebSocketService({
        apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY!,
        voiceId: voiceConfig.id,
        voiceSettings: voiceConfig.settings,
        optimizeStreamingLatency: 3
      });

      service.on('connected', () => {
        setConnectionStatus('connected');
        console.log('Voice service connected');
      });

      service.on('audio', (audioData) => {
        // Audio is played automatically by the service
      });

      service.on('playbackComplete', () => {
        setIsSpeaking(false);
      });

      service.on('error', (error) => {
        console.error('Voice service error:', error);
        setConnectionStatus('disconnected');
      });

      await service.connect();
      wsServiceRef.current = service;
      
    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      setConnectionStatus('disconnected');
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'he' ? 'he-IL' : language === 'ar' ? 'ar-SA' : 'en-US';

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript;
        
        if (event.results[last].isFinal) {
          handleVoiceInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const handleVoiceInput = async (transcript: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: transcript,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    conversationHistoryRef.current.push(`User: ${transcript}`);
    
    // Get AI response
    await processWithAI(transcript);
  };

  const processWithAI = async (input: string) => {
    try {
      setIsSpeaking(true);
      
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          language,
          assistantName: VOICE_CONFIG[assistant].name,
          gender: assistant === 'yaakov' ? 'male' : 'female',
          conversationHistory: conversationHistoryRef.current
        })
      });

      const data = await response.json();
      
      if (data.response) {
        // Add bot message
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: data.suggestions
        };
        
        setMessages(prev => [...prev, botMessage]);
        conversationHistoryRef.current.push(`Bot: ${data.response}`);
        
        // Stream to voice if in voice mode
        if (mode === 'voice' && wsServiceRef.current && wsServiceRef.current.isConnected) {
          // Split into sentences for better streaming
          const sentences = data.response.match(/[^.!?]+[.!?]+/g) || [data.response];
          
          for (let i = 0; i < sentences.length; i++) {
            wsServiceRef.current.sendText(
              sentences[i].trim(),
              i === sentences.length - 1 // Flush on last sentence
            );
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } else {
          // If voice is not available, mark as not speaking
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      console.error('AI processing error:', error);
      setIsSpeaking(false);
    }
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, isSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    conversationHistoryRef.current.push(`User: ${text}`);
    
    await processWithAI(text);
  }, [language, assistant, mode]);

  return {
    messages,
    isListening,
    isSpeaking,
    connectionStatus,
    sendMessage,
    startListening,
    stopListening
  };
}
