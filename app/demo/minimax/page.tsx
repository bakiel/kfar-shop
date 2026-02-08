'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { toast } from '@/components/ui/use-toast';
import { AI_PROVIDERS } from '@/lib/config/ai-providers';

export default function MiniMaxDemo() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'demo' | 'integration'>('overview');

  const runAnalysis = async (task: string, params: any = {}) => {
    setLoading(task);
    try {
      const response = await fetch('/api/reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, params })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(prev => ({ ...prev, [task]: data }));
        toast({
          title: "Analysis Complete",
          description: `${data.modelInfo?.name || 'AI'} completed ${task} analysis`,
        });
        
        // Show which model was used
        if (data.modelInfo) {
          setTimeout(() => {
            toast({
              title: "Model Used",
              description: `${data.modelInfo.name} (${data.modelInfo.tier}) - ${data.modelInfo.contextWindow}`,
            });
          }, 500);
        }
      } else {
        console.error('API Error:', data);
        toast({
          title: "Analysis Error",
          description: data.details || data.error,
          variant: "destructive"
        });
        
        // Show suggestions if available
        if (data.suggestions) {
          setTimeout(() => {
            toast({
              title: "Suggestion",
              description: data.suggestions,
            });
          }, 500);
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not complete the analysis",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const features = [
    {
      icon: '🧠',
      title: '1M Token Context',
      description: 'Process entire product catalogs, annual reports, and comprehensive data'
    },
    {
      icon: '🎯',
      title: 'Advanced Reasoning',
      description: 'Complex pattern recognition and strategic analysis capabilities'
    },
    {
      icon: '📊',
      title: 'Deep Analytics',
      description: 'Generate insights from massive datasets with nuanced understanding'
    },
    {
      icon: '🚀',
      title: 'Strategic Planning',
      description: 'Create detailed business strategies and growth recommendations'
    }
  ];

  const useCases = [
    {
      id: 'analyze-trends',
      title: 'Marketplace Trends',
      description: 'Analyze pricing patterns, category performance, and growth opportunities',
      icon: '📈',
      params: { timeRange: 'quarterly' }
    },
    {
      id: 'vendor-strategy',
      title: 'Vendor Strategy',
      description: 'Generate competitive analysis and growth strategies for vendors',
      icon: '🏪',
      params: { vendorId: 'teva-deli' }
    },
    {
      id: 'customer-journeys',
      title: 'Customer Analysis',
      description: 'Understand behavior patterns and optimize customer experience',
      icon: '👥',
      params: {}
    },
    {
      id: 'marketplace-report',
      title: 'Full Report',
      description: 'Comprehensive marketplace analysis with all metrics',
      icon: '📑',
      params: { includeFinancials: true, includePredictions: true }
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
            >
              <i className="fas fa-arrow-left" />
              Back to Demos
            </Link>
            
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
              Advanced AI Models Integration
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience DeepSeek R1, Gemini 2.5 Flash, and MiniMax M1 with automatic fallbacks
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
              {(['overview', 'demo', 'integration'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-md font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              {/* Model Stack */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#3a3a1d' }}>
                  Your AI Model Stack
                </h2>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">For Complex Reasoning Tasks:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-600 font-bold">1.</span>
                      <div className="flex-1">
                        <strong>DeepSeek R1</strong> - Latest reasoning model
                        <span className="text-sm text-gray-600 ml-2">(128K context)</span>
                      </div>
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">Primary</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 font-bold">2.</span>
                      <div className="flex-1">
                        <strong>Gemini 2.5 Flash</strong> - Google's latest
                        <span className="text-sm text-gray-600 ml-2">(2M context)</span>
                      </div>
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Fallback 1</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 font-bold">3.</span>
                      <div className="flex-1">
                        <strong>Gemini 2.0 Flash</strong> - Free tier
                        <span className="text-sm text-gray-600 ml-2">(1M context)</span>
                      </div>
                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Fallback 2</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <span className="text-orange-600 font-bold">4.</span>
                      <div className="flex-1">
                        <strong>Llama 3.1 70B</strong> - Open source
                        <span className="text-sm text-gray-600 ml-2">(128K context)</span>
                      </div>
                      <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded text-xs">Fallback 3</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">For Long Context Analysis:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-600 font-bold">1.</span>
                      <div className="flex-1">
                        <strong>MiniMax M1</strong> - Specialized long context
                        <span className="text-sm text-gray-600 ml-2">(1M context)</span>
                      </div>
                      <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs">Primary</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 font-bold">2.</span>
                      <div className="flex-1">
                        <strong>Gemini 2.5 Flash</strong> - Massive context
                        <span className="text-sm text-gray-600 ml-2">(2M context)</span>
                      </div>
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Fallback 1</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                      <span className="text-indigo-600 font-bold">3.</span>
                      <div className="flex-1">
                        <strong>Claude 3 Haiku</strong> - Fast processing
                        <span className="text-sm text-gray-600 ml-2">(200K context)</span>
                      </div>
                      <span className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded text-xs">Fallback 2</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 font-bold">4.</span>
                      <div className="flex-1">
                        <strong>Gemini 2.0 Flash</strong> - Free tier
                        <span className="text-sm text-gray-600 ml-2">(1M context)</span>
                      </div>
                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Fallback 3</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Why This Stack */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#3a3a1d' }}>
                  Why This Model Stack?
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Traditional Models</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <i className="fas fa-times-circle text-red-500 mt-1" />
                        <div>
                          <strong>Limited Context:</strong> 128K tokens max
                          <p className="text-sm text-gray-600">Can only analyze partial data</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fas fa-times-circle text-red-500 mt-1" />
                        <div>
                          <strong>Simple Analysis:</strong> Basic patterns
                          <p className="text-sm text-gray-600">Surface-level insights</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fas fa-times-circle text-red-500 mt-1" />
                        <div>
                          <strong>Fragmented Processing:</strong> Multiple calls needed
                          <p className="text-sm text-gray-600">Loss of context between calls</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">MiniMax M1</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-green-500 mt-1" />
                        <div>
                          <strong>Massive Context:</strong> 1M tokens
                          <p className="text-sm text-gray-600">Analyze entire marketplace at once</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-green-500 mt-1" />
                        <div>
                          <strong>Deep Reasoning:</strong> Complex patterns
                          <p className="text-sm text-gray-600">Strategic insights and predictions</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-green-500 mt-1" />
                        <div>
                          <strong>Holistic Analysis:</strong> Single comprehensive call
                          <p className="text-sm text-gray-600">Full context preservation</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#3a3a1d' }}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Use Cases */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: '#3a3a1d' }}>
                  Perfect For These Tasks
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Annual Reports</h4>
                    <p className="text-sm text-gray-600">
                      Generate comprehensive yearly analysis with full historical context
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Competitive Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Compare all vendors and products simultaneously
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Market Predictions</h4>
                    <p className="text-sm text-gray-600">
                      Analyze patterns across entire product catalog
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Customer Journey Mapping</h4>
                    <p className="text-sm text-gray-600">
                      Process thousands of interactions in one analysis
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Demo Tab */}
          {activeTab === 'demo' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-5xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  Try MiniMax M1 Analysis
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {useCases.map((useCase) => (
                    <div key={useCase.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="text-3xl mb-2">{useCase.icon}</div>
                          <h3 className="text-lg font-semibold">{useCase.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{useCase.description}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => runAnalysis(useCase.id, useCase.params)}
                        disabled={loading === useCase.id}
                        className={`w-full py-3 rounded-lg font-semibold transition-all ${
                          loading === useCase.id
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                        }`}
                      >
                        {loading === useCase.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                            Processing with MiniMax M1...
                          </span>
                        ) : (
                          'Run Analysis'
                        )}
                      </button>
                      
                      {results[useCase.id] && (
                        <div className="mt-4 space-y-2">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-sm mb-1">Model Used:</h4>
                            <p className="text-sm">
                              {results[useCase.id].modelInfo?.name} ({results[useCase.id].modelInfo?.tier})
                            </p>
                            <p className="text-xs text-gray-600">
                              {results[useCase.id].modelInfo?.description}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Result Preview:</h4>
                            <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                              {JSON.stringify(results[useCase.id].result, null, 2).slice(0, 500)}...
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Integration Tab */}
          {activeTab === 'integration' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#3a3a1d' }}>
                  How to Use MiniMax M1
                </h2>
                
                <div className="space-y-8">
                  {/* Step 1 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">1. Configuration Update</h3>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                      <pre>{`// lib/config/ai-providers.ts
openRouter: {
  models: {
    reasoning: 'minimax/minimax-m1',
    longContext: 'minimax/minimax-m1'
  }
}`}</pre>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">2. Use in OpenRouter Client</h3>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                      <pre>{`// Specify use case for automatic model selection
const config: OpenRouterConfig = {
  useCase: 'reasoning', // or 'long-context'
  max_tokens: 8192,
  temperature: 0.5
};

const response = await openRouterClient.generateResponse(
  messages,
  config
);`}</pre>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">3. Example: Vendor Strategy</h3>
                    <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                      <pre>{`import { miniMaxReasoning } from '@/lib/services/minimax-reasoning-service';

// Generate comprehensive vendor strategy
const strategy = await miniMaxReasoning.generateVendorStrategy('teva-deli');

// Returns detailed analysis including:
// - Competitive positioning
// - Pricing optimization
// - Product gaps
// - Growth opportunities
// - 90-day action plan`}</pre>
                    </div>
                  </div>

                  {/* Best Practices */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-green-500 mt-1" />
                        <div>
                          <strong>Use for Complex Tasks:</strong>
                          <p className="text-sm text-gray-600">
                            Reserve MiniMax M1 for tasks requiring extensive context or deep reasoning
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-green-500 mt-1" />
                        <div>
                          <strong>Batch Data Processing:</strong>
                          <p className="text-sm text-gray-600">
                            Send all relevant data in one request to maximize the 1M context window
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <i className="fas fa-check-circle text-green-500 mt-1" />
                        <div>
                          <strong>Structured Prompts:</strong>
                          <p className="text-sm text-gray-600">
                            Organize data clearly to help the model process information efficiently
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Ready to Unlock Deep Insights?</h3>
              <p className="text-lg mb-6 opacity-90">
                MiniMax M1 is now integrated and ready to analyze your entire marketplace
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <i className="fas fa-chart-line" />
                  View Analytics Dashboard
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-all"
                >
                  <i className="fas fa-play" />
                  More Demos
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}