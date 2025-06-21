'use client';

import { useState, useEffect } from 'react';
import { performanceTracker } from '@/lib/utils/performance-tracker';
import { selfDiagnostic } from '@/lib/utils/self-diagnostic';

export function VoiceCommerceDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    // Load initial metrics
    const loadMetrics = () => {
      const currentMetrics = performanceTracker.getAggregateMetrics();
      setMetrics(currentMetrics);
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const result = await selfDiagnostic.runDiagnostic();
      setHealth(result);
    } catch (error) {
      console.error('Diagnostic failed:', error);
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'degraded': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✓';
      case 'warning': return '⚠';
      case 'critical': return '✗';
      default: return '•';
    }
  };

  if (!metrics) {
    return <div className="p-4 text-center">Loading metrics...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Voice Commerce Dashboard</h2>
        <p className="text-gray-600">Monitor system performance and health</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded p-4">
          <div className="text-sm text-gray-600">Avg Response Time</div>
          <div className="text-2xl font-bold">{Math.round(metrics.totalResponseTime)}ms</div>
        </div>
        <div className="bg-gray-50 rounded p-4">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-2xl font-bold">{(metrics.commandCompletionRate * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 rounded p-4">
          <div className="text-sm text-gray-600">Error Rate</div>
          <div className="text-2xl font-bold">{(metrics.errorRate * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 rounded p-4">
          <div className="text-sm text-gray-600">Avg Confidence</div>
          <div className="text-2xl font-bold">
            {metrics.confidenceScores.length > 0 
              ? (metrics.confidenceScores.reduce((a, b) => a + b, 0) / metrics.confidenceScores.length).toFixed(2)
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Performance Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Speech Recognition</span>
            <span className="font-mono">{Math.round(metrics.speechRecognitionTime)}ms</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">AI Processing</span>
            <span className="font-mono">{Math.round(metrics.aiProcessingTime)}ms</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Product Search</span>
            <span className="font-mono">{Math.round(metrics.productSearchTime)}ms</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">TTS Generation</span>
            <span className="font-mono">{Math.round(metrics.ttsGenerationTime)}ms</span>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">System Health</h3>
          <button
            onClick={runDiagnostic}
            disabled={isRunningDiagnostic}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunningDiagnostic ? 'Running...' : 'Run Diagnostic'}
          </button>
        </div>

        {health && (
          <div className="space-y-3">
            <div className={`text-lg font-semibold ${getStatusColor(health.overall)}`}>
              Overall Status: {health.overall.toUpperCase()}
            </div>
            
            <div className="space-y-2">
              {health.diagnostics.map((diagnostic, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded">
                  <span className={`text-lg ${getStatusColor(diagnostic.status)}`}>
                    {getStatusIcon(diagnostic.status)}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{diagnostic.category}</div>
                    <div className="text-sm text-gray-600">{diagnostic.message}</div>
                    {diagnostic.recommendation && (
                      <div className="text-sm text-blue-600 mt-1">
                        → {diagnostic.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Usage Stats */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Usage Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Avg Session Duration</div>
            <div className="font-mono">{Math.round(metrics.averageSessionDuration)}s</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Commands per Session</div>
            <div className="font-mono">{metrics.commandsPerSession.toFixed(1)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Cart Conversion Rate</div>
            <div className="font-mono">{(metrics.cartConversionRate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Recognition Success</div>
            <div className="font-mono">{(metrics.recognitionSuccessRate * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Performance Report */}
      <div className="mt-6">
        <button
          onClick={() => setShowReport(!showReport)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {showReport ? 'Hide' : 'Show'} Performance Report
        </button>
        
        {showReport && (
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-x-auto text-sm">
            {performanceTracker.getPerformanceReport()}
          </pre>
        )}
      </div>

      {/* Health Report */}
      {health && (
        <div className="mt-4">
          <button
            onClick={() => {
              const report = selfDiagnostic.generateHealthReport();
              console.log(report);
              alert('Health report logged to console');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Generate Health Report
          </button>
        </div>
      )}
    </div>
  );
}