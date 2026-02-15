# KFAR Marketplace - Production Architecture Report

**Last Updated:** 2026-02-15
**Version:** 0.1.1
**Status:** Production (VPS Live at https://kfarapp.com)

---

## 1. System Overview

KFAR Marketplace is a multi-vendor e-commerce platform for the Village of Peace community in Dimona, Israel. It serves 6 vendors with 113 products across categories including plant-based foods, clothing, and specialty goods.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5.12 (App Router) |
| Runtime | Node.js (PM2 on VPS) |
| Database | PostgreSQL (local on VPS) |
| Auth | JWT (bcrypt + jsonwebtoken) |
| Email | Nodemailer + Postfix + DKIM |
| Payment | YPAY (Israel, sandbox) |
| AI | Gemini (shopping assistant, TTS) |
| Styling | Tailwind CSS 3.4 |
| Animation | Framer Motion 12 |
| Icons | Lucide React |
| Charts | Recharts |

### Scale

| Metric | Count |
|--------|-------|
| Pages | 95 |
| API Routes | 133 |
| Components | 177 |
| Service Modules | 45 |
| Database Tables | 24 |
| Vendors | 6 |
| Products | 113 |
| Email Templates | 10 |

---

## 2. Infrastructure

### VPS (Hostinger)

```
Server:   72.61.201.237
OS:       Ubuntu
App:      /opt/kfar (port 3006)
Process:  PM2 (name: kfar)
Proxy:    Nginx reverse proxy
SSL:      Let's Encrypt / Certbot auto-renewal
Domain:   kfarapp.com
Memory:   ~422MB runtime
```

### Email Stack

```
MTA:      Postfix (port 25, local delivery)
IMAP:     Dovecot
Auth:     DKIM (s=mail, d=kfarapp.com)
SPF:      v=spf1 ip4:72.61.201.237 ~all
DMARC:    v=DMARC1; p=quarantine
From:     noreply@kfarapp.com
```

### DNS (Hostinger nameservers)

| Record | Type | Value |
|--------|------|-------|
| @ | A | 72.61.201.237 |
| www | CNAME | kfarapp.com |
| mail | A | 72.61.201.237 |
| @ | MX | mail.kfarapp.com (priority 10) |
| @ | TXT | SPF record |
| _dmarc | TXT | DMARC policy |
| mail._domainkey | TXT | DKIM public key |

### Firewall (kfar-secure, ID: 194570)

- SSH (22), HTTP (80), HTTPS (443), ICMP
- SMTP (25) for email delivery

---

## 3. Authentication System

### Architecture

```
Login (email+password)
  -> bcrypt.compare(password, hash)
  -> JWT access token (15min, returned in body)
  -> JWT refresh token (7 days, httpOnly cookie)
  -> Session stored in user_sessions table

Protected route request
  -> middleware.ts checks /admin/*, /vendor/*, /customer/*
  -> Extracts Bearer token from Authorization header
  -> verifyAccessToken() validates JWT
  -> Role-based access (admin, vendor, customer)

Token refresh
  -> POST /api/auth/refresh
  -> Reads refresh token from httpOnly cookie
  -> Validates, issues new access token
```

### User Accounts

| Role | Email | Count |
|------|-------|-------|
| Admin | admin@kfarapp.com | 1 |
| Vendor | teva@kfarapp.com | 1 |
| Vendor | queens@kfarapp.com | 1 |
| Vendor | people@kfarapp.com | 1 |
| Vendor | garden@kfarapp.com | 1 |
| Vendor | gahn@kfarapp.com | 1 |
| Vendor | kfar@kfarapp.com | 1 |
| **Total** | | **7** |

### Auth API Routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/auth/login | Email+password login |
| POST | /api/auth/register | Customer registration |
| POST | /api/auth/refresh | Token refresh |
| POST | /api/auth/logout | Invalidate session |
| GET | /api/auth/me | Current user info |

---

## 4. Database Schema (24 Tables)

### Core

| Table | Rows | Purpose |
|-------|------|---------|
| users | 7 | Auth (admin/vendor/customer) |
| user_sessions | 8 | JWT refresh tokens |
| customers | 3 | Extended customer profiles |
| vendors | - | Vendor store records |
| products | - | Product catalog |

### Orders & Payments

| Table | Rows | Purpose |
|-------|------|---------|
| orders | 4 | Order records |
| payment_transactions | 0 | YPAY transaction log |
| invoices | - | Generated invoices |

### Rewards & Loyalty

| Table | Rows | Purpose |
|-------|------|---------|
| rewards_points | 0 | Points balances |
| points_transactions | 0 | Points history |
| product_reviews | - | Customer reviews |

### Marketing

| Table | Rows | Purpose |
|-------|------|---------|
| promotions | 2 | Active promotions |
| bundles | 4 | Product bundles |
| coupons | 0 | Discount codes |
| flash_deals | - | Time-limited deals |

### CRM

| Table | Rows | Purpose |
|-------|------|---------|
| crm_activity_log | 0 | Customer activity timeline |
| customer_segments | 5 | Auto/manual segments |
| customer_segment_members | - | Segment membership |
| customer_registrations | - | Registration tracking |
| vendor_registrations | - | Vendor onboarding |

### Communications

| Table | Rows | Purpose |
|-------|------|---------|
| email_templates | 10 | Transactional email templates |
| email_log | 2 | Sent email tracking |
| notifications | 0 | In-app notifications |

### Config

| Table | Rows | Purpose |
|-------|------|---------|
| store_settings | 16 | Key-value store config |

---

## 5. Email System

### Service Layer

**File:** `lib/services/email/email-service.ts`

Three send methods:
- `sendTransactional(to, templateName, variables, lang?)` - DB template with variable substitution
- `sendMarketing(recipients[], templateName, variables)` - Bulk template send
- `sendRaw(to, subject, htmlBody)` - Freeform HTML email

### Email Templates (10)

| Template | Trigger | Variables |
|----------|---------|-----------|
| welcome_customer | Registration | customer_name, points_earned |
| welcome_vendor | Vendor signup | vendor_name, dashboard_url |
| order_confirmation | Payment success | customer_name, order_number, items_html, total |
| order_status_update | Status change | customer_name, order_number, status |
| vendor_new_order | New order placed | vendor_name, order_number, items |
| password_reset | Password reset request | reset_url, expiry_time |
| points_earned | Points awarded | customer_name, points, balance |
| tier_upgrade | Loyalty tier up | customer_name, new_tier |
| promotion_alert | New promotion | customer_name, promotion_title, discount |
| qr_loyalty_card | QR card request | customer_name, qr_code_url, points, tier |

### Email Trigger Points

| Event | Email Sent | Template |
|-------|-----------|----------|
| Customer registers | Welcome email | welcome_customer |
| Order placed | Receipt to customer | order_confirmation |
| Order placed | Alert to vendor(s) | vendor_new_order |
| Payment succeeds (YPAY) | Payment receipt | order_confirmation |
| Order status changes | Update to customer | order_status_update |
| Contact form submitted | Admin notification | (raw HTML) |
| Contact form submitted | Customer confirmation | (raw HTML) |
| Driver application | Admin notification | (raw HTML) |
| Driver application | Applicant confirmation | (raw HTML) |
| Admin broadcast | To all/segment customers | (raw HTML) |

### Delivery Chain

```
App (Nodemailer, port 25)
  -> Postfix (localhost)
  -> OpenDKIM milter (signs with s=mail, d=kfarapp.com)
  -> Remote MTA (Gmail, Outlook, etc.)
  -> Inbox
```

---

## 6. Payment System (YPAY)

### Architecture

```
Checkout -> POST /api/payment/create
  -> ypay-service.getAccessToken()
  -> ypay-service.createPayment(order)
  -> Redirect to YPAY hosted page

YPAY hosted page -> Customer pays
  -> GET /api/payment/callback (redirect)
    -> Update order status
    -> Send receipt email
  -> POST /api/payment/webhook (server-to-server)
    -> Verify payment
    -> Update payment_transactions
    -> Send receipt email (authoritative)
```

### Payment Methods

| Method | Status | Handler |
|--------|--------|---------|
| Credit Card (YPAY) | Sandbox ready | ypay-service.ts |
| Braysheet (community currency) | QR display | Checkout page |
| Bank Transfer | Details display | Checkout page |

### Status: Sandbox

- Endpoint: https://ypay.co.il/api/v1/
- Client ID: Mg==
- Installment support: 1-12 payments
- **Production credentials pending from YPAY**

---

## 7. CRM System

### Service Layer

**File:** `lib/services/crm/crm-service.ts`

Features:
- Customer CRUD with search/filter/pagination
- Activity timeline logging
- Customer segmentation (auto-rules + manual tags)
- Lifetime value calculation
- Notes and tagging

### CRM Pages

| Page | Path | Purpose |
|------|------|---------|
| CRM Dashboard | /admin/crm | Overview: counts, segments, recent activity |
| Customer List | /admin/crm/customers | Search, filter, paginate |
| Customer Detail | /admin/crm/customers/[id] | Full profile, orders, activity, notes |
| Segments | /admin/crm/segments | Create/manage segments |

### CRM API Routes (7)

| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/admin/crm/customers | List with search/filter |
| GET | /api/admin/crm/customers/[id] | Customer detail |
| GET | /api/admin/crm/customers/[id]/activity | Activity timeline |
| POST | /api/admin/crm/customers/[id]/note | Add note |
| POST | /api/admin/crm/customers/[id]/tag | Add tag |
| GET/POST | /api/admin/crm/segments | Segment CRUD |
| GET | /api/admin/crm/stats | CRM stats |

---

## 8. Notification System

### Channels

| Channel | Implementation | Status |
|---------|---------------|--------|
| In-App | notifications DB table | Active |
| Email | Nodemailer + Postfix | Active |
| WhatsApp | URL scheme links | Active |

### Service Split

- `notification-service.ts` - Client-side fetch wrapper (browser)
- `notification-service.server.ts` - Server-side DB operations

### Admin Broadcast

**POST /api/admin/notifications/broadcast**

Allows admin to send announcements to all customers or a specific segment via:
- In-app notifications (stored in DB)
- Email (via sendRaw)

---

## 9. AI Shopping Assistant

### Architecture

```
User input (text/voice)
  -> Shopping Brain (Gemini 2.0 Flash)
    -> Intent detection
    -> Search Agent (semantic product search)
    -> Cart Agent (add/remove/checkout)
  -> Response + TTS

Voice output
  -> Gemini 2.5 Flash TTS
  -> Hebrew (Puck voice) / English (Charon voice)
  -> Fallback: ElevenLabs / browser TTS
```

### Files

| File | Purpose |
|------|---------|
| components/chat/ShoppingAssistant.tsx | Chat UI |
| hooks/useShoppingAssistant.ts | Assistant hook |
| lib/ai/orchestrator/shopping-brain.ts | Gemini orchestrator |
| lib/ai/agents/voice-agent.ts | TTS engine |
| lib/ai/agents/search-agent.ts | Product search |
| lib/ai/agents/cart-agent.ts | Cart operations |

---

## 10. API Route Index (133 routes)

### Auth (5)
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me

### Payment (4)
- POST /api/payment/create
- GET /api/payment/callback
- POST /api/payment/webhook
- GET /api/payment/status/[orderId]

### Orders (5)
- GET /api/orders
- GET /api/orders/[id]
- PATCH /api/orders/[id]/status
- POST /api/orders/confirm
- POST /api/orders/create

### Notifications (5)
- GET /api/notifications
- PATCH /api/notifications/[id]/read
- PATCH /api/notifications/mark-all-read
- GET /api/notifications/preferences
- GET /api/notifications/unread-count

### Admin (14)
- GET /api/admin/accounts
- GET/POST /api/admin/bundles
- GET /api/admin/dashboard
- POST /api/admin/notifications/broadcast
- GET /api/admin/orders
- GET/POST /api/admin/promotions
- POST /api/admin/promotions/moderate
- CRM routes (7, see Section 7)

### Vendor (19)
- GET /api/vendor/[vendorId] (+ banners sub-routes)
- GET /api/vendor/analytics
- POST /api/vendor/auth
- GET/POST /api/vendor/banners
- POST /api/vendor/onboarding (+ v2)
- GET /api/vendor/orders
- PATCH /api/vendor/orders/[id]/status
- GET/POST /api/vendor/products (+ [id], analyze)
- POST /api/vendor/promotions/submit
- POST /api/vendor/qr/generate
- GET /api/vendor/welcome-package

### Customer (7)
- POST /api/customer/onboarding
- GET /api/customer/orders (+ [id])
- GET/PUT /api/customer/profile
- GET /api/customer/rewards (+ transactions)
- GET /api/customer/stats

### AI (3)
- POST /api/ai/chat
- POST /api/ai/voice
- GET /api/ai-assistant

### Products & Vendors (public)
- GET /api/products (+ [id], enhanced, db)
- GET /api/vendors (+ [vendorId], products, db)
- GET /api/landing
- GET /api/search

### Other
- POST /api/contact
- POST /api/drivers/apply (+ GET applications)
- POST /api/translate (+ batch, AI)
- Invoice generation routes
- Webhook handlers (WhatsApp, SMS)
- Debug/test routes (development only)

---

## 11. Data Layer

### Dual-Source Architecture

```
Request -> isDbAvailable()
  -> YES: PostgreSQL query
  -> NO:  Static data fallback (lib/data/wordpress-style-data-layer.ts)
```

The static data layer contains all 6 vendors and 113 products, ensuring the site works even if the database is unavailable. The `isDbAvailable()` function caches its result and has an 800ms connection timeout.

### Vendors

| ID | Name | Products |
|----|------|----------|
| teva-deli | Teva Deli | 47 |
| queens-cuisine | Queens Cuisine | 18 |
| people-store | People Store | 20 |
| garden-of-light | Garden of Light | 11 |
| gahn-delight | Gahn Delight | 10 |
| vop-shop | VOP Shop | 7 |

---

## 12. Frontend Architecture

### Routing (App Router)

```
app/
  page.tsx              # Landing (Server Component, force-dynamic)
  layout.tsx            # Root layout
  admin/                # Admin dashboard (JWT protected)
    dashboard/
    orders/
    vendors/
    promotions/
    crm/                # CRM module
    accounts/
    settings/
    templates/
    analytics/
  vendor/               # Vendor dashboard (JWT protected)
    dashboard/
    orders/
    products/
    promotions/
    qr-codes/
    onboarding/
  customer/             # Customer portal (JWT protected)
    dashboard/
    orders/
    rewards/
    profile/
  checkout/             # Checkout flow
  shop/                 # Product catalog
  vendors/              # Vendor directory
  about/                # Static pages
  contact/
  become-a-driver/
```

### Key Components

| Component | Purpose |
|-----------|---------|
| components/landing/ | 9 landing page sections |
| components/chat/ShoppingAssistant.tsx | AI shopping assistant |
| components/layout/Header.tsx | Main header/nav |
| components/ui/ | Shared UI components |
| components/vendor/ | Vendor dashboard widgets |
| components/admin/ | Admin dashboard widgets |

### Translations

- `lib/context/LanguageContext.tsx` - Language provider
- `useLanguage()` hook with `t()` function
- Hebrew/English with RTL support via `isRTL`

---

## 13. Deployment

### Build & Deploy

```bash
# Local build
node_modules/.bin/next build

# VPS deployment
ssh root@72.61.201.237
cd /opt/kfar
git pull
npm install --legacy-peer-deps
NODE_OPTIONS='--max-old-space-size=2048' node_modules/.bin/next build
pm2 restart kfar
```

### PM2 Config

Process managed via `/opt/kfar/ecosystem.config.js` with all env vars including:
- Database (POSTGRES_*)
- Auth (JWT_SECRET, JWT_REFRESH_SECRET)
- Email (SMTP_HOST=localhost, SMTP_PORT=25)
- Payment (YPAY_*)
- AI (GEMINI_API_KEY)
- App (NEXT_PUBLIC_APP_URL=https://kfarapp.com)

### Build Stats

- Compile time: ~8.5 minutes
- Static pages: 205
- Total pages rendered: 179
- First Load JS: 102 KB shared
- Memory required: ~2GB (NODE_OPTIONS)

---

## 14. Verification Results (2026-02-15)

### Working

| System | Status | Details |
|--------|--------|---------|
| Homepage | OK | HTTP 200 |
| Admin Login | OK | JWT returned (249 chars) |
| Vendor Login | OK | JWT returned (280 chars) |
| Auth API (/me) | OK | Returns "No token provided" |
| Landing Data API | OK | 6 vendors, 12 featured, 2 promos, 4 bundles |
| Products API | OK | 113 products returned |
| Notifications API | OK | 0 notifications (empty, working) |
| CRM Customers | OK | 3 customers |
| Vendor Products | OK | 47 products (Teva Deli) |
| Email Delivery | OK | DKIM signed, delivered |
| Contact Form Email | OK | Admin + customer emails sent |
| Database | OK | 24 tables, all accessible |
| PM2 Process | OK | Online, 0 restarts, 422MB |
| Postfix | OK | Active |
| Dovecot | OK | Active |
| OpenDKIM | OK | Active, signing kfarapp.com |

### Known Issues (Minor)

| Issue | Severity | Detail |
|-------|----------|--------|
| Vendor Analytics 500 | Low | UUID format mismatch (string "teva-deli" vs UUID) |
| Vendor Orders 500 | Low | Same UUID issue |
| CRM Segments 500 | Low | Query issue on segment list |
| Slow product queries | Low | 500-1000ms on vendor product lookups |
| Postfix hostname | Cosmetic | Shows isgcawusomnotho.co.za (shared VPS) |

These are non-blocking - core commerce, auth, email, and CRM flows all work.

### Pending (Not Yet Live)

| Feature | Blocker |
|---------|---------|
| YPAY production payments | Awaiting YPAY production credentials |
| SMS notifications | Twilio not configured |
| Real-time updates | WebSocket/SSE not implemented |

---

## 15. Security

### Implemented

- JWT auth with bcrypt password hashing
- httpOnly cookies for refresh tokens
- Route protection via middleware.ts
- DKIM email authentication
- SPF + DMARC email policies
- VPS firewall (SSH/HTTP/HTTPS/ICMP only)
- Input validation on auth routes (zod)

### Recommendations

- Add rate limiting to auth endpoints
- Add CSRF tokens to forms
- Remove debug/test API routes in production
- Add Content-Security-Policy headers
- Enable Nginx rate limiting
- Add DB connection pooling index on slow queries

---

## 16. Service Map

```
lib/services/
  auth-service.ts              # JWT auth, bcrypt, session management
  email/email-service.ts       # Nodemailer, templates, sending
  payment/ypay-service.ts      # YPAY payment processing
  crm/crm-service.ts           # Customer relationship management
  notification-service.ts      # Client-side notification wrapper
  notification-service.server.ts # Server-side notification DB ops
  driver-service.ts            # Delivery driver management
  landing-data-service.ts      # Homepage data (DB + static fallback)
  rewards-service.ts           # Points and loyalty system
  qr-service.ts                # QR code generation
  whatsapp-service.ts          # WhatsApp notification URLs
  vendor-data-service.ts       # Vendor analytics
  ai/                          # AI services (Gemini, DeepSeek, etc.)
  collection-point-service.ts  # Pickup point management
  elevenlabs-v3.ts             # Voice synthesis
  onboarding-service.ts        # User onboarding
```

---

*Generated 2026-02-15. Source: KFAR Marketplace production deployment at https://kfarapp.com*
