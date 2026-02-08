# Vercel AI SDK Migration Guide for KFAR Voice Shopping

## Quick Start

### 1. Installation
```bash
npm install ai @ai-sdk/google @ai-sdk/openai zod
```

### 2. Environment Variables
Add to your `.env.local`:
```env
# Enable Vercel AI features
NEXT_PUBLIC_ENABLE_VERCEL_AI=true

# Existing keys still work
NEXT_PUBLIC_GEMINI_API_KEY=your-existing-key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your-existing-key

# Optional: Add OpenAI for advanced features
OPENAI_API_KEY=your-openai-key
```

### 3. Drop-in Replacement Example

Replace your existing voice processing with enhanced version:

```typescript
// Before: components/voice/VoiceFirstChat.tsx
import { useVoiceCommerce } from '@/hooks/useVoiceCommerce';

// After: Progressive enhancement
import { useSmartVoiceCommerce } from '@/hooks/useVercelEnhancedVoiceCommerce';

export default function VoiceFirstChat() {
  // This automatically uses Vercel AI if enabled, 
  // falls back to existing implementation
  const {
    processCommand,
    isProcessing,
    currentProduct,
    searchResults,
    streamingText, // New: real-time streaming responses
  } = useSmartVoiceCommerce();
  
  // Rest of your component stays the same!
}
```

## Feature Comparison

### Existing System
- ✅ Voice recognition with Web Speech API
- ✅ ElevenLabs TTS integration
- ✅ Google Gemini for AI responses
- ✅ Product search and cart management
- ❌ Response latency: 3-5 seconds
- ❌ No streaming responses
- ❌ Limited tool integration

### With Vercel AI SDK
- ✅ All existing features preserved
- ✅ **Streaming responses** (0.5-1s first token)
- ✅ **Structured tool calling** for cart operations
- ✅ **Multi-model support** (Gemini, GPT-4, Claude)
- ✅ **Type-safe function calling**
- ✅ **Better conversation context**
- ✅ **Progressive enhancement** (no breaking changes)

## Implementation Examples

### Example 1: Streaming Voice Responses

```typescript
// Enhanced voice command processing with streaming
const handleVoiceCommand = async (transcript: string) => {
  setIsProcessing(true);
  setStreamingResponse(''); // Clear previous
  
  const result = await processCommand(transcript, {
    streaming: true,
    onPartialResponse: (text) => {
      // Update UI in real-time as AI generates response
      setStreamingResponse(text);
      
      // Optional: Start TTS on complete sentences
      if (text.match(/[.!?]\s*$/)) {
        speakPartial(text);
      }
    },
  });
  
  // Handle tool results (product searches, cart actions)
  if (result.toolCalls) {
    handleToolResults(result.toolCalls);
  }
};
```

### Example 2: Enhanced Product Search with Tools

```typescript
// Vercel AI automatically handles these voice commands:
"Show me vegan ice cream under 30 shekels"
// → Calls searchProducts tool with price filter

"Add 2 chocolate ice creams to my cart"  
// → Calls addToCart tool with quantity

"What's in my cart?"
// → Calls getCartInfo tool

"Show me today's deals"
// → Calls checkDeals tool
```

### Example 3: Multi-Language Support

```typescript
// Easy language switching with context
const switchLanguage = (lang: 'en' | 'he' | 'ar') => {
  setVoice(currentVoice, lang);
  
  // AI automatically adjusts responses
  processCommand("שלום, מה יש לכם היום?"); // Hebrew
  processCommand("Hello, what do you have today?"); // English
};
```

## Migration Path

### Phase 1: Parallel Testing (Week 1)
1. Install Vercel AI SDK packages
2. Add feature flag: `NEXT_PUBLIC_ENABLE_VERCEL_AI=false`
3. Deploy enhanced components alongside existing ones
4. Test with internal team

### Phase 2: Gradual Rollout (Week 2)
```typescript
// A/B test with percentage rollout
const enableVercelAI = Math.random() < 0.1; // 10% of users
```

### Phase 3: Full Migration (Week 3)
1. Enable for all users: `NEXT_PUBLIC_ENABLE_VERCEL_AI=true`
2. Monitor performance metrics
3. Remove legacy code after stability confirmed

## Performance Monitoring

```typescript
// Track improvements with existing performance tracker
const metrics = getPerformanceMetrics();
console.log('Voice Performance:', {
  avgResponseTime: metrics.avgResponseTime, // Should drop 50-70%
  streamingEnabled: !!streamingText,
  toolCallsUsed: metrics.toolCalls,
  successRate: metrics.successRate,
});
```

## Troubleshooting

### Issue: Streaming not working
```typescript
// Ensure streaming is enabled in processCommand
const result = await processCommand(transcript, {
  streaming: true, // Must be true
  onPartialResponse: (text) => console.log('Streaming:', text),
});
```

### Issue: Tools not executing
```typescript
// Check tool call results
if (result.toolCalls && result.toolCalls.length > 0) {
  console.log('Tools executed:', result.toolCalls);
} else {
  console.log('No tools called - check prompt');
}
```

### Issue: Voice personality not consistent
```typescript
// Set voice context before processing
setVoice('daniella', 'en'); // or 'yaakov'
```

## Cost Optimization

```typescript
// Use different models based on complexity
const models = {
  simple: 'gemini-1.5-flash',    // Fast, cheap
  complex: 'gemini-1.5-pro',      // Better reasoning
  premium: 'gpt-4-turbo',         // Best quality
};

// Route based on query complexity
const model = isComplexQuery(transcript) ? models.complex : models.simple;
```

## Next Steps

1. **Test streaming responses** in development
2. **Monitor latency improvements** with performance tracker
3. **Gather user feedback** on voice interaction quality
4. **Optimize prompts** for your specific use cases
5. **Add more tools** as needed (order tracking, recommendations)

## Support

- Vercel AI SDK Docs: https://sdk.vercel.ai/docs
- GitHub Issues: Your repo issues
- Internal Slack: #voice-commerce-upgrade

Remember: The Vercel AI SDK is designed to enhance, not replace, your existing implementation. All current features continue to work while gaining powerful new capabilities!