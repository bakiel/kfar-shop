// lib/elevenlabs/websocket-service.ts
import { EventEmitter } from 'events';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface StreamConfig {
  apiKey: string;
  voiceId: string;
  model?: string;
  optimizeStreamingLatency?: number;
  voiceSettings?: VoiceSettings;
}

export class ElevenLabsWebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: StreamConfig;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private audioContext: AudioContext | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(config: StreamConfig) {
    super();
    this.config = {
      model: 'eleven_turbo_v2_5',
      optimizeStreamingLatency: 3, // Maximum optimization for lowest latency
      ...config
    };
  }

  async connect(): Promise<void> {
    try {
      const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}/stream-input?model_id=${this.config.model}&optimize_streaming_latency=${this.config.optimizeStreamingLatency}`;
      
      this.ws = new WebSocket(wsUrl);
      this.ws.binaryType = 'arraybuffer';
      
      this.ws.onopen = () => {
        console.log('ElevenLabs WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send initial configuration
        this.send({
          text: " ",
          voice_settings: this.config.voiceSettings,
          generation_config: {
            chunk_length_schedule: [120, 160, 250, 290] // Optimal for quality + latency
          },
          xi_api_key: this.config.apiKey
        });
        
        this.emit('connected');
      };

      this.ws.onmessage = async (event) => {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          this.handleTextMessage(data);
        } else {
          // Audio data
          this.handleAudioData(event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('Connection failed:', error);
      this.emit('error', error);
      throw error;
    }
  }

  private handleTextMessage(data: any) {
    if (data.audio) {
      // Base64 audio data
      const audioData = this.base64ToArrayBuffer(data.audio);
      this.handleAudioData(audioData);
    }
    
    if (data.isFinal) {
      this.emit('final');
    }
    
    if (data.normalizedAlignment) {
      this.emit('alignment', data.normalizedAlignment);
    }
  }

  private handleAudioData(audioData: ArrayBuffer) {
    this.audioQueue.push(audioData);
    this.emit('audio', audioData);
    
    if (!this.isPlaying) {
      this.playNextAudio();
    }
  }

  private async playNextAudio() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.emit('playbackComplete');
      return;
    }

    this.isPlaying = true;
    
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    const audioData = this.audioQueue.shift()!;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        this.playNextAudio();
      };
      
      source.start(0);
    } catch (error) {
      console.error('Audio playback error:', error);
      this.playNextAudio();
    }
  }

  sendText(text: string, flush: boolean = false) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      text,
      flush,
      voice_settings: this.config.voiceSettings
    };

    this.send(message);
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.reconnectDelay *= 2; // Exponential backoff
        this.connect();
      }, this.reconnectDelay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.audioQueue = [];
    this.isPlaying = false;
  }

  // Getters for status
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  get queueLength(): number {
    return this.audioQueue.length;
  }
}
