# KFAR Marketplace - AI Assistant Guide

## Project Overview
KFAR Marketplace is a multi-vendor e-commerce platform for the Village of Peace community in Dimona, Israel. The platform supports Hebrew/English, multiple payment methods including community currency (Braysheet), and focuses on local vendors and community building.

## Current Status (January 2025)

### ✅ What's Working
1. **Multi-vendor marketplace** - 6 active vendors, 106 products
2. **Hebrew/English translation system** - Full backend ready, UI toggle implemented
3. **Complete checkout flow** - Mobile responsive, guest checkout
4. **Admin dashboard** - Vendor analytics, customer management
5. **Customer portal** - Order history, profile, rewards
6. **Vendor dashboard** - Now includes order management
7. **WhatsApp notifications** - Basic integration for order alerts
8. **AI Shopping Assistant** - Gemini-powered voice/text shopping (NEW!)
   - Gemini 2.5 Flash TTS (Hebrew/English)
   - Natural language product search
   - Voice input with corrections
   - Premium chat UI with Framer Motion

### 🚧 What Needs Work
1. **Payment gateway** - Israeli processor integration needed
2. **Real order data** - Currently using mock data
3. **Vendor inventory sync** - Manual updates only
4. **SMS notifications** - WhatsApp only for now

## Key Files & Locations

### Translation System
- `/app/api/translate/route.ts` - API endpoint
- `/hooks/useTranslation.ts` - React hook
- `/lib/utils/translation-helpers.ts` - Helper functions
- `/lib/context/LanguageContext.tsx` - Language context
- `/components/ui/TranslatedText.tsx` - Translation component

### Vendor System
- `/app/vendor/dashboard/page.tsx` - Main vendor dashboard
- `/app/vendor/orders/page.tsx` - Order management (NEW)
- `/app/vendor/login/page.tsx` - Vendor login
- `/lib/services/whatsapp-service.ts` - WhatsApp notifications (NEW)

### Customer Features
- `/app/customer/dashboard/page.tsx` - Customer dashboard
- `/app/customer/orders/page.tsx` - Order history
- `/app/checkout/page.tsx` - Checkout process

### Data Layer
- `/lib/data/wordpress-style-data-layer.ts` - Product/vendor data
- `/lib/db/postgres-client.ts` - PostgreSQL database client
- `/lib/services/vendor-data-service.ts` - Vendor analytics

### AI Shopping Assistant
- `/components/chat/ShoppingAssistant.tsx` - Main chat UI component
- `/hooks/useShoppingAssistant.ts` - Shopping assistant hook
- `/lib/ai/orchestrator/shopping-brain.ts` - Gemini orchestrator
- `/lib/ai/agents/voice-agent.ts` - Gemini 2.5 Flash TTS
- `/lib/ai/agents/search-agent.ts` - Semantic product search
- `/lib/ai/agents/cart-agent.ts` - Cart operations
- `/lib/ai/config/voice-config.ts` - Voice settings
- `/app/api/ai/chat/route.ts` - Chat API endpoint
- `/app/api/ai/voice/route.ts` - TTS API endpoint

## Environment Variables
```
# PostgreSQL Database (VPS)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=kfar_marketplace
POSTGRES_USER=kfar
POSTGRES_PASSWORD=kfar_secure_2025
DATABASE_URL=postgresql://kfar:kfar_secure_2025@localhost:5432/kfar_marketplace

# AI (Required for Shopping Assistant)
GEMINI_API_KEY=your_gemini_key_here
OPENROUTER_API_KEY=your_openrouter_key

# Voice (Optional)
ELEVENLABS_API_KEY= (fallback TTS)
```

## Quick Commands
```bash
# Development (local)
npm run dev

# Build
npm run build

# Deploy to VPS
ssh root@72.61.201.237 "cd /opt/kfar && git pull && npm run build && pm2 restart kfar"

# Check live site
https://kfar.sproutsapp.cloud (temporary domain)
https://kfar.village-of-peace.com (when client renews domain)
```

## Common Tasks

### Add Language Support to a Page
```tsx
import { useLanguage } from '@/lib/context/LanguageContext';
import TranslatedText from '@/components/ui/TranslatedText';

// In component
const { language, t } = useLanguage();

// For static text
<h1>{t('Welcome')}</h1>

// For dynamic content
<TranslatedText context="product_name">{product.name}</TranslatedText>
```

### Add New Vendor
1. Add to `/lib/data/wordpress-style-data-layer.ts`
2. Add logo to `/public/images/vendors/`
3. Update vendor count in documentation

### Handle Orders
1. Vendors see orders at `/vendor/orders`
2. Status updates send WhatsApp notifications
3. Customers track orders at `/customer/orders`

## Business Context
- **Target**: 250-500k ILS monthly revenue
- **Users**: 50-100 families initially
- **Urgent**: People Store bought bad POS system
- **Language**: Hebrew primary, English secondary
- **Payment**: Credit cards, Braysheet tokens, bank transfer

## Testing Accounts
- Admin: Use `/admin/login` 
- Vendor: Use `/vendor/login`
- Customer: Use `/customer/login`

## Deployment (Hostinger VPS)
- **Platform**: Hostinger VPS (72.61.201.237)
- **App Location**: `/opt/kfar`
- **Port**: 3006
- **PM2 Process**: `kfar`
- **Repository**: https://github.com/bakiel/kfar-shop
- **Live URL (Temporary)**: https://kfar.sproutsapp.cloud
- **Live URL (Permanent)**: https://kfar.village-of-peace.com (needs client to renew domain)
- **SSL**: Let's Encrypt auto-renewal via Certbot

## Database (PostgreSQL on VPS)
```
Host: localhost (from VPS) / 72.61.201.237 (external - blocked for security)
Port: 5432
Database: kfar_marketplace
User: kfar
Password: kfar_secure_2025
```

### Database Files
- `/lib/db/postgres-client.ts` - PostgreSQL client (primary)

### SSH Access
```bash
# SSH to VPS
ssh root@72.61.201.237

# Access database
sudo -u postgres psql kfar_marketplace

# View app logs
pm2 logs kfar

# Restart app
pm2 restart kfar
```

## Important Notes
1. Always check what exists before creating new features
2. Mobile responsiveness is critical (many users on phones)
3. Hebrew RTL support is essential
4. Keep checkout process simple
5. Vendor order notifications are highest priority

## Recent Changes (Latest Session - January 21, 2025)

### AI Shopping Assistant (NEW!)
1. **Gemini 2.5 Flash TTS** - Premium voice synthesis
   - Hebrew (Puck voice) and English (Charon voice)
   - African American voice characteristics
   - PCM to WAV conversion for browser playback
2. **Shopping Orchestrator** - Gemini 2.0 Flash intent detection
3. **Search Agent** - Semantic search with voice corrections
4. **Voice Agent** - Full TTS implementation with fallback
5. **Premium Chat UI** - Framer Motion animations, KFAR branding
6. **Fixed Chat Logos** - All three logo instances now display correctly

### Previous Updates
- **Menu System Redesign** - Created MENU_REDESIGN.md documentation
- **FIXED: Currency dropdown** - Removed double arrow issue
- **DATABASE MIGRATION (Dec 2025)**: Moved from Supabase to Hostinger VPS PostgreSQL
   - Created `kfar_marketplace` database on VPS
   - Migrated 12 vendors, 129 products, 3 customers, 4 orders
   - Created `/lib/db/postgres-client.ts` for new connections
   - See `/DATABASE_MIGRATION.md` for full details

## Next Priority Tasks
1. **Implement new menu system** - See MENU_REDESIGN.md for details
2. Connect real payment processor
3. Implement real-time order data from Supabase
4. Add vendor inventory management
5. Set up automated testing with focus group
6. Create vendor onboarding video/guide

## Menu System Redesign (In Progress)
- **Documentation**: `/MENU_REDESIGN.md` - Complete implementation guide
- **Goal**: Clean Amazon/Google-style hamburger menu
- **Status**: Planning phase, currency dropdown fixed
- **Next Steps**: Create MenuDropdown component