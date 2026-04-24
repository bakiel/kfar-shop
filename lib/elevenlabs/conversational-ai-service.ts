// ElevenLabs Conversational AI WebSocket Service
import { EventEmitter } from 'events';

export interface ConversationConfig {
  agentId?: string;
  apiKey: string;
  voiceId: string;
  language?: string;
  firstMessage?: string;
  systemPrompt?: string;
  temperature?: number;
  customVariables?: Record<string, any>;
}

export interface AudioConfig {
  inputFormat?: 'pcm_16000' | 'pcm_8000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100';
  outputFormat?: 'pcm_16000' | 'pcm_8000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'mp3';
}

export class ConversationalAIService extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: ConversationConfig;
  private audioConfig: AudioConfig;
  private conversationId: string | null = null;
  private isConnected: boolean = false;
  private audioQueue: ArrayBuffer[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private audioWorklet: AudioWorkletNode | null = null;

  constructor(config: ConversationConfig, audioConfig: AudioConfig = {}) {
    super();
    this.config = config;
    this.audioConfig = {
      inputFormat: 'pcm_16000',
      outputFormat: 'pcm_16000',
      ...audioConfig
    };
  }

  async connect(): Promise<string> {
    try {
      // Get signed URL for private agents
      const signedUrl = await this.getSignedUrl();
      
      // Initialize WebSocket connection
      this.ws = new WebSocket(signedUrl);
      this.ws.binaryType = 'arraybuffer';

      return new Promise((resolve, reject) => {
        this.ws!.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.sendInitializationData();
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

        // Listen for conversation ID
        this.once('conversation_started', (conversationId) => {
          resolve(conversationId);
        });
      });
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  private async getSignedUrl(): Promise<string> {
    // For now, we'll use the text-to-speech WebSocket endpoint
    // since we don't have a conversational agent ID yet
    return `wss://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}/stream-input?model_id=eleven_monolingual_v1&output_format=pcm_16000`;
  }

  private sendInitializationData(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const initData = {
      type: 'conversation_initiation_client_data',
      conversation_config_override: {
        agent: {
          prompt: {
            prompt: this.config.systemPrompt || this.getDefaultPrompt()
          },
          first_message: this.config.firstMessage || this.getDefaultFirstMessage(),
          language: this.config.language || 'en'
        },
        tts: {
          voice_id: this.config.voiceId
        }
      },
      custom_llm_extra_body: {
        temperature: this.config.temperature || 0.7,
        max_tokens: 150
      },
      dynamic_variables: this.config.customVariables || {}
    };

    this.ws.send(JSON.stringify(initData));
  }

  private getDefaultPrompt(): string {
    return `You are a helpful assistant for K'far Vegan Marketplace in Dimona, Israel. 
    You help customers find vegan products, provide information about vendors, and assist with their shopping needs.
    Be warm, friendly, and knowledgeable about the marketplace offerings.`;
  }

  private getDefaultFirstMessage(): string {
    return "Shalom! Welcome to K'far Marketplace. How can I help you today?";
  }

  private handleMessage(data: any): void {
    try {
      // Handle binary audio data
      if (data instanceof ArrayBuffer) {
        this.handleAudioData(data);
        return;
      }

      // Handle JSON messages
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      
      switch (message.type) {
        case 'conversation_initiation_metadata':
          this.conversationId = message.conversation_initiation_metadata_event.conversation_id;
          this.emit('conversation_started', this.conversationId);
          break;

        case 'audio':
          this.handleAudioEvent(message.audio_event);
          break;

        case 'user_transcript':
          this.emit('user_transcript', message.user_transcription_event.user_transcript);
          break;

        case 'agent_response':
          this.emit('agent_response', message.agent_response_event.agent_response);
          break;

        case 'vad_score':
          this.emit('vad_score', message.vad_score_event.vad_score);
          break;

        case 'internal_tentative_agent_response':
          this.emit('tentative_response', message.tentative_agent_response_internal_event.tentative_agent_response);
          break;

        case 'ping':
          this.handlePing(message.ping_event);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleAudioEvent(audioEvent: any): void {
    // Decode base64 audio
    const audioData = this.base64ToArrayBuffer(audioEvent.audio_base_64);
    this.audioQueue.push(audioData);
    this.emit('audio_chunk', audioData, audioEvent.event_id);
  }

  private handleAudioData(data: ArrayBuffer): void {
    this.audioQueue.push(data);
    this.emit('audio_chunk', data);
  }

  private handlePing(pingEvent: any): void {
    // Respond to ping to keep connection alive
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'pong',
        event_id: pingEvent.event_id
      }));
    }
  }

  // Send audio data to the server
  sendAudio(audioData: ArrayBuffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    // Convert to base64 for transmission
    const base64Audio = this.arrayBufferToBase64(audioData);
    
    this.ws.send(JSON.stringify({
      user_audio_chunk: base64Audio
    }));
  }

  // Send text message
  sendText(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      type: 'user_text_input',
      text: text
    }));
  }

  // Send contextual update (non-interrupting)
  sendContextualUpdate(context: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      type: 'contextual_update',
      text: context
    }));
  }

  // Audio processing helpers
  async startMicrophone(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(stream);

      // Process audio in real-time
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = this.float32ToPCM16(inputData);
        this.sendAudio(pcmData);
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);
      
      this.emit('microphone_started');
    } catch (error) {
      console.error('Microphone error:', error);
      this.emit('microphone_error', error);
    }
  }

  stopMicrophone(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.emit('microphone_stopped');
  }

  // Play audio queue
  async playAudioQueue(): Promise<void> {
    if (this.audioQueue.length === 0) return;

    const audioData = this.audioQueue.shift()!;
    await this.playAudio(audioData);

    // Continue playing queue
    if (this.audioQueue.length > 0) {
      await this.playAudioQueue();
    }
  }

  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    // Convert PCM to AudioBuffer
    const audioBuffer = await this.audioContext.decodeAudioData(audioData);
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    
    return new Promise((resolve) => {
      source.onended = () => resolve();
      source.start();
    });
  }

  // Utility functions
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private float32ToPCM16(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    
    for (let i = 0; i < float32Array.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, sample * 0x7FFF, true);
    }
    
    return buffer;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopMicrophone();
    this.isConnected = false;
  }
}