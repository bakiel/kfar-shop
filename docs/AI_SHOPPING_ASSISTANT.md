# KFAR AI Shopping Assistant - Technical Documentation

## Overview

The KFAR AI Shopping Assistant is a production-grade conversational AI built using the **JASPER orchestrator-mediated multi-agent pattern**. It provides intelligent shopping assistance with voice support in Hebrew and English.

## Architecture

```
USER INPUT (Voice/Text)
        ↓
┌─────────────────────────────────────┐
│      SHOPPING ORCHESTRATOR          │
│   (Gemini 2.0 Flash - Fast Brain)   │
│                                     │
│  Event → Intent → Agent Selection   │
│  → Parallel/Sequential Execution    │
│  → Response Assembly                │
└─────────────────────────────────────┘
        ↓
   ┌────┴────┬─────────┬────────────┐
   ↓         ↓         ↓            ↓
┌──────┐ ┌──────┐ ┌─────────┐ ┌─────────┐
│Search│ │Cart  │ │Recommend│ │ Voice   │
│Agent │ │Agent │ │Agent    │ │ Agent   │
└──────┘ └──────┘ └─────────┘ └─────────┘
```

## Voice Implementation

### Gemini 2.5 Flash TTS

The assistant uses **Gemini 2.5 Flash TTS** for high-quality voice synthesis with African American voice characteristics.

**Configuration:**
- **English Voice**: `Charon` - Deep, warm male voice with African American characteristics
- **Hebrew Voice**: `Puck` - Neutral voice optimized for Hebrew clarity
- **Audio Format**: PCM at 24kHz, mono, 16-bit (converted to WAV for browser playback)

**API Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent
```

**Request Structure:**
```json
{
  "contents": [
    {
      "parts": [{ "text": "Your text here" }]
    }
  ],
  "generationConfig": {
    "responseModalities": ["AUDIO"],
    "speechConfig": {
      "voiceConfig": {
        "prebuiltVoiceConfig": {
          "voiceName": "Charon"
        }
      }
    }
  }
}
```

### Voice Fallback

If Gemini TTS is unavailable (no API key or API error), the system falls back to browser's Web Speech API with optimized settings:

- **English**: Lower pitch (0.9) for warmth, normal rate
- **Hebrew**: Normal pitch, slightly slower rate (0.95) for clarity

## File Structure

```
/lib/ai/
├── orchestrator/
│   └── shopping-brain.ts        # Main Gemini 2.0 Flash orchestrator
├── agents/
│   ├── search-agent.ts          # Semantic product search with voice corrections
│   ├── cart-agent.ts            # Shopping cart operations
│   ├── recommendation-agent.ts  # Product recommendations (optional)
│   └── voice-agent.ts           # Gemini 2.5 Flash TTS implementation
├── tools/
│   └── shopping-tools.ts        # Gemini function calling definitions
├── events/
│   └── shopping-events.ts       # Event types and data structures
└── config/
    ├── gemini-config.ts         # Gemini API configuration
    └── voice-config.ts          # Voice presets and settings

/app/api/ai/
├── chat/route.ts                # Main chat endpoint
└── voice/route.ts               # Text-to-Speech endpoint

/components/chat/
└── ShoppingAssistant.tsx        # Premium branded chat UI

/hooks/
└── useShoppingAssistant.ts      # React hook for chat state & voice
```

## Key Components

### 1. Search Agent (`/lib/ai/agents/search-agent.ts`)

Handles semantic product search with:
- **Voice corrections**: Fixes common mishearings (e.g., "satan" → "seitan")
- **Category synonyms**: Maps user terms to actual categories (e.g., "desserts" → "ice-cream", "chocolates")
- **Relevance scoring**: Weighted scoring based on name, category, vendor, tags, and description matches

**Voice Correction Examples:**
```typescript
'seitan': ['satan', 'setan', 'saitan'],
'tahini': ['tahina', 'tehini', 'tehina'],
'hummus': ['homos', 'humus', 'homus'],
```

**Category Synonym Examples:**
```typescript
'desserts': ['ice-cream', 'sorbet', 'parfait', 'chocolates', 'sweets'],
'proteins': ['seitan', 'tofu', 'tempeh'],
```

### 2. Voice Agent (`/lib/ai/agents/voice-agent.ts`)

Handles text-to-speech with:
- **Gemini 2.5 Flash TTS** primary implementation
- **PCM to WAV conversion** for browser playback
- **Emotion prefixes** for natural speech (excited, helpful, apologetic)
- **Browser TTS fallback** when Gemini unavailable

**Available Voices:**
| Voice | Characteristics | Best For |
|-------|-----------------|----------|
| Charon | Deep, warm, male | English (African American) |
| Kore | Expressive, female | Hebrew (alternative) |
| Puck | Neutral, clear | Hebrew (default) |
| Aoede | Warm, friendly, female | English (alternative) |

### 3. Shopping Orchestrator (`/lib/ai/orchestrator/shopping-brain.ts`)

Uses Gemini 2.0 Flash for:
- **Intent detection** via function calling
- **Agent routing** based on detected intent
- **Response assembly** with products and suggestions
- **Bilingual support** (Hebrew/English)

**Supported Intents:**
- `search_products` - Find products by query
- `add_to_cart` - Add product to cart
- `view_cart` - Show cart contents
- `browse_category` - Browse products by category
- `browse_vendor` - Browse products by vendor
- `get_recommendations` - Get similar or trending products

### 4. Shopping Assistant UI (`/components/chat/ShoppingAssistant.tsx`)

Premium chat interface with:
- **KFAR brand colors**: Green #478c0b, Gold #f6af0d, Cream #fef9ef
- **Animated floating button** with KFAR leaf icon
- **RTL support** for Hebrew
- **Product carousel** with staggered animations
- **Voice visualizer** during listening/speaking
- **Mobile-responsive** design

## API Endpoints

### POST `/api/ai/chat`

Main chat endpoint for conversation.

**Request:**
```json
{
  "message": "Show me vegan desserts",
  "language": "en",
  "isVoice": false,
  "sessionId": "session_123",
  "conversationHistory": [],
  "cart": []
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "text": "Here are some delicious vegan desserts!",
    "intent": "search_products",
    "products": [...],
    "suggestions": ["Show me ice cream", "Browse Teva Deli"]
  }
}
```

### POST `/api/ai/voice`

Text-to-Speech conversion.

**Request:**
```json
{
  "text": "Here are your desserts",
  "language": "en",
  "emotion": "helpful"
}
```

**Response (Gemini TTS):**
```json
{
  "success": true,
  "audioBase64": "UklGRi...",
  "mimeType": "audio/wav"
}
```

**Response (Browser Fallback):**
```json
{
  "success": true,
  "fallbackConfig": {
    "lang": "en-US",
    "rate": 1.0,
    "pitch": 0.9
  }
}
```

### GET `/api/ai/voice?language=en`

Get voice configuration.

**Response:**
```json
{
  "success": true,
  "config": {
    "geminiAvailable": true,
    "currentVoice": {
      "provider": "gemini",
      "voiceName": "Charon",
      "language": "en",
      "speakingRate": 1.0,
      "pitch": 0
    },
    "browserFallback": {
      "lang": "en-US",
      "rate": 1.0,
      "pitch": 0.9
    },
    "supportedLanguages": ["en", "he"],
    "features": {
      "textToSpeech": true,
      "speechToText": "browser",
      "emotions": ["neutral", "excited", "helpful", "apologetic"]
    }
  }
}
```

## Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional
OPENROUTER_API_KEY=your_openrouter_key  # For alternative models
ELEVENLABS_API_KEY=your_elevenlabs_key  # For ElevenLabs TTS fallback
```

## KFAR Brand Colors

```typescript
const BRAND = {
  green: '#478c0b',      // Leaf Core Green - Primary
  greenDark: '#3a7209',  // Darker green for hover states
  greenLight: '#5ba30f', // Lighter green for accents
  gold: '#f6af0d',       // Sun Gold - Secondary
  goldLight: '#ffc942',  // Lighter gold for highlights
  flame: '#c23c09',      // Earth Flame - Accent/Sales
  cream: '#fef9ef',      // Cream Base - Background
  creamDark: '#f5edd8',  // Darker cream for cards
  soil: '#3a3a1d',       // Soil Brown - Text
  mint: '#cfe7c1',       // Herbal Mint - Borders/Highlights
};
```

## Usage Example

```tsx
import ShoppingAssistant from '@/components/chat/ShoppingAssistant';

export default function Page() {
  return (
    <div>
      {/* Your page content */}
      <ShoppingAssistant />
    </div>
  );
}
```

The assistant automatically:
- Integrates with CartContext for cart operations
- Respects language from LanguageContext
- Provides voice input/output when supported

## Troubleshooting

### Voice not working

1. Check `GEMINI_API_KEY` is set in environment
2. Verify browser supports Web Speech API (Chrome recommended)
3. Check console for TTS errors
4. Try the GET `/api/ai/voice` endpoint to verify configuration

### Search returning no results

1. Check server logs for `[SearchAgent]` debug output
2. Verify product data is loaded in data layer
3. Check for voice correction issues (word boundaries)

### Hebrew RTL issues

1. Verify `LanguageContext` is providing correct language
2. Check `dir="rtl"` attribute on relevant elements
3. Ensure Tailwind RTL utilities are working

## Performance Considerations

- **Search**: Direct database query, no AI latency
- **Chat**: ~1-3s for Gemini response
- **Voice TTS**: ~1-2s for Gemini audio generation
- **Voice STT**: Browser native, near-instant

## Security Notes

- GEMINI_API_KEY should never be exposed to client
- Voice API validates text length (max 500 chars)
- Session IDs are generated client-side for continuity

---

*Last Updated: January 2025*
*KFAR Marketplace AI Shopping Assistant v1.0*
