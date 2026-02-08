// Global voice chat state manager
class VoiceChatManager {
  private static instance: VoiceChatManager;
  private listeners: Array<(isOpen: boolean) => void> = [];
  private isOpen = false;

  static getInstance(): VoiceChatManager {
    if (!VoiceChatManager.instance) {
      VoiceChatManager.instance = new VoiceChatManager();
    }
    return VoiceChatManager.instance;
  }

  subscribe(callback: (isOpen: boolean) => void) {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.isOpen);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  open() {
    console.log('🎤 VoiceChatManager: Opening voice chat');
    this.isOpen = true;
    this.notifyListeners();
  }

  close() {
    console.log('🎤 VoiceChatManager: Closing voice chat');
    this.isOpen = false;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.isOpen));
  }
}

// Export singleton instance
export const voiceChatManager = VoiceChatManager.getInstance();

// Also maintain event-based API for backward compatibility
if (typeof window !== 'undefined') {
  window.addEventListener('open-voice-chat', () => {
    voiceChatManager.open();
  });
}
