// Mock realtime service for build compatibility
export interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

class RealtimeService {
  private listeners: Map<string, Function[]> = new Map();

  emit(eventType: string, payload: any) {
    const event: RealtimeEvent = {
      type: eventType,
      payload,
      timestamp: new Date()
    };

    const listeners = this.listeners.get(eventType) || [];
    listeners.forEach(listener => listener(event));
  }

  on(eventType: string, callback: Function) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);
  }

  off(eventType: string, callback: Function) {
    const listeners = this.listeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
}

const realtimeService = new RealtimeService();
export default realtimeService;