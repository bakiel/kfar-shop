// Performance tracking and analytics for voice commerce

export interface PerformanceMetrics {
  // Response times
  speechRecognitionTime: number;
  aiProcessingTime: number;
  productSearchTime: number;
  ttsGenerationTime: number;
  totalResponseTime: number;
  
  // Success rates
  recognitionSuccessRate: number;
  aiParsingSuccessRate: number;
  productMatchRate: number;
  commandCompletionRate: number;
  
  // User interaction metrics
  averageSessionDuration: number;
  commandsPerSession: number;
  cartConversionRate: number;
  errorRate: number;
  
  // Quality metrics
  confidenceScores: number[];
  retryCount: number;
  fallbackCount: number;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  commands: CommandMetric[];
  errors: ErrorMetric[];
  cartValue: number;
  checkoutCompleted: boolean;
}

export interface CommandMetric {
  timestamp: Date;
  rawInput: string;
  intent: string;
  entities: any;
  processingTime: {
    recognition: number;
    ai: number;
    search: number;
    tts: number;
    total: number;
  };
  success: boolean;
  confidence: number;
  retries: number;
}

export interface ErrorMetric {
  timestamp: Date;
  type: 'recognition' | 'ai' | 'search' | 'tts' | 'system';
  message: string;
  context?: any;
}

export class PerformanceTracker {
  private currentSession: SessionMetrics | null = null;
  private allSessions: SessionMetrics[] = [];
  private timers: Map<string, number> = new Map();
  
  // Start a new session
  startSession(): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentSession = {
      sessionId,
      startTime: new Date(),
      commands: [],
      errors: [],
      cartValue: 0,
      checkoutCompleted: false
    };
    return sessionId;
  }
  
  // End current session
  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.allSessions.push(this.currentSession);
      this.saveMetrics();
      this.currentSession = null;
    }
  }
  
  // Start timing an operation
  startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }
  
  // End timing and return duration
  endTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.timers.delete(operation);
    return duration;
  }
  
  // Track a command
  trackCommand(
    rawInput: string,
    intent: string,
    entities: any,
    success: boolean,
    confidence: number = 0
  ): void {
    if (!this.currentSession) return;
    
    const command: CommandMetric = {
      timestamp: new Date(),
      rawInput,
      intent,
      entities,
      processingTime: {
        recognition: this.endTimer('recognition') || 0,
        ai: this.endTimer('ai') || 0,
        search: this.endTimer('search') || 0,
        tts: this.endTimer('tts') || 0,
        total: this.endTimer('total') || 0
      },
      success,
      confidence,
      retries: 0
    };
    
    this.currentSession.commands.push(command);
  }
  
  // Track an error
  trackError(type: ErrorMetric['type'], message: string, context?: any): void {
    if (!this.currentSession) return;
    
    const error: ErrorMetric = {
      timestamp: new Date(),
      type,
      message,
      context
    };
    
    this.currentSession.errors.push(error);
  }
  
  // Update cart value
  updateCartValue(value: number): void {
    if (this.currentSession) {
      this.currentSession.cartValue = value;
    }
  }
  
  // Mark checkout as completed
  markCheckoutCompleted(): void {
    if (this.currentSession) {
      this.currentSession.checkoutCompleted = true;
    }
  }
  
  // Get aggregate metrics
  getAggregateMetrics(): PerformanceMetrics {
    const recentSessions = this.allSessions.slice(-100); // Last 100 sessions
    
    if (recentSessions.length === 0) {
      return this.getEmptyMetrics();
    }
    
    // Calculate aggregate metrics
    let totalCommands = 0;
    let successfulCommands = 0;
    let totalRecognitionTime = 0;
    let totalAiTime = 0;
    let totalSearchTime = 0;
    let totalTtsTime = 0;
    let totalResponseTime = 0;
    let allConfidenceScores: number[] = [];
    let totalRetries = 0;
    let totalFallbacks = 0;
    let completedCheckouts = 0;
    let sessionsWithCart = 0;
    
    for (const session of recentSessions) {
      totalCommands += session.commands.length;
      
      for (const command of session.commands) {
        if (command.success) successfulCommands++;
        totalRecognitionTime += command.processingTime.recognition;
        totalAiTime += command.processingTime.ai;
        totalSearchTime += command.processingTime.search;
        totalTtsTime += command.processingTime.tts;
        totalResponseTime += command.processingTime.total;
        allConfidenceScores.push(command.confidence);
        totalRetries += command.retries;
        if (command.intent === 'unclear') totalFallbacks++;
      }
      
      if (session.checkoutCompleted) completedCheckouts++;
      if (session.cartValue > 0) sessionsWithCart++;
    }
    
    const avgCommands = totalCommands / recentSessions.length;
    
    return {
      speechRecognitionTime: totalCommands > 0 ? totalRecognitionTime / totalCommands : 0,
      aiProcessingTime: totalCommands > 0 ? totalAiTime / totalCommands : 0,
      productSearchTime: totalCommands > 0 ? totalSearchTime / totalCommands : 0,
      ttsGenerationTime: totalCommands > 0 ? totalTtsTime / totalCommands : 0,
      totalResponseTime: totalCommands > 0 ? totalResponseTime / totalCommands : 0,
      
      recognitionSuccessRate: this.calculateRecognitionSuccessRate(recentSessions),
      aiParsingSuccessRate: totalCommands > 0 ? successfulCommands / totalCommands : 0,
      productMatchRate: this.calculateProductMatchRate(recentSessions),
      commandCompletionRate: totalCommands > 0 ? successfulCommands / totalCommands : 0,
      
      averageSessionDuration: this.calculateAverageSessionDuration(recentSessions),
      commandsPerSession: avgCommands,
      cartConversionRate: sessionsWithCart > 0 ? completedCheckouts / sessionsWithCart : 0,
      errorRate: this.calculateErrorRate(recentSessions),
      
      confidenceScores: allConfidenceScores,
      retryCount: totalRetries,
      fallbackCount: totalFallbacks
    };
  }
  
  private calculateRecognitionSuccessRate(sessions: SessionMetrics[]): number {
    let totalAttempts = 0;
    let recognitionErrors = 0;
    
    for (const session of sessions) {
      totalAttempts += session.commands.length;
      recognitionErrors += session.errors.filter(e => e.type === 'recognition').length;
    }
    
    return totalAttempts > 0 ? (totalAttempts - recognitionErrors) / totalAttempts : 0;
  }
  
  private calculateProductMatchRate(sessions: SessionMetrics[]): number {
    let searchCommands = 0;
    let successfulSearches = 0;
    
    for (const session of sessions) {
      for (const command of session.commands) {
        if (command.intent === 'search_product' || command.intent === 'browse_vendor') {
          searchCommands++;
          if (command.success && command.confidence > 0.6) {
            successfulSearches++;
          }
        }
      }
    }
    
    return searchCommands > 0 ? successfulSearches / searchCommands : 0;
  }
  
  private calculateAverageSessionDuration(sessions: SessionMetrics[]): number {
    let totalDuration = 0;
    let validSessions = 0;
    
    for (const session of sessions) {
      if (session.endTime) {
        totalDuration += session.endTime.getTime() - session.startTime.getTime();
        validSessions++;
      }
    }
    
    return validSessions > 0 ? totalDuration / validSessions / 1000 : 0; // Return in seconds
  }
  
  private calculateErrorRate(sessions: SessionMetrics[]): number {
    let totalCommands = 0;
    let totalErrors = 0;
    
    for (const session of sessions) {
      totalCommands += session.commands.length;
      totalErrors += session.errors.length;
    }
    
    return totalCommands > 0 ? totalErrors / totalCommands : 0;
  }
  
  private getEmptyMetrics(): PerformanceMetrics {
    return {
      speechRecognitionTime: 0,
      aiProcessingTime: 0,
      productSearchTime: 0,
      ttsGenerationTime: 0,
      totalResponseTime: 0,
      recognitionSuccessRate: 0,
      aiParsingSuccessRate: 0,
      productMatchRate: 0,
      commandCompletionRate: 0,
      averageSessionDuration: 0,
      commandsPerSession: 0,
      cartConversionRate: 0,
      errorRate: 0,
      confidenceScores: [],
      retryCount: 0,
      fallbackCount: 0
    };
  }
  
  // Save metrics to localStorage
  private saveMetrics(): void {
    try {
      const metricsData = {
        sessions: this.allSessions.slice(-100), // Keep last 100 sessions
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('kfar_voice_metrics', JSON.stringify(metricsData));
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }
  
  // Load metrics from localStorage
  loadMetrics(): void {
    try {
      const stored = localStorage.getItem('kfar_voice_metrics');
      if (stored) {
        const data = JSON.parse(stored);
        this.allSessions = data.sessions || [];
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }
  
  // Get performance report
  getPerformanceReport(): string {
    const metrics = this.getAggregateMetrics();
    
    return `
Voice Commerce Performance Report
=================================

Response Times (avg):
- Speech Recognition: ${Math.round(metrics.speechRecognitionTime)}ms
- AI Processing: ${Math.round(metrics.aiProcessingTime)}ms
- Product Search: ${Math.round(metrics.productSearchTime)}ms
- TTS Generation: ${Math.round(metrics.ttsGenerationTime)}ms
- Total Response: ${Math.round(metrics.totalResponseTime)}ms

Success Rates:
- Recognition Success: ${(metrics.recognitionSuccessRate * 100).toFixed(1)}%
- AI Parsing Success: ${(metrics.aiParsingSuccessRate * 100).toFixed(1)}%
- Product Match Rate: ${(metrics.productMatchRate * 100).toFixed(1)}%
- Command Completion: ${(metrics.commandCompletionRate * 100).toFixed(1)}%

User Engagement:
- Avg Session Duration: ${Math.round(metrics.averageSessionDuration)}s
- Commands per Session: ${metrics.commandsPerSession.toFixed(1)}
- Cart Conversion Rate: ${(metrics.cartConversionRate * 100).toFixed(1)}%
- Error Rate: ${(metrics.errorRate * 100).toFixed(1)}%

Quality Metrics:
- Avg Confidence: ${metrics.confidenceScores.length > 0 ? 
    (metrics.confidenceScores.reduce((a, b) => a + b, 0) / metrics.confidenceScores.length).toFixed(2) : 'N/A'}
- Total Retries: ${metrics.retryCount}
- Fallback Count: ${metrics.fallbackCount}
    `;
  }
}

// Singleton instance
export const performanceTracker = new PerformanceTracker();