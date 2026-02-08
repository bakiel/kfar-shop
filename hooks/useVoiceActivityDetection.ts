import { useRef, useCallback, useEffect } from 'react';

interface VoiceActivityDetectionOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  silenceThreshold?: number; // ms
  noiseThreshold?: number; // dB
}

export function useVoiceActivityDetection(options: VoiceActivityDetectionOptions = {}) {
  const {
    onSpeechStart,
    onSpeechEnd,
    silenceThreshold = 1500, // 1.5 seconds
    noiseThreshold = -50 // dB
  } = options;

  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const microphone = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafId = useRef<number | null>(null);
  const isSpeaking = useRef(false);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const stream = useRef<MediaStream | null>(null);

  // Initialize audio context and analyser
  const initialize = useCallback(async () => {
    try {
      // Get microphone access
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 2048;
      
      // Connect microphone to analyser
      microphone.current = audioContext.current.createMediaStreamSource(stream.current);
      microphone.current.connect(analyser.current);
      
      // Start monitoring
      monitor();
    } catch (error) {
      console.error('Failed to initialize voice activity detection:', error);
    }
  }, []);

  // Monitor audio levels
  const monitor = useCallback(() => {
    if (!analyser.current) return;

    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkAudio = () => {
      if (!analyser.current) return;
      
      analyser.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      // Convert to decibels
      const decibels = 20 * Math.log10(average / 255);
      
      // Check if speaking
      if (decibels > noiseThreshold) {
        if (!isSpeaking.current) {
          isSpeaking.current = true;
          onSpeechStart?.();
        }
        
        // Clear silence timer
        if (silenceTimer.current) {
          clearTimeout(silenceTimer.current);
          silenceTimer.current = null;
        }
      } else if (isSpeaking.current) {
        // Start silence timer
        if (!silenceTimer.current) {
          silenceTimer.current = setTimeout(() => {
            isSpeaking.current = false;
            onSpeechEnd?.();
            silenceTimer.current = null;
          }, silenceThreshold);
        }
      }
      
      rafId.current = requestAnimationFrame(checkAudio);
    };
    
    checkAudio();
  }, [noiseThreshold, silenceThreshold, onSpeechStart, onSpeechEnd]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
    
    if (microphone.current) {
      microphone.current.disconnect();
      microphone.current = null;
    }
    
    if (analyser.current) {
      analyser.current.disconnect();
      analyser.current = null;
    }
    
    if (audioContext.current && audioContext.current.state !== 'closed') {
      audioContext.current.close();
      audioContext.current = null;
    }
    
    if (stream.current) {
      stream.current.getTracks().forEach(track => track.stop());
      stream.current = null;
    }
  }, []);

  // Auto cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    initialize,
    cleanup,
    isSpeaking: isSpeaking.current
  };
}