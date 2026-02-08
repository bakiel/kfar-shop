import { useState, useCallback, useRef } from 'react';

export type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking' | 'waiting_for_user';

interface ConversationManager {
  state: ConversationState;
  isUserSpeaking: boolean;
  isAssistantSpeaking: boolean;
  canSpeak: boolean;
  canListen: boolean;
  startListening: () => void;
  stopListening: () => void;
  startSpeaking: () => void;
  stopSpeaking: () => void;
  startProcessing: () => void;
  reset: () => void;
}

export function useConversationManager(): ConversationManager {
  const [state, setState] = useState<ConversationState>('idle');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  
  // Cooldown to prevent rapid state changes
  const lastStateChange = useRef<number>(Date.now());
  const MIN_STATE_DURATION = 800; // Increased from 500ms to prevent rapid transitions
  
  // Track silence detection
  const silenceTimeout = useRef<NodeJS.Timeout | null>(null);
  const SILENCE_THRESHOLD = 1500; // 1.5 seconds of silence before allowing new speech
  
  const canChangeState = useCallback(() => {
    return Date.now() - lastStateChange.current > MIN_STATE_DURATION;
  }, []);
  
  const updateState = useCallback((newState: ConversationState) => {
    if (!canChangeState()) {
      console.log('⏱️ State change blocked - too rapid');
      return;
    }
    
    console.log(`🔄 Conversation state: ${state} → ${newState}`);
    setState(newState);
    lastStateChange.current = Date.now();
  }, [state, canChangeState]);
  
  const startListening = useCallback(() => {
    if (state === 'speaking') {
      console.log('❌ Cannot listen while speaking');
      return;
    }
    setIsUserSpeaking(true);
    setIsAssistantSpeaking(false);
    updateState('listening');
  }, [state, updateState]);
  
  const stopListening = useCallback(() => {
    setIsUserSpeaking(false);
    if (state === 'listening') {
      updateState('processing');
    }
  }, [state, updateState]);
  
  const startSpeaking = useCallback(() => {
    if (state === 'listening' || isUserSpeaking) {
      console.log('❌ Cannot speak while user is speaking');
      return;
    }
    setIsAssistantSpeaking(true);
    setIsUserSpeaking(false);
    updateState('speaking');
  }, [state, isUserSpeaking, updateState]);
  
  const stopSpeaking = useCallback(() => {
    setIsAssistantSpeaking(false);
    updateState('waiting_for_user');
    
    // Clear any existing silence timeout
    if (silenceTimeout.current) {
      clearTimeout(silenceTimeout.current);
    }
    
    // Wait for silence before allowing new speech
    silenceTimeout.current = setTimeout(() => {
      if (state === 'waiting_for_user') {
        updateState('idle');
      }
    }, SILENCE_THRESHOLD);
  }, [state, updateState]);
  
  const startProcessing = useCallback(() => {
    setIsUserSpeaking(false);
    setIsAssistantSpeaking(false);
    updateState('processing');
  }, [updateState]);
  
  const reset = useCallback(() => {
    setIsUserSpeaking(false);
    setIsAssistantSpeaking(false);
    updateState('idle');
  }, [updateState]);
  
  // Computed properties
  const canSpeak = !isUserSpeaking && state !== 'listening';
  const canListen = !isAssistantSpeaking && state !== 'speaking';
  
  return {
    state,
    isUserSpeaking,
    isAssistantSpeaking,
    canSpeak,
    canListen,
    startListening,
    stopListening,
    startSpeaking,
    stopSpeaking,
    startProcessing,
    reset
  };
}