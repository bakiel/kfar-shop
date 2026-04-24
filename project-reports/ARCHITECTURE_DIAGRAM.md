# 🏗️ KFAR Marketplace Architecture Overview

<div align="center">
  <img src="https://kfarmarket.com/images/kfar_logo_primary_horizontal.png" alt="KFAR Logo" width="300"/>
  
  # System Architecture & Technical Design
  ### Complete Technical Documentation
</div>

---

## 🎯 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser] 
        B[Mobile PWA]
        C[QR Scanner]
    end
    
    subgraph "Frontend Layer"
        D[Next.js 14 App]
        E[React Components]
        F[State Management]
    end
    
    subgraph "API Layer"
        G[Next.js API Routes]
        H[Authentication]
        I[Middleware]
    end
    
    subgraph "Services Layer"
        J[AI Services]
        K[Payment Services]
        L[Storage Services]
        M[Email Services]
    end
    
    subgraph "Data Layer"
        N[Supabase/PostgreSQL]
        O[Redis Cache]
        P[File Storage]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    D --> G
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
    G --> M
    G --> N
    N --> O
    L --> P
```

---

## 📁 Project Structure

```
kfar-marketplace/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard
│   ├── api/               # API endpoints
│   ├── customer/          # Customer pages
│   ├── marketplace/       # Shopping pages
│   ├── product/           # Product pages
│   ├── vendor/            # Vendor dashboard
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── chat/             # Chat widgets
│   ├── customer/         # Customer components
│   ├── layout/           # Layout components
│   ├── mobile/           # Mobile-specific
│   ├── qr/               # QR components
│   ├── ui/               # UI library
│   └── vendor/           # Vendor components
├── lib/                   # Core libraries
│   ├── adk/              # AI Development Kit
│   ├── api/              # API clients
│   ├── config/           # Configuration
│   ├── context/          # React contexts
│   ├── data/             # Data layer
│   ├── db/               # Database
│   ├── services/         # Business logic
│   ├── supabase/         # Supabase client
│   └── utils/            # Utilities
├── hooks/                 # Custom React hooks
├── styles/               # Global styles
├── public/               # Static assets
└── database/             # SQL schemas
```

---

## 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant D as Database
    participant AI as AI Service
    participant S as Storage
    
    U->>F: Browse Products
    F->>A: GET /api/products
    A->>D: Query products
    D-->>A: Return data
    A-->>F: JSON response
    F-->>U: Display products
    
    U->>F: Add to Cart
    F->>F: Update local state
    F->>A: POST /api/cart
    A->>D: Save cart
    D-->>A: Confirm
    A-->>F: Success
    
    U->>F: Upload Avatar
    F->>S: Store image
    S-->>F: Image URL
    F->>AI: Analyze avatar
    AI-->>F: Personality data
    F->>A: Update profile
    A->>D: Save analysis
```

---

## 🗄️ Database Schema

### Core Tables Structure:

```sql
-- Vendors Table
vendors
├── id (PK)
├── name
├── slug
├── description
├── logo_path
├── banner_path
├── contact_info
└── timestamps

-- Products Table
products
├── id (PK)
├── vendor_id (FK)
├── name
├── description
├── price
├── images
├── category
├── dietary_info
├── vision_verification
└── timestamps

-- Customers Table
customers
├── id (PK)
├── email
├── profile_data
├── preferences
├── qr_code
├── avatar_analysis
└── timestamps

-- Orders Table
orders
├── id (PK)
├── customer_id (FK)
├── vendor_id (FK)
├── items (JSON)
├── status
├── payment_info
└── timestamps
```

### Relationships:
- **1 Vendor** → Many Products
- **1 Customer** → Many Orders
- **1 Order** → Many Products (via items JSON)
- **1 Product** → Many Reviews

---

## 🔌 API Architecture

### RESTful Endpoints Structure:

```
/api/
├── auth/
│   ├── login
│   ├── register
│   ├── logout
│   └── refresh
├── customers/
│   ├── GET    /              # List customers
│   ├── POST   /              # Create customer
│   ├── GET    /:id           # Get customer
│   ├── PUT    /:id           # Update customer
│   ├── POST   /onboard       # Onboarding
│   └── GET    /qr/:id        # QR data
├── products/
│   ├── GET    /              # List products
│   ├── POST   /              # Create product
│   ├── GET    /:id           # Get product
│   ├── PUT    /:id           # Update product
│   └── DELETE /:id           # Delete product
├── vendors/
│   ├── GET    /              # List vendors
│   ├── POST   /              # Create vendor
│   ├── GET    /:id           # Get vendor
│   └── PUT    /:id           # Update vendor
├── orders/
│   ├── GET    /              # List orders
│   ├── POST   /              # Create order
│   ├── GET    /:id           # Get order
│   └── PATCH  /:id/status    # Update status
└── ai/
    ├── POST   /chat          # AI chat
    ├── POST   /analyze       # Image analysis
    └── POST   /recommend     # Recommendations
```

---

## 🤖 AI Services Integration

```mermaid
graph LR
    subgraph "AI Services"
        A[OpenRouter API]
        B[MiniMax Reasoning]
        C[Vision Analysis]
        D[ElevenLabs Voice]
        E[Personalization Engine]
    end
    
    subgraph "Use Cases"
        F[Product Recommendations]
        G[Avatar Analysis]
        H[Chat Support]
        I[Voice Shopping]
        J[Search Enhancement]
    end
    
    A --> F
    B --> G
    C --> G
    D --> I
    E --> F
    A --> H
    B --> J
```

### AI Service Configuration:
```typescript
const aiServices = {
  openrouter: {
    endpoint: 'https://openrouter.ai/api/v1',
    models: ['claude-3', 'gpt-4', 'mixtral'],
    fallback: true
  },
  minimax: {
    endpoint: 'https://api.minimax.chat/v1',
    model: 'abab6.5-chat',
    features: ['reasoning', 'analysis']
  },
  vision: {
    providers: ['claude', 'gemini'],
    features: ['product_verification', 'avatar_analysis']
  }
}
```

---

## 🔐 Security Architecture

### Authentication Flow:

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant D as Database
    participant J as JWT Service
    
    C->>A: POST /auth/login
    A->>D: Verify credentials
    D-->>A: User data
    A->>J: Generate tokens
    J-->>A: Access + Refresh
    A-->>C: Set cookies + response
    
    C->>A: GET /protected
    A->>J: Verify token
    J-->>A: Valid
    A->>D: Get data
    D-->>A: Response
    A-->>C: Protected data
```

### Security Layers:
1. **Authentication**: JWT with refresh tokens
2. **Authorization**: Role-based access control
3. **Validation**: Input sanitization
4. **Encryption**: HTTPS, bcrypt for passwords
5. **Rate Limiting**: Per-IP and per-user
6. **CORS**: Configured for production domains

---

## 📱 Mobile Architecture

### Progressive Web App Structure:

```
Mobile Features
├── Service Worker
│   ├── Cache strategies
│   ├── Offline support
│   └── Background sync
├── App Manifest
│   ├── Icons
│   ├── Theme colors
│   └── Display modes
├── Mobile Components
│   ├── Bottom navigation
│   ├── Touch gestures
│   └── Native features
└── Responsive Design
    ├── Breakpoints
    ├── Touch targets
    └── Performance
```

---

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Dev]
        B[Git Repository]
    end
    
    subgraph "CI/CD"
        C[GitHub Actions]
        D[Build Process]
        E[Tests]
    end
    
    subgraph "Production"
        F[Vercel]
        G[Supabase Cloud]
        H[CDN]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> H
    F <--> G
```

### Infrastructure:
- **Hosting**: Vercel (Next.js optimized)
- **Database**: Supabase (Managed PostgreSQL)
- **Storage**: Supabase Storage + CDN
- **Domain**: Cloudflare DNS
- **SSL**: Automatic via Vercel
- **Monitoring**: Vercel Analytics

---

## ⚡ Performance Optimization

### Strategies Implemented:

1. **Code Splitting**
   ```typescript
   // Dynamic imports for heavy components
   const QRScanner = dynamic(() => import('@/components/qr/Scanner'))
   ```

2. **Image Optimization**
   ```typescript
   // Next.js Image with lazy loading
   <Image 
     src={product.image}
     loading="lazy"
     placeholder="blur"
   />
   ```

3. **API Caching**
   ```typescript
   // Redis caching layer
   const cached = await redis.get(key)
   if (cached) return cached
   ```

4. **Database Queries**
   ```sql
   -- Optimized with indexes
   CREATE INDEX idx_products_vendor ON products(vendor_id);
   CREATE INDEX idx_products_category ON products(category);
   ```

---

## 🔄 State Management

### Context Architecture:

```typescript
// Global state structure
const AppState = {
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean
  },
  cart: {
    items: CartItem[],
    total: number,
    count: number
  },
  ui: {
    theme: 'light' | 'dark',
    language: 'en' | 'he' | 'ar',
    notifications: Notification[]
  },
  preferences: {
    dietary: string[],
    categories: string[],
    vendors: string[]
  }
}
```

---

## 🌐 Integration Points

### External Services:

| Service | Purpose | Status |
|---------|---------|--------|
| **Supabase** | Database & Auth | ✅ Integrated |
| **OpenRouter** | AI Models | ✅ Integrated |
| **ElevenLabs** | Voice Synthesis | ✅ Integrated |
| **Stripe** | Payments | ⏳ Pending |
| **SendGrid** | Email | ⏳ Pending |
| **Twilio** | SMS/WhatsApp | ⏳ Pending |

---

## 📊 Monitoring & Analytics

### Tracking Architecture:

```typescript
// Event tracking system
const analytics = {
  pageView: (page: string) => { /* ... */ },
  event: (category: string, action: string) => { /* ... */ },
  purchase: (order: Order) => { /* ... */ },
  error: (error: Error) => { /* ... */ }
}
```

### Metrics Collected:
- Page views and user flows
- Conversion rates
- API performance
- Error rates
- User engagement
- Revenue tracking

---

## 🔮 Future Architecture Plans

### Planned Enhancements:

1. **Microservices Migration**
   - Separate services for orders, payments, notifications
   - Independent scaling
   - Better fault isolation

2. **Real-time Features**
   - WebSocket for live updates
   - Push notifications
   - Live chat support

3. **Advanced Caching**
   - GraphQL with Apollo
   - Edge caching
   - Predictive prefetching

4. **Machine Learning Pipeline**
   - Recommendation engine
   - Fraud detection
   - Demand forecasting

---

<div align="center">
  <h3>Architecture Principles</h3>
  <p>Scalable • Secure • Maintainable • Performance-First</p>
  <p style="color: #478c0b;">Built for Growth 🚀</p>
</div>