// Self-diagnostic system for voice commerce

import { performanceTracker } from './performance-tracker';
import { aiService } from '../services/ai-service';

export interface DiagnosticResult {
  status: 'healthy' | 'warning' | 'critical';
  category: string;
  message: string;
  details?: any;
  recommendation?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  timestamp: Date;
  diagnostics: DiagnosticResult[];
  metrics: {
    responseTime: number;
    successRate: number;
    errorRate: number;
    confidenceScore: number;
  };
}

export class SelfDiagnostic {
  private lastDiagnostic: Date = new Date();
  private diagnosticHistory: SystemHealth[] = [];
  
  // Run comprehensive system diagnostic
  async runDiagnostic(): Promise<SystemHealth> {
    const diagnostics: DiagnosticResult[] = [];
    
    // Check API availability
    diagnostics.push(await this.checkAPIHealth());
    
    // Check AI service
    diagnostics.push(await this.checkAIService());
    
    // Check performance metrics
    diagnostics.push(...this.checkPerformanceMetrics());
    
    // Check speech recognition
    diagnostics.push(this.checkSpeechRecognition());
    
    // Check text-to-speech
    diagnostics.push(this.checkTextToSpeech());
    
    // Calculate overall health
    const overall = this.calculateOverallHealth(diagnostics);
    
    // Get current metrics
    const metrics = performanceTracker.getAggregateMetrics();
    
    const health: SystemHealth = {
      overall,
      timestamp: new Date(),
      diagnostics,
      metrics: {
        responseTime: metrics.totalResponseTime,
        successRate: metrics.commandCompletionRate,
        errorRate: metrics.errorRate,
        confidenceScore: metrics.confidenceScores.length > 0
          ? metrics.confidenceScores.reduce((a, b) => a + b, 0) / metrics.confidenceScores.length
          : 0
      }
    };
    
    this.diagnosticHistory.push(health);
    this.lastDiagnostic = new Date();
    
    return health;
  }
  
  // Check API health
  private async checkAPIHealth(): Promise<DiagnosticResult> {
    try {
      const start = Date.now();
      const response = await fetch('/api/products?search=test', {
        signal: AbortSignal.timeout(5000)
      });
      const responseTime = Date.now() - start;
      
      if (response.ok) {
        const data = await response.json();
        
        if (responseTime > 2000) {
          return {
            status: 'warning',
            category: 'API',
            message: 'API response time is slow',
            details: { responseTime },
            recommendation: 'Check server performance and database queries'
          };
        }
        
        return {
          status: 'healthy',
          category: 'API',
          message: 'API is responding normally',
          details: { responseTime }
        };
      } else {
        return {
          status: 'critical',
          category: 'API',
          message: `API returned error: ${response.status}`,
          details: { status: response.status },
          recommendation: 'Check API server logs and configuration'
        };
      }
    } catch (error) {
      return {
        status: 'critical',
        category: 'API',
        message: 'API is not responding',
        details: { error: error.message },
        recommendation: 'Verify API server is running and accessible'
      };
    }
  }
  
  // Check AI service
  private async checkAIService(): Promise<DiagnosticResult> {
    try {
      // Test with a simple command
      const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': 'Bearer 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'
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (testResponse.ok) {
        return {
          status: 'healthy',
          category: 'AI Service',
          message: 'AI service is accessible',
          details: { provider: 'OpenRouter' }
        };
      } else if (testResponse.status === 401) {
        return {
          status: 'critical',
          category: 'AI Service',
          message: 'AI service authentication failed',
          details: { status: testResponse.status },
          recommendation: 'Check API key configuration'
        };
      } else {
        return {
          status: 'warning',
          category: 'AI Service',
          message: `AI service returned status ${testResponse.status}`,
          details: { status: testResponse.status },
          recommendation: 'Monitor AI service availability'
        };
      }
    } catch (error) {
      return {
        status: 'warning',
        category: 'AI Service',
        message: 'AI service check failed',
        details: { error: error.message },
        recommendation: 'System will fall back to basic pattern matching'
      };
    }
  }
  
  // Check performance metrics
  private checkPerformanceMetrics(): DiagnosticResult[] {
    const diagnostics: DiagnosticResult[] = [];
    const metrics = performanceTracker.getAggregateMetrics();
    
    // Response time check
    if (metrics.totalResponseTime > 3000) {
      diagnostics.push({
        status: 'warning',
        category: 'Performance',
        message: 'Response times are slower than optimal',
        details: { avgResponseTime: Math.round(metrics.totalResponseTime) },
        recommendation: 'Optimize AI processing and product search'
      });
    } else if (metrics.totalResponseTime > 5000) {
      diagnostics.push({
        status: 'critical',
        category: 'Performance',
        message: 'Response times are critically slow',
        details: { avgResponseTime: Math.round(metrics.totalResponseTime) },
        recommendation: 'Immediate performance optimization required'
      });
    }
    
    // Success rate check
    if (metrics.commandCompletionRate < 0.7) {
      diagnostics.push({
        status: 'warning',
        category: 'Success Rate',
        message: 'Command completion rate is low',
        details: { rate: (metrics.commandCompletionRate * 100).toFixed(1) + '%' },
        recommendation: 'Review failed commands and improve AI understanding'
      });
    }
    
    // Error rate check
    if (metrics.errorRate > 0.1) {
      diagnostics.push({
        status: 'warning',
        category: 'Errors',
        message: 'High error rate detected',
        details: { rate: (metrics.errorRate * 100).toFixed(1) + '%' },
        recommendation: 'Investigate error logs and fix issues'
      });
    }
    
    // Recognition success rate
    if (metrics.recognitionSuccessRate < 0.8) {
      diagnostics.push({
        status: 'warning',
        category: 'Speech Recognition',
        message: 'Speech recognition success rate is low',
        details: { rate: (metrics.recognitionSuccessRate * 100).toFixed(1) + '%' },
        recommendation: 'Check microphone quality and background noise'
      });
    }
    
    // If no issues found, add healthy status
    if (diagnostics.length === 0) {
      diagnostics.push({
        status: 'healthy',
        category: 'Performance',
        message: 'All performance metrics are within normal ranges',
        details: {
          responseTime: Math.round(metrics.totalResponseTime) + 'ms',
          successRate: (metrics.commandCompletionRate * 100).toFixed(1) + '%',
          errorRate: (metrics.errorRate * 100).toFixed(1) + '%'
        }
      });
    }
    
    return diagnostics;
  }
  
  // Check speech recognition availability
  private checkSpeechRecognition(): DiagnosticResult {
    if (typeof window === 'undefined') {
      return {
        status: 'warning',
        category: 'Speech Recognition',
        message: 'Running in server environment',
        details: { environment: 'server' }
      };
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return {
        status: 'critical',
        category: 'Speech Recognition',
        message: 'Speech recognition not supported',
        details: { browser: navigator.userAgent },
        recommendation: 'Use a modern browser (Chrome, Edge, Safari)'
      };
    }
    
    // Check if microphone permissions might be an issue
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          if (result.state === 'denied') {
            return {
              status: 'critical',
              category: 'Speech Recognition',
              message: 'Microphone access denied',
              recommendation: 'Grant microphone permissions in browser settings'
            };
          }
        })
        .catch(() => {
          // Permissions API not supported, skip check
        });
    }
    
    return {
      status: 'healthy',
      category: 'Speech Recognition',
      message: 'Speech recognition is available',
      details: { api: 'Web Speech API' }
    };
  }
  
  // Check text-to-speech availability
  private checkTextToSpeech(): DiagnosticResult {
    // Check ElevenLabs configuration
    const hasApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || 
                     process.env.ELEVENLABS_API_KEY;
    
    if (!hasApiKey) {
      return {
        status: 'warning',
        category: 'Text-to-Speech',
        message: 'ElevenLabs API key not configured',
        recommendation: 'Add NEXT_PUBLIC_ELEVENLABS_API_KEY to environment'
      };
    }
    
    return {
      status: 'healthy',
      category: 'Text-to-Speech',
      message: 'Text-to-speech is configured',
      details: { provider: 'ElevenLabs' }
    };
  }
  
  // Calculate overall system health
  private calculateOverallHealth(diagnostics: DiagnosticResult[]): SystemHealth['overall'] {
    const criticalCount = diagnostics.filter(d => d.status === 'critical').length;
    const warningCount = diagnostics.filter(d => d.status === 'warning').length;
    
    if (criticalCount > 0) {
      return 'critical';
    } else if (warningCount > 2) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }
  
  // Get diagnostic history
  getHistory(limit?: number): SystemHealth[] {
    if (limit) {
      return this.diagnosticHistory.slice(-limit);
    }
    return this.diagnosticHistory;
  }
  
  // Get last diagnostic result
  getLastDiagnostic(): SystemHealth | null {
    return this.diagnosticHistory[this.diagnosticHistory.length - 1] || null;
  }
  
  // Check if diagnostic is needed
  needsDiagnostic(): boolean {
    const hoursSinceLastCheck = (Date.now() - this.lastDiagnostic.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastCheck > 1; // Run every hour
  }
  
  // Generate health report
  generateHealthReport(): string {
    const lastHealth = this.getLastDiagnostic();
    if (!lastHealth) {
      return 'No diagnostic data available. Run diagnostic first.';
    }
    
    const report = `
Voice Commerce System Health Report
===================================
Generated: ${lastHealth.timestamp.toLocaleString()}
Overall Status: ${lastHealth.overall.toUpperCase()}

Key Metrics:
- Average Response Time: ${Math.round(lastHealth.metrics.responseTime)}ms
- Success Rate: ${(lastHealth.metrics.successRate * 100).toFixed(1)}%
- Error Rate: ${(lastHealth.metrics.errorRate * 100).toFixed(1)}%
- Confidence Score: ${lastHealth.metrics.confidenceScore.toFixed(2)}

Diagnostics:
${lastHealth.diagnostics.map(d => 
  `\n${d.status.toUpperCase()} - ${d.category}: ${d.message}` +
  (d.recommendation ? `\n  → Recommendation: ${d.recommendation}` : '')
).join('\n')}

${lastHealth.overall !== 'healthy' ? '\nAction Required: Please address the issues above to improve system performance.' : '\nSystem is operating normally.'}
    `;
    
    return report;
  }
  
  // Auto-fix common issues
  async attemptAutoFix(diagnostic: DiagnosticResult): Promise<boolean> {
    switch (diagnostic.category) {
      case 'Performance':
        if (diagnostic.message.includes('Response times')) {
          // Clear any caches
          aiService.clearHistory();
          performanceTracker.loadMetrics(); // Reload to clear old data
          console.log('🔧 Cleared AI history and reloaded metrics');
          return true;
        }
        break;
        
      case 'Speech Recognition':
        if (diagnostic.message.includes('Microphone')) {
          // Prompt user for permissions
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
              await navigator.mediaDevices.getUserMedia({ audio: true });
              console.log('🎤 Microphone permissions granted');
              return true;
            } catch (error) {
              console.error('Failed to get microphone permissions:', error);
            }
          }
        }
        break;
    }
    
    return false;
  }
}

// Singleton instance
export const selfDiagnostic = new SelfDiagnostic();