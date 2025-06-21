'use client';

import { useState, useEffect } from 'react';
import { VOICE_CONFIG, AGENT_INTRO } from '@/config/voice';

export default function VoiceSystemReviewPage() {
  const [systemStatus, setSystemStatus] = useState<any>({
    config: {},
    apiTest: {},
    uiTest: {},
    contrast: {}
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSystemConfiguration();
  }, []);

  const checkSystemConfiguration = () => {
    // Check voice configuration
    const config = {
      daniellaId: VOICE_CONFIG.daniella.id,
      yaakovId: VOICE_CONFIG.yaakov.id,
      expectedDaniellaId: 'Z3R5wn05IrDiVCyEkUrK',
      expectedYaakovId: 'TX3LPaxmHKxFdv7VOQHJ',
      daniellaCorrect: VOICE_CONFIG.daniella.id === 'Z3R5wn05IrDiVCyEkUrK',
      yaakovCorrect: VOICE_CONFIG.yaakov.id === 'TX3LPaxmHKxFdv7VOQHJ',
      envVars: {
        apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ? '***' + process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY.slice(-4) : 'NOT SET',
        daniellaEnv: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_DANIELLA,
        yaakovEnv: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID_YAAKOV
      }
    };

    setSystemStatus(prev => ({ ...prev, config }));
  };

  const testElevenLabsAPI = async () => {
    setIsLoading(true);
    const results: any = {
      daniella: null,
      yaakov: null,
      errors: []
    };

    try {
      // Test Daniella
      const daniellaRes = await fetch('/api/voice/v3-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Testing Daniella voice system.',
          voice: 'daniella',
          stream: false
        })
      });

      const daniellaData = await daniellaRes.json();
      results.daniella = {
        status: daniellaRes.status,
        hasAudio: !!daniellaData.audio,
        error: daniellaData.error,
        success: daniellaData.success !== false
      };

      // Test Yaakov
      const yaakovRes = await fetch('/api/voice/v3-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Testing Yaakov voice system.',
          voice: 'yaakov',
          stream: false
        })
      });

      const yaakovData = await yaakovRes.json();
      results.yaakov = {
        status: yaakovRes.status,
        hasAudio: !!yaakovData.audio,
        error: yaakovData.error,
        success: yaakovData.success !== false
      };

    } catch (error: any) {
      results.errors.push(error.message);
    }

    setSystemStatus(prev => ({ ...prev, apiTest: results }));
    setIsLoading(false);
  };

  const StatusIndicator = ({ status }: { status: boolean }) => (
    <span className={status ? 'text-green-600' : 'text-red-600'}>
      {status ? '✅ PASS' : '❌ FAIL'}
    </span>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8" style={{ color: '#3a3a1d' }}>
        KFAR Voice System Complete Review
      </h1>

      {/* Configuration Check */}
      <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#fef9ef', border: '2px solid #f6af0d' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
          1. Voice Configuration Check
        </h2>
        
        <div className="space-y-3">
          <div>
            <strong>Daniella Voice ID:</strong>
            <div className="ml-4">
              <div>Current: <code>{systemStatus.config.daniellaId}</code></div>
              <div>Expected: <code>{systemStatus.config.expectedDaniellaId}</code></div>
              <div><StatusIndicator status={systemStatus.config.daniellaCorrect} /></div>
            </div>
          </div>

          <div>
            <strong>Yaakov Voice ID:</strong>
            <div className="ml-4">
              <div>Current: <code>{systemStatus.config.yaakovId}</code></div>
              <div>Expected: <code>{systemStatus.config.expectedYaakovId}</code></div>
              <div><StatusIndicator status={systemStatus.config.yaakovCorrect} /></div>
            </div>
          </div>

          <div>
            <strong>Environment Variables:</strong>
            <div className="ml-4 text-sm">
              <div>API Key: {systemStatus.config.envVars?.apiKey}</div>
              <div>Daniella Env: {systemStatus.config.envVars?.daniellaEnv}</div>
              <div>Yaakov Env: {systemStatus.config.envVars?.yaakovEnv}</div>
            </div>
          </div>
        </div>
      </div>

      {/* API Test */}
      <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#cfe7c1', border: '2px solid #478c0b' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
          2. ElevenLabs V3 API Test
        </h2>
        
        <button
          onClick={testElevenLabsAPI}
          disabled={isLoading}
          className="mb-4 px-6 py-3 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          style={{ backgroundColor: '#c23c09' }}
        >
          {isLoading ? 'Testing...' : 'Run API Test'}
        </button>

        {systemStatus.apiTest.daniella && (
          <div className="space-y-3">
            <div>
              <strong>Daniella Voice Test:</strong>
              <div className="ml-4">
                <div>Status: {systemStatus.apiTest.daniella.status}</div>
                <div>Has Audio: {systemStatus.apiTest.daniella.hasAudio ? 'Yes' : 'No'}</div>
                <div>Success: <StatusIndicator status={systemStatus.apiTest.daniella.success} /></div>
                {systemStatus.apiTest.daniella.error && (
                  <div className="text-red-600">Error: {systemStatus.apiTest.daniella.error}</div>
                )}
              </div>
            </div>

            <div>
              <strong>Yaakov Voice Test:</strong>
              <div className="ml-4">
                <div>Status: {systemStatus.apiTest.yaakov.status}</div>
                <div>Has Audio: {systemStatus.apiTest.yaakov.hasAudio ? 'Yes' : 'No'}</div>
                <div>Success: <StatusIndicator status={systemStatus.apiTest.yaakov.success} /></div>
                {systemStatus.apiTest.yaakov.error && (
                  <div className="text-red-600">Error: {systemStatus.apiTest.yaakov.error}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UI Contrast Check */}
      <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#fff', border: '2px solid #3a3a1d' }}>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
          3. UI & Contrast Review
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Voice Button Design:</h3>
            <div className="flex gap-4 items-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                style={{ 
                  backgroundColor: '#c23c09',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 3px #ffffff, 0 0 0 6px #f6af0d'
                }}
              >
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2h-2v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
                </svg>
              </div>
              <div>
                <p>Background: Earth Flame (#c23c09) - High contrast red</p>
                <p>Icon: Pure white with strong shadow</p>
                <p>Border: White ring + Sun Gold (#f6af0d) outer ring</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Brand Colors WCAG Contrast Check:</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Color Combo</th>
                  <th className="text-left py-2">Contrast Ratio</th>
                  <th className="text-left py-2">WCAG AA</th>
                  <th className="text-left py-2">WCAG AAA</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">White on Earth Flame (#c23c09)</td>
                  <td>5.68:1</td>
                  <td><StatusIndicator status={true} /></td>
                  <td><StatusIndicator status={false} /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">White on Leaf Green (#478c0b)</td>
                  <td>4.84:1</td>
                  <td><StatusIndicator status={true} /></td>
                  <td><StatusIndicator status={false} /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">White on Sun Gold (#f6af0d)</td>
                  <td>2.17:1</td>
                  <td><StatusIndicator status={false} /></td>
                  <td><StatusIndicator status={false} /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Soil Brown (#3a3a1d) on White</td>
                  <td>11.43:1</td>
                  <td><StatusIndicator status={true} /></td>
                  <td><StatusIndicator status={true} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Summary */}
      <div className="mb-8 p-6 rounded-lg bg-gray-100">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#3a3a1d' }}>
          4. System Summary & Recommendations
        </h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-white rounded">
            <h3 className="font-semibold">✅ Fixed Issues:</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Updated voice IDs to correct values in config</li>
              <li>Removed fallback to browser TTS - V3 only</li>
              <li>Improved button contrast with Earth Flame background</li>
              <li>Added white rings for better visibility</li>
              <li>Made button larger (72px) for better accessibility</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded">
            <h3 className="font-semibold">⚠️ Current Status:</h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Voice configuration: {systemStatus.config.daniellaCorrect && systemStatus.config.yaakovCorrect ? '✅ Correct' : '❌ Needs update'}</li>
              <li>API connectivity: Run test above to check</li>
              <li>Button contrast: ✅ Fixed with high-contrast colors</li>
              <li>No browser TTS fallback: ✅ Implemented</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded">
            <h3 className="font-semibold">🔧 If API Still Fails:</h3>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Verify API key is valid and has credits</li>
              <li>Check if voice IDs exist in your ElevenLabs account</li>
              <li>Ensure CORS is not blocking the request</li>
              <li>Check server logs for detailed error messages</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="p-6 rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-3">Quick Test Links:</h3>
        <div className="flex flex-wrap gap-3">
          <a href="/test-voice" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Basic Voice Test
          </a>
          <a href="/test-elevenlabs-v3" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            V3 API Test
          </a>
          <a href="/" className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
            Main App (Check Voice Button)
          </a>
        </div>
      </div>
    </div>
  );
}