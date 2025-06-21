import { useState, useEffect, useRef, useCallback } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  vendor?: string;
  vendorId?: string;
  link?: string;
  description?: string;
}

export function useKfarChat(defaultVoice: 'yaakov' | 'daniella' = 'daniella') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [currentVoice, setCurrentVoice] = useState<'yaakov' | 'daniella'>(defaultVoice);
  const [wasVoiceInput, setWasVoiceInput] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Default to English
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        // Stop any ongoing speech
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setIsSpeaking(false);
      };

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
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleVoiceInput = async (transcript: string) => {
    setWasVoiceInput(true);
    await sendMessage(transcript);
  };

  const sendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API endpoint for processing
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: text,
          includeProducts: true 
        })
      });

      const data = await response.json();
      
      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm here to help you explore KFAR marketplace!",
        sender: 'bot',
        timestamp: new Date(),
        products: data.products
      };
      
      setMessages(prev => [...prev, botMessage]);

      // Update suggested products
      if (data.suggestedProducts) {
        setSuggestedProducts(data.suggestedProducts);
      }

      // Speak response only if it was voice input
      if (wasVoiceInput && data.response) {
        await speakResponse(data.response);
        setWasVoiceInput(false); // Reset the flag
      }

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakResponse = async (text: string, voice?: 'yaakov' | 'daniella') => {
    // Cancel any existing speech first
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    const selectedVoice = voice || currentVoice;
    
    try {
      setIsSpeaking(true);
      console.log('🎤 Speaking with ElevenLabs V3:', { text: text.substring(0, 50), voice: selectedVoice });
      
      const response = await fetch('/api/voice/v3-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          voice: selectedVoice,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`V3 API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.audio) {
        console.log('✅ Playing ElevenLabs V3 audio');
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          console.error('Audio playback error');
        };
        
        await audio.play();
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('❌ Voice synthesis error:', error);
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

  return {
    messages,
    isListening,
    isSpeaking,
    isLoading,
    suggestedProducts,
    currentVoice,
    setCurrentVoice,
    sendMessage,
    startListening,
    stopListening
  };
}