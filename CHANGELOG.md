# KFAR Marketplace Changelog

## [2.1.0] - 2025-01-21

### AI Shopping Assistant - Major Update

#### New Features
- **Gemini 2.5 Flash TTS Integration** - Premium text-to-speech with Hebrew and English support
  - Voice: Charon (deep, warm - English/African American characteristics)
  - Voice: Puck (neutral - Hebrew)
  - PCM to WAV conversion for browser playback
  - Fallback to browser TTS when API unavailable

- **Shopping Orchestrator** - Gemini 2.0 Flash powered intent detection
  - Natural language product search
  - Cart management via voice/text
  - Bilingual support (Hebrew/English)
  - Context-aware responses

- **Search Agent** - Semantic product search with voice corrections
  - Voice mishearing corrections (e.g., "satan" → "seitan", "homos" → "hummus")
  - Category synonym expansion (e.g., "desserts" → ice-cream, sorbet, chocolates)
  - Relevance scoring algorithm
  - Support for Hebrew food terms

- **Voice Agent** - Full TTS implementation
  - Gemini 2.5 Flash TTS API integration
  - Emotion-aware speech (neutral, excited, helpful, apologetic)
  - 24kHz PCM audio with WAV header generation
  - Browser speech synthesis fallback

#### UI/UX Improvements
- **Fixed Chat Logos** - All three logo instances now display correctly
  - Floating button (36x36)
  - Chat header (28x28)
  - Welcome screen icon (48x48)
  - Changed from Next.js Image to standard img tags

- **Premium Chat Interface**
  - KFAR brand colors throughout
  - Framer Motion animations
  - Product carousel with add-to-cart
  - Voice input with visualizer
  - RTL support for Hebrew

#### Configuration Files Added
- `/lib/ai/config/voice-config.ts` - Voice settings and browser TTS config
- `/lib/ai/config/gemini-config.ts` - Gemini API configuration
- `/lib/ai/events/shopping-events.ts` - Event types for shopping flow
- `/lib/ai/tools/shopping-tools.ts` - Tool definitions for AI

#### API Endpoints
- `POST /api/ai/chat` - Main chat endpoint
- `GET/POST /api/ai/voice` - TTS endpoint (Gemini 2.5 Flash)
- `POST /api/ai/search` - Product search endpoint

### Bug Fixes
- Fixed voice correction regex causing "desserts" → "dessertss" bug
- Fixed TypeScript errors in Framer Motion variants
- Removed unused imports in ShoppingAssistant component

### Technical Details
- **Models Used**:
  - Orchestrator: `gemini-2.0-flash-001`
  - TTS: `gemini-2.5-flash-preview-tts`
- **Audio Format**: PCM 24kHz mono 16-bit → WAV
- **Voices**: Charon (en), Puck (he)

---

## [2.0.0] - 2025-01-20

### Vendor Order Management
- New vendor order management page (`/vendor/orders`)
- Order status updates with WhatsApp notifications
- Real-time order tracking

### WhatsApp Integration
- Basic WhatsApp notification service
- Order status change alerts
- Vendor notification system

### Language System
- Functional Hebrew/English toggle
- Full backend translation system
- RTL layout support

---

## [1.5.0] - 2025-12-XX

### Database Migration
- Migrated from Supabase to Hostinger VPS PostgreSQL
- Database: `kfar_marketplace` on the production VPS
- Created `/lib/db/postgres-client.ts` for new connections

### Previous Features
- Multi-vendor marketplace (6 vendors, 106+ products)
- Complete checkout flow
- Admin dashboard with analytics
- Customer portal with rewards
- Mobile responsive design

---

## Environment Variables Required

```bash
# Gemini AI
GEMINI_API_KEY=your_key_here

# Database (Hostinger VPS)
DATABASE_URL=postgresql://<db-user>:<db-password>@<db-host>:5432/kfar_marketplace

# Optional
ELEVENLABS_API_KEY=fallback_tts
OPENROUTER_API_KEY=alternative_ai
```

## Deployment Notes

### VPS Details
- Host: production Hostinger VPS (see secure ops vault)
- SSH: `ssh root@<server-host>`
- PostgreSQL: Port 5432

### Build Commands
```bash
npm install
npm run build
npm run start
```
