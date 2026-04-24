import { useRef, useCallback, useEffect } from 'react';

interface AudioQueueItem {
  text: string;
  voice: 'yaakov' | 'daniella';
  priority?: 'high' | 'normal';
  onStart?: () => void;
  onEnd?: () => void;
}

interface AudioQueueOptions {
  onAudioStart?: () => void;
  onAudioEnd?: () => void;
  maxQueueSize?: number;
}

export function useAudioQueue(options: AudioQueueOptions = {}) {
  const { onAudioStart, onAudioEnd, maxQueueSize = 3 } = options;
  const audioQueue = useRef<AudioQueueItem[]>([]);
  const currentAudio = useRef<HTMLAudioElement | null>(null);
  const isPlaying = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // Stop all audio immediately
  const stopAllAudio = useCallback(() => {
    console.log('🛑 Stopping all audio and clearing queue');
    
    // Abort any pending requests
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    
    // Clear the queue
    audioQueue.current = [];
    isPlaying.current = false;
    
    // Stop current audio
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.src = '';
      currentAudio.current = null;
    }
    
    // Cancel browser speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Stop all audio elements on the page
    const audioElements = document.getElementsByTagName('audio');
    for (let i = 0; i < audioElements.length; i++) {
      audioElements[i].pause();
      audioElements[i].src = '';
      audioElements[i].remove();
    }
    
    // Notify that audio has ended
    onAudioEnd?.();
  }, [onAudioEnd]);

  // Process the queue
  const processQueue = useCallback(async () => {
    if (isPlaying.current || audioQueue.current.length === 0) {
      return;
    }

    const item = audioQueue.current.shift();
    if (!item) return;

    isPlaying.current = true;
    
    // Notify start
    item.onStart?.();
    onAudioStart?.();

    try {
      console.log('🎤 Playing:', item.text.substring(0, 50));
      
      // Create new abort controller for this request
      abortController.current = new AbortController();
      
      const response = await fetch('/api/voice/v3-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: item.text, 
          voice: item.voice,
          stream: false
        }),
        signal: abortController.current.signal
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      if (data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        currentAudio.current = audio;
        
        // When audio ends, process next in queue
        audio.onended = () => {
          currentAudio.current = null;
          isPlaying.current = false;
          item.onEnd?.();
          onAudioEnd?.();
          
          // Small delay before next audio to prevent overlap
          setTimeout(() => processQueue(), 300);
        };
        
        audio.onerror = () => {
          console.error('Audio playback error');
          currentAudio.current = null;
          isPlaying.current = false;
          item.onEnd?.();
          onAudioEnd?.();
          
          // Continue with next item after delay
          setTimeout(() => processQueue(), 300);
        };
        
        await audio.play();
      } else {
        throw new Error('No audio data received');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🛑 Audio request aborted');
      } else {
        console.error('❌ Audio error:', error);
      }
      isPlaying.current = false;
      item.onEnd?.();
      onAudioEnd?.();
      
      // Continue processing queue even on error
      setTimeout(() => processQueue(), 300);
    }
  }, [onAudioStart, onAudioEnd]);

  // Add to queue with optional priority
  const speak = useCallback(async (
    text: string, 
    voice: 'yaakov' | 'daniella' = 'daniella', 
    priority?: 'high' | 'normal',
    callbacks?: { onStart?: () => void; onEnd?: () => void }
  ) => {
    // Prevent queue overflow
    if (audioQueue.current.length >= maxQueueSize && priority !== 'high') {
      console.log('⚠️ Audio queue full, dropping message');
      return;
    }
    
    const item: AudioQueueItem = {
      text,
      voice,
      priority: priority || 'normal',
      onStart: callbacks?.onStart,
      onEnd: callbacks?.onEnd
    };
    
    if (priority === 'high') {
      // Stop current and clear queue for high priority
      stopAllAudio();
      audioQueue.current = [item];
    } else {
      // Add to queue
      audioQueue.current.push(item);
    }
    
    // Start processing
    processQueue();
  }, [processQueue, stopAllAudio, maxQueueSize]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

  return {
    speak,
    stopAllAudio,
    isPlaying: isPlaying.current,
    queueLength: audioQueue.current.length
  };
}