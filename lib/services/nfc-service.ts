/**
 * NFC Service for Web
 * Provides NFC reading and writing capabilities using Web NFC API
 * Note: Web NFC is only supported in Chrome on Android devices
 */

import { AI } from '@/lib/services/ai';
import { NFCPayload } from '@/lib/services/ai/types';

export interface NFCReadResult {
  success: boolean;
  data?: any;
  error?: string;
  tagId?: string;
  type?: string;
}

export interface NFCWriteResult {
  success: boolean;
  error?: string;
  tagId?: string;
}

export class NFCService {
  private isSupported: boolean;
  private isReading: boolean = false;
  private abortController: AbortController | null = null;

  constructor() {
    // Check if Web NFC is supported
    this.isSupported = 'NDEFReader' in window;
  }

  /**
   * Check if NFC is supported on this device
   */
  public checkSupport(): { supported: boolean; message: string } {
    if (!this.isSupported) {
      return {
        supported: false,
        message: 'NFC is not supported on this device. Please use Chrome on Android.'
      };
    }

    // Check if we're on HTTPS (required for Web NFC)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      return {
        supported: false,
        message: 'NFC requires a secure connection (HTTPS).'
      };
    }

    return {
      supported: true,
      message: 'NFC is supported on this device.'
    };
  }

  /**
   * Read NFC tag
   */
  async read(options?: { timeout?: number }): Promise<NFCReadResult> {
    const support = this.checkSupport();
    if (!support.supported) {
      return { success: false, error: support.message };
    }

    try {
      // @ts-ignore - Web NFC types might not be available
      const ndef = new NDEFReader();
      this.abortController = new AbortController();
      
      const timeout = options?.timeout || 60000; // Default 60 seconds
      const timeoutId = setTimeout(() => this.stopReading(), timeout);

      await ndef.scan({ signal: this.abortController.signal });
      this.isReading = true;

      return new Promise((resolve) => {
        ndef.addEventListener('reading', async ({ message, serialNumber }) => {
          clearTimeout(timeoutId);
          this.stopReading();

          try {
            // Parse NFC records
            const data = await this.parseNFCMessage(message);
            
            // Check if it's a KFAR NFC tag
            if (data.type && data.payload) {
              // Verify with backend
              const verified = await this.verifyNFCTag(serialNumber, data);
              
              resolve({
                success: true,
                data: verified.data || data,
                tagId: serialNumber,
                type: data.type
              });
            } else {
              resolve({
                success: true,
                data,
                tagId: serialNumber
              });
            }
          } catch (error) {
            resolve({
              success: false,
              error: error instanceof Error ? error.message : 'Failed to parse NFC data',
              tagId: serialNumber
            });
          }
        });

        ndef.addEventListener('error', () => {
          clearTimeout(timeoutId);
          this.stopReading();
          resolve({
            success: false,
            error: 'NFC read error occurred'
          });
        });
      });
    } catch (error) {
      this.stopReading();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read NFC tag'
      };
    }
  }

  /**
   * Write data to NFC tag
   */
  async write(type: string, data: any): Promise<NFCWriteResult> {
    const support = this.checkSupport();
    if (!support.supported) {
      return { success: false, error: support.message };
    }

    try {
      // Generate NFC payload with AI
      const nfcPayload = await AI.generateNFC(type, data);
      
      // @ts-ignore - Web NFC types
      const ndef = new NDEFReader();
      
      // Prepare NDEF records
      const records = this.createNDEFRecords(nfcPayload);
      
      // Write to tag
      await ndef.write({ records });

      // Store tag info in backend
      await this.registerNFCTag(nfcPayload);

      return {
        success: true,
        tagId: nfcPayload.tagId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to write NFC tag'
      };
    }
  }

  /**
   * Emulate NFC tag (for testing/demo)
   */
  async emulate(payload: NFCPayload): Promise<void> {
    // This would require HCE (Host Card Emulation) which is not available in Web NFC
    // For demo purposes, we can simulate by showing a QR code fallback
    console.log('NFC emulation requested:', payload);
    
    // Generate QR code as fallback
    const qrData = await AI.generateQR(payload.type, payload.data.primary);
    
    // Show QR code in a modal
    this.showQRFallback(qrData);
  }

  /**
   * Stop NFC reading
   */
  stopReading(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isReading = false;
  }

  /**
   * Parse NFC message records
   */
  private async parseNFCMessage(message: any): Promise<any> {
    const data: any = {};
    
    for (const record of message.records) {
      switch (record.recordType) {
        case 'text':
          const textDecoder = new TextDecoder(record.encoding || 'utf-8');
          data.text = textDecoder.decode(record.data);
          break;
          
        case 'url':
          const urlDecoder = new TextDecoder();
          data.url = urlDecoder.decode(record.data);
          break;
          
        case 'mime':
          if (record.mediaType === 'application/json') {
            const jsonDecoder = new TextDecoder();
            const jsonText = jsonDecoder.decode(record.data);
            try {
              const parsed = JSON.parse(jsonText);
              Object.assign(data, parsed);
            } catch (e) {
              data.raw = jsonText;
            }
          }
          break;
          
        default:
          // Store unknown types as base64
          data[record.recordType] = btoa(String.fromCharCode(...new Uint8Array(record.data)));
      }
    }
    
    return data;
  }

  /**
   * Create NDEF records for writing
   */
  private createNDEFRecords(payload: NFCPayload): any[] {
    const records = [];
    
    // Add JSON payload
    records.push({
      recordType: 'mime',
      mediaType: 'application/json',
      data: new TextEncoder().encode(JSON.stringify({
        type: payload.type,
        tagId: payload.tagId,
        data: payload.data.primary,
        v: 1
      }))
    });
    
    // Add URL fallback
    records.push({
      recordType: 'url',
      data: new TextEncoder().encode(payload.data.fallback)
    });
    
    // Add text description
    records.push({
      recordType: 'text',
      data: new TextEncoder().encode(`KFAR ${payload.type} Tag`),
      encoding: 'utf-8',
      lang: 'en'
    });
    
    return records;
  }

  /**
   * Verify NFC tag with backend
   */
  private async verifyNFCTag(serialNumber: string, data: any): Promise<any> {
    try {
      const response = await fetch('/api/nfc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber,
          tagId: data.tagId,
          type: data.type
        })
      });
      
      if (!response.ok) {
        throw new Error('Tag verification failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('NFC verification error:', error);
      return { data };
    }
  }

  /**
   * Register NFC tag in backend
   */
  private async registerNFCTag(payload: NFCPayload): Promise<void> {
    try {
      await fetch('/api/nfc/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to register NFC tag:', error);
    }
  }

  /**
   * Show QR code fallback for unsupported devices
   */
  private showQRFallback(qrData: any): void {
    // This would trigger a modal or notification to show QR code
    const event = new CustomEvent('nfc-fallback', { 
      detail: { 
        type: 'qr',
        data: qrData 
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Format tag data for display
   */
  formatTagData(data: any): any {
    if (!data) return null;
    
    return {
      type: data.type || 'unknown',
      id: data.id || data.tagId,
      name: data.name || `${data.type} Tag`,
      description: data.description || 'NFC Tag',
      actions: data.actions || [],
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  /**
   * Check if currently reading
   */
  get reading(): boolean {
    return this.isReading;
  }
}

// Create singleton instance
let nfcService: NFCService | null = null;

export function getNFCService(): NFCService {
  if (!nfcService) {
    nfcService = new NFCService();
  }
  return nfcService;
}

// Convenience methods
export const NFC = {
  isSupported: () => getNFCService().checkSupport().supported,
  read: (options?: any) => getNFCService().read(options),
  write: (type: string, data: any) => getNFCService().write(type, data),
  stop: () => getNFCService().stopReading(),
  emulate: (payload: NFCPayload) => getNFCService().emulate(payload)
};