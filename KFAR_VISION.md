# KFAR Marketplace - Project Vision & Technical Blueprint

*Created: 2026-02-08 | Source: Client WhatsApp conversations (text + 8 voice notes)*

---

## 1. THE CORE THESIS

> "We have to show that digital commerce is 10x more valuable than physical commerce."
> -- Yoyakim Quick, Village of Peace, Jan 26 2026

The KFAR Marketplace exists to prove that a digital platform serves the African Hebrew Israelite community better than phone orders, cash lines, and limited hours ever could.

### Pain Points We're Solving

| Current Reality | KFAR Solution |
|----------------|---------------|
| Ordering by phone | One-tap ordering, voice shopping |
| Waiting in long lines | Instant checkout, delivery |
| Limited buying options | 129+ products, 6+ vendors, growing |
| Cash/card only | Digital payments, Braysheet tokens |
| No rewards | Points system, first-purchase gifts |
| No visibility | Vendor dashboards, analytics |
| No bundles | Promo bundles (grains, multi-packs) |
| Clunky POS | Platform doubles as vendor POS system |

---

## 2. LANDING PAGE ARCHITECTURE

### Section Map (Client-Approved Layout)

```
[HEADER] Logo | Search | QR | Language | Cart
---------------------------------------------
[1. HERO]
   Community headline + product showcase
   Search bar + category pills
---------------------------------------------
[2. FEATURED CATEGORIES]
   Horizontal scroll: Fresh Foods | Groceries |
   Bakery | Beverages | Heritage | Wellness
---------------------------------------------
[3. CTA BANNERS] (side by side)
   "Become a Vendor" | "Become a Driver"
---------------------------------------------
[4. PROMO BUNDLES]
   Featured promotional bundles
   (grains bundle, multi-packs, mixed items)
   Points reward callout
---------------------------------------------
[5. FLASH DEALS / COUNTDOWN]
   Timer-based promotional offers
   "Summer Special" / seasonal deals
---------------------------------------------
[6. VENDOR SHOWCASE / VALUES]
   Our vendors + community values
   Trust signals
---------------------------------------------
[7. BOTTOM FEATURES BAR]
   QR Code | Voice Shopping | Free Delivery |
   Loyalty Points | First Purchase Gift
---------------------------------------------
[8. FOOTER]
   Links | Social | Community info
---------------------------------------------
[FLOATING WIDGETS]
   African map chat widget (keep!)
   Voice assistant button
```

### Design Direction

**Aesthetic**: Premium community marketplace (not generic e-commerce)
- Gold and green palette (client requested, not black)
- Community warmth + modern tech
- 3D elements where they add value (hero, vendor cards, category icons)
- Framer Motion micro-interactions throughout
- RTL-ready for Hebrew

**References the client liked**:
- Agora grocery marketplace (clean grid, categories, product showcase)
- thumo.app (delivery/pickup toggle, location services, modern hero)

---

## 3. AI & MODEL FRAMEWORK

### Model Selection Strategy

| Function | Model | Cost | Why |
|----------|-------|------|-----|
| **Classification/routing** | Gemini 1.5 Flash | ~$0.075/M in | Cheapest, fast, light tasks |
| **Chat/Reasoning** | Gemini 2.0 Flash | ~$0.10/M in | User-facing conversation quality |
| **Voice TTS** | Gemini 2.5 Flash TTS | ~$0.002/req | Hebrew + English, natural voices |
| **Voice STT** | Web Speech API | Free | Browser native, good enough |
| **Image Gen** | Gemini 3.0 Nano Banana Pro | ~$0.01/img | Product images, hero backgrounds |
| **Embeddings** | Gemini text-embedding | ~$0.0001/req | Product search, semantic matching |

**Tiered approach**: 1.5 Flash for cheap internal tasks, 2.0 Flash for user-facing quality.
**NO DeepSeek** (token waste). **NO GPT-5 Nano** (verbose, inflates cost despite cheap rate).

### AI Features Map

1. **Shopping Assistant** (existing, needs polish)
   - Gemini 2.0 Flash for intent detection
   - Gemini 2.5 Flash TTS for voice responses
   - Semantic product search
   - Cart operations via natural language

2. **Smart Recommendations** (planned)
   - "Customers also bought" via embeddings
   - Seasonal/holiday recommendations
   - Bundle suggestions based on cart

3. **Voice Shopping** (existing, needs UX polish)
   - "Add 3 packs of tofu to cart"
   - Hebrew + English support
   - Voice corrections for product names

4. **Image Generation** (planned)
   - Auto-generate bundle images
   - Hero background variations
   - Vendor promotional graphics

---

## 4. CUSTOMER ONBOARDING FLOW

### Step 1: Landing Page Discovery
- Hero catches attention (community pride + products)
- Categories let them browse familiar items
- "First 100 accounts get a gift" banner

### Step 2: Account Creation
- Phone number (primary - Israeli market)
- Email (secondary)
- Name + delivery address
- Language preference (Hebrew/English)
- Welcome reward: X points credited instantly

### Step 3: First Purchase Flow
- Guided tour of marketplace
- Recommended bundle for first-timers
- Free delivery on first order
- Points multiplier on first purchase

### Step 4: Ongoing Engagement
- Push notifications for deals
- WhatsApp order updates
- Points balance reminders
- Vendor favorites / re-order shortcuts

---

## 5. VENDOR ONBOARDING FLOW

### Step 1: Application
- "Become a Vendor" CTA on homepage
- Business name + description
- Product categories
- Photos of products/store
- Contact info

### Step 2: Approval & Setup
- Admin reviews application
- Vendor receives login credentials
- Dashboard walkthrough
- Product upload training (photo guidelines)

### Step 3: Go Live
- Products appear on marketplace
- Vendor receives order notifications (WhatsApp)
- First week promotional boost
- Analytics dashboard activated

### Step 4: Growth
- Monthly performance reports
- Promo bundle participation
- Community events integration
- Delivery driver coordination

### Critical: Kiosk/POS Mode
Many vendors will use KFAR as their **primary point of sale system**, not just an online store. This means:
- Tablet-optimized kiosk view for in-store use
- Quick product lookup and checkout
- Cash + card + Braysheet payment recording
- Receipt generation (print/WhatsApp)
- Inventory deduction on each sale
- Daily sales summary for vendor
- Works offline-first (queue syncs when online)

---

## 6. LOYALTY / REWARDS SYSTEM

### Points Economy

| Action | Points |
|--------|--------|
| Create account | 50 points (welcome gift) |
| First purchase | 2x points multiplier |
| Every 10 ILS spent | 1 point |
| Leave a review | 10 points |
| Refer a friend | 25 points |
| Share on social | 5 points |

### Rewards Tiers

| Tier | Points | Perks |
|------|--------|-------|
| Member | 0-99 | Standard pricing |
| Supporter | 100-499 | 5% off select items |
| Champion | 500-999 | Free delivery, early deals |
| Elder | 1000+ | VIP bundles, exclusive products |

### First 100 Accounts Incentive
- 100 bonus points (instant Supporter tier)
- Free delivery on first 3 orders
- Exclusive "Founding Member" badge

---

## 7. TECHNICAL IMPLEMENTATION PLAN

### Sprint 1: Landing Page (Current)
1. Redesign hero with 3D elements + community feel
2. Build all 8 sections from layout map
3. Framer Motion entrance animations
4. Mobile-first responsive
5. RTL Hebrew support

### Sprint 2: Core Flows
1. Customer registration + onboarding
2. Vendor application form
3. Order flow end-to-end (order -> admin -> vendor -> customer)
4. WhatsApp notification integration

### Sprint 3: Smart Features
1. AI shopping assistant polish
2. Voice shopping UX
3. QR code scanner
4. Points/rewards system (backend)

### Sprint 4: Polish & Launch
1. Payment API integration (when ready)
2. Kiosk mode for vendor POS
3. Hebrew translation audit
4. Focus group testing
5. Performance optimization

---

## 8. LANGUAGE GUIDELINES

### Sacred Rules
- **NEVER "Ground Meat"** -- always "Ground MeatLESS"
- **NEVER "meat substitute"** -- say "plant-based"
- **NEVER "fake meat"** -- say "plant-based protein"
- "Heritage dishes" not "ethnic food"
- "Vegan delights" is preferred
- Products are "life-enhancing"
- Respect the vegan identity as spiritual, not dietary

### Copy Voice
- Warm, community-first
- Spiritual undertones welcome ("blessings", "shalom")
- Empowering, not sales-y
- Bilingual: Hebrew primary, English secondary

---

## 9. DESIGN TOKENS

### Colors (Gold & Green Direction)

```css
--kfar-gold: #C4A265;        /* Primary accent */
--kfar-gold-light: #D4B87A;  /* Hover states */
--kfar-green: #2D5A27;       /* Primary brand */
--kfar-green-light: #4A7C44; /* Secondary */
--kfar-cream: #F5F0E8;       /* Background */
--kfar-earth: #3D2E1C;       /* Dark text */
--kfar-white: #FEFEFE;       /* Cards */
--kfar-leaf: #78A55A;        /* Success/fresh */
```

### Typography
- Headlines: Bold serif or geometric sans (premium feel)
- Body: Clean sans-serif (legibility)
- Hebrew: System Hebrew fonts with proper RTL
- Icons: Lucide only, stroke-[1.5]

---

*This document is the single source of truth for KFAR Marketplace development.*
*All decisions trace back to client voice notes and WhatsApp messages dated Jan 21 - Feb 8, 2026.*
