// Simplified ElevenLabs WebSocket TTS Service
import { EventEmitter } from 'events';

export interface StreamingTTSConfig {
  apiKey: string;
  voiceId: string;
  modelId?: string;
  outputFormat?: string;
  optimizeStreamingLatency?: number;
}

export class StreamingTTSService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: StreamingTTSConfig;
  private isConnected: boolean = false;
  private audioQueue: string[] = [];

  constructor(config: StreamingTTSConfig) {
    super();
    this.config = {
      modelId: 'eleven_monolingual_v1',
      outputFormat: 'mp3_44100_128',
      optimizeStreamingLatency: 2,
      ...config
    };
  }

  async connect(): Promise<void> {
    try {
      const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}/stream-input?model_id=${this.config.modelId}&output_format=${this.config.outputFormat}&optimize_streaming_latency=${this.config.optimizeStreamingLatency}`;
      
      this.ws = new WebSocket(wsUrl);
      this.ws.binaryType = 'arraybuffer';

      return new Promise((resolve, reject) => {
        this.ws!.onopen = () => {
          console.log('ElevenLabs WebSocket connected');
          this.isConnected = true;
          
          // Send initial configuration
          this.ws!.send(JSON.stringify({
            text: " ",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.0,
              use_speaker_boost: true
            },
            generation_config: {
              chunk_length_schedule: [120, 160, 250, 290]
            },
            xi_api_key: this.config.apiKey
          }));
          
          resolve();
        };

        this.ws!.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws!.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws!.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnected = false;
          this.emit('disconnected');
        };
      });
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  private handleMessage(data: any): void {
    try {
      if (data instanceof ArrayBuffer) {
        // This is audio data
        this.emit('audio', data);
        return;
      }

      const message = JSON.parse(data);
      
      if (message.audio) {
        // Base64 encoded audio
        const audioData = this.base64ToArrayBuffer(message.audio);
        this.emit('audio', audioData);
      }
      
      if (message.isFinal) {
        this.emit('final');
      }
      
      if (message.normalizedAlignment) {
        this.emit('alignment', message.normalizedAlignment);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  sendText(text: string, isFinal: boolean = false): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = {
      text: text + (isFinal ? "" : " "),
      try_trigger_generation: true,
      generation_config: {
        chunk_length_schedule: [50, 90, 120, 150]
      }
    };

    this.ws.send(JSON.stringify(message));
    
    if (isFinal) {
      // Send empty string to close the generation
      setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ text: "" }));
        }
      }, 100);
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

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}