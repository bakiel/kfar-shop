# KFAR Marketplace Landing Page Rebuild

> **Context-Autonomous Document** - This file contains everything needed to rebuild the landing page. Safe to clear context and resume from this document.

**Created:** January 2026
**Status:** IN PROGRESS
**Priority:** HIGH - Client unhappy with current "too busy" design

---

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Current State Audit](#current-state-audit)
3. [Target State](#target-state)
4. [Design System](#design-system)
5. [Implementation Plan](#implementation-plan)
6. [Component Specifications](#component-specifications)
7. [Data Layer Integration](#data-layer-integration)
8. [Skills & Tools](#skills--tools)
9. [Task Checklist](#task-checklist)
10. [Code Templates](#code-templates)

---

## Problem Statement

**Client Feedback:** "The landing page is too busy. It doesn't serve what a marketplace would be."

**Core Issues:**
- 11 sections creating visual overwhelm
- Not following conventional marketplace patterns (Amazon, Etsy, Shopify)
- Hardcoded product data instead of database-fed
- Inconsistent animations and icons
- Too promotional, not transactional

---

## Current State Audit

### File: `/app/page.tsx`
```tsx
// CURRENT - 11 SECTIONS (TOO MANY)
<EnhancedLayout>
  <main className="min-h-screen">
    <HeroSection />           // Complex carousel with floating cards
    <SpecialFeedSection />    // REMOVE - promotional noise
    <CustomerCTA />           // REMOVE - merge into hero
    <CommunityServices />     // REMOVE - not marketplace focus
    <VillageEnterprises />    // REMOVE - separate page
    <VendorCTA />             // REMOVE - merge into vendor section
    <TechFeatures />          // REMOVE - not needed on landing
    <TechDemoSection />       // REMOVE - demo page only
    <StatsSection />          // SIMPLIFY - merge into footer
    <FeaturedProducts />      // KEEP - but database-fed
    <ReviewsSection />        // KEEP - simplify
  </main>
</EnhancedLayout>
```

### Current Component Issues

| Component | File | Issues |
|-----------|------|--------|
| HeroSection | `/components/ui/HeroSection.tsx` | Uses react-icons (FaQrcode, FaWifi), no Framer Motion, floating cards add noise |
| FeaturedProducts | `/components/ui/FeaturedProducts.tsx` | **HARDCODED products array** - not database-fed |
| All sections | Various | Font Awesome icons (`fa-*`) instead of Lucide |

### Icon Audit - Must Replace
```tsx
// WRONG - Currently using
import { FaQrcode, FaWifi } from 'react-icons/fa';
<i className="fas fa-star"></i>
<i className="fas fa-shopping-bag"></i>

// CORRECT - Should use
import { QrCode, Wifi, Star, ShoppingBag } from 'lucide-react';
<QrCode className="w-5 h-5 stroke-[1.5]" />
```

---

## Target State

### New Architecture: 5 Focused Sections

```tsx
// TARGET - Clean marketplace structure
<EnhancedLayout>
  <main className="min-h-screen">
    <HeroSection />           // Clean hero with search + categories
    <CategoryGrid />          // Browse by category (database-fed)
    <FeaturedProducts />      // Top products (database-fed)
    <VendorShowcase />        // Shop by vendor (database-fed)
    <TrustFooter />           // Simple trust indicators + CTA
  </main>
</EnhancedLayout>
```

### Design Philosophy
- **Clean & Conventional**: Follow Amazon/Etsy marketplace patterns
- **Database-Fed**: All products and vendors from data layer
- **Micro-Interactions**: Framer Motion on every interactive element
- **Lucide Icons**: Thin, elegant stroke-[1.5] icons only
- **Mobile-First**: Touch-friendly, responsive

---

## Design System

### Brand Colors (From existing KFAR brand)
```typescript
const colors = {
  // Primary
  leaf: '#478c0b',        // Primary green - actions, success
  leafDark: '#3a7209',    // Hover state
  sun: '#f6af0d',         // Accent yellow - highlights
  earth: '#c23c09',       // Secondary orange - prices, CTAs

  // Neutrals
  soil: '#3a3a1d',        // Primary text
  stone: '#4b5563',       // Secondary text
  pebble: '#6b7280',      // Muted text
  cream: '#fef9ef',       // Background warm
  white: '#ffffff',       // Cards, surfaces

  // Semantic
  success: '#478c0b',
  warning: '#f6af0d',
  error: '#c23c09',
}
```

### Typography
```typescript
const typography = {
  hero: 'text-4xl md:text-5xl lg:text-6xl font-bold',
  h1: 'text-3xl md:text-4xl font-bold',
  h2: 'text-2xl md:text-3xl font-bold',
  h3: 'text-xl md:text-2xl font-semibold',
  body: 'text-base',
  small: 'text-sm',
  caption: 'text-xs',
}
```

### Animation Standards (Framer Motion)
```typescript
// Card hover - REQUIRED on every card
const cardHover = {
  whileHover: { y: -8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" },
  transition: { duration: 0.2, ease: "easeOut" }
}

// Button - REQUIRED on every button
const buttonHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 }
}

// Stagger container
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
}

// Stagger item
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}
```

---

## Implementation Plan

### Phase 1: Foundation (Create New Components)
1. Create `/components/landing/` directory for new components
2. Create `HeroSectionNew.tsx` - Clean hero with search
3. Create `CategoryGrid.tsx` - Database-fed categories
4. Create `FeaturedProductsNew.tsx` - Database-fed products
5. Create `VendorShowcase.tsx` - Database-fed vendors
6. Create `TrustFooter.tsx` - Simple trust section

### Phase 2: Integration
1. Update `/app/page.tsx` to use new components
2. Remove old unused components
3. Test data layer connections
4. Verify mobile responsiveness

### Phase 3: Polish
1. Add all Framer Motion animations
2. Replace all icons with Lucide
3. Test light/dark mode
4. Performance optimization

---

## Component Specifications

### 1. HeroSection (New)
**File:** `/components/landing/HeroSectionNew.tsx`

**Features:**
- Clean split layout (text left, image right)
- Search bar with category dropdown
- Quick category pills
- Single compelling CTA
- NO floating cards, NO carousel

**Data Dependencies:** None (static hero content)

```tsx
// Structure
<section className="bg-[#fef9ef] min-h-[600px]">
  <div className="container grid md:grid-cols-2 gap-12 items-center">
    {/* Left: Content */}
    <motion.div variants={staggerContainer}>
      <motion.h1 variants={staggerItem}>
        Fresh. Local. Vegan.
      </motion.h1>
      <motion.p variants={staggerItem}>
        Shop from 6 trusted vendors in the Village of Peace
      </motion.p>
      <motion.div variants={staggerItem}>
        <SearchBar />
      </motion.div>
      <motion.div variants={staggerItem}>
        <CategoryPills />
      </motion.div>
    </motion.div>

    {/* Right: Hero Image */}
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Image ... />
    </motion.div>
  </div>
</section>
```

### 2. CategoryGrid
**File:** `/components/landing/CategoryGrid.tsx`

**Features:**
- 6-8 category cards in grid
- Each card shows category image + name + product count
- Database-fed from product categories
- Hover lift effect

**Data Dependencies:** `getAllProducts()` for category extraction

```tsx
// Data extraction
const categories = useMemo(() => {
  const products = getAllProducts();
  const categoryMap = new Map();
  products.forEach(p => {
    if (!categoryMap.has(p.category)) {
      categoryMap.set(p.category, { name: p.category, count: 0, image: p.image });
    }
    categoryMap.get(p.category).count++;
  });
  return Array.from(categoryMap.values());
}, []);
```

### 3. FeaturedProductsNew
**File:** `/components/landing/FeaturedProductsNew.tsx`

**Features:**
- 8 product cards in responsive grid
- Database-fed from data layer
- Quick add to cart
- Vendor attribution
- Price display with currency

**Data Dependencies:** `getAllProducts()`, `getVendorById()`

```tsx
// Data fetching
const featuredProducts = useMemo(() => {
  return getAllProducts()
    .filter(p => p.badge === 'Best Seller' || p.badge === 'Featured')
    .slice(0, 8);
}, []);
```

### 4. VendorShowcase
**File:** `/components/landing/VendorShowcase.tsx`

**Features:**
- Horizontal scroll on mobile, grid on desktop
- Vendor card with logo, name, product count
- "Shop Now" CTA per vendor
- Database-fed from vendorStores

**Data Dependencies:** `vendorStores` from data layer

```tsx
// Data fetching
import { vendorStores } from '@/lib/data/wordpress-style-data-layer';

const vendors = Object.values(vendorStores);
```

### 5. TrustFooter
**File:** `/components/landing/TrustFooter.tsx`

**Features:**
- Simple stats row (products, vendors, satisfaction)
- Single CTA to marketplace
- Trust badges (Kosher, Vegan, Local)
- Newsletter signup (optional)

**Data Dependencies:** Stats can be computed from data layer

---

## Data Layer Integration

### Key File: `/lib/data/wordpress-style-data-layer.ts`

**Available Exports:**
```typescript
// Vendors
export const vendorStores: Record<string, VendorStore>

// Functions (may need to create)
export function getAllProducts(): EnhancedProduct[]
export function getVendorById(id: string): VendorStore | undefined
export function getProductsByVendor(vendorId: string): EnhancedProduct[]
export function getProductsByCategory(category: string): EnhancedProduct[]
export function getFeaturedProducts(limit?: number): EnhancedProduct[]
```

### Current Vendor IDs:
- `teva-deli` - Teva Deli (meat alternatives)
- `garden-of-light` - Garden of Light (spreads, cheeses)
- `queens-cuisine` - Queen's Cuisine (gourmet meals)
- `gahn-delight` - Gahn Delight (ice cream)
- `vop-shop` - Village of Peace Shop (merchandise)
- `people-store` - People Store (general goods)

### Helper Functions to Add
If not existing, add to `/lib/data/wordpress-style-data-layer.ts`:

```typescript
// Get all products across all vendors
export function getAllProducts(): EnhancedProduct[] {
  return Object.values(vendorStores).flatMap(store => store.products);
}

// Get featured products
export function getFeaturedProducts(limit: number = 8): EnhancedProduct[] {
  const all = getAllProducts();
  const featured = all.filter(p =>
    p.badge === 'Best Seller' ||
    p.badge === 'Featured' ||
    p.badge === 'New'
  );
  return featured.slice(0, limit);
}

// Get unique categories with counts
export function getCategories(): { name: string; count: number; image: string }[] {
  const products = getAllProducts();
  const categoryMap = new Map<string, { count: number; image: string }>();

  products.forEach(p => {
    const existing = categoryMap.get(p.category);
    if (!existing) {
      categoryMap.set(p.category, { count: 1, image: p.image });
    } else {
      existing.count++;
    }
  });

  return Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    ...data
  }));
}
```

---

## Skills & Tools

### Required Skills (Auto-Activated by Keywords)

| Skill | Trigger | Use For |
|-------|---------|---------|
| `ui-ux-pro-max` | "design system", "marketplace" | Color palettes, typography, layout rules |
| `frontend-design` | "landing page", "beautiful" | Creative direction, micro-interactions |
| `framer-motion` | "animations", "micro-interactions" | All component animations |

### Manual Skill Invocation
```bash
# Generate design system
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "vegan marketplace local food" --design-system -p "KFAR"

# Get specific guidance
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "product card" --domain ux
python3 ~/.claude/skills/ui-ux-pro-max/scripts/search.py "hero section" --domain style
```

### NPM Dependencies (Already Installed)
```json
{
  "framer-motion": "^12.17.3",  // ✅ Installed
  "lucide-react": "^0.511.0",   // ✅ Installed
}
```

---

## Task Checklist

### Phase 1: Foundation
- [ ] Create `/components/landing/` directory
- [ ] Add helper functions to data layer if missing
- [ ] Create `HeroSectionNew.tsx`
- [ ] Create `CategoryGrid.tsx`
- [ ] Create `FeaturedProductsNew.tsx`
- [ ] Create `VendorShowcase.tsx`
- [ ] Create `TrustFooter.tsx`

### Phase 2: Integration
- [ ] Update `/app/page.tsx` with new components
- [ ] Backup old components (rename with `.old` suffix)
- [ ] Test all data layer connections
- [ ] Verify cart functionality works
- [ ] Test navigation links

### Phase 3: Polish
- [ ] Add Framer Motion to HeroSectionNew
- [ ] Add Framer Motion to CategoryGrid
- [ ] Add Framer Motion to FeaturedProductsNew
- [ ] Add Framer Motion to VendorShowcase
- [ ] Replace all icons with Lucide
- [ ] Test mobile responsiveness (375px, 768px, 1024px)
- [ ] Test Hebrew RTL support
- [ ] Verify hover states don't cause layout shift
- [ ] Check all cursor-pointer on clickables

### Phase 4: Cleanup
- [ ] Remove unused old components
- [ ] Update CLAUDE.md with new structure
- [ ] Document any new patterns
- [ ] Performance audit (Lighthouse)

---

## Code Templates

### Product Card Template
```tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart } from 'lucide-react';
import { EnhancedProduct } from '@/lib/data/wordpress-style-data-layer';

interface ProductCardProps {
  product: EnhancedProduct;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer group"
    >
      <Link href={`/product/${product.id}`}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-[#c23c09] text-white text-xs font-semibold rounded-full">
              {product.badge}
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.preventDefault(); /* Add to wishlist */ }}
          >
            <Heart className="w-4 h-4 stroke-[1.5] text-gray-600" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs text-[#6b7280] mb-1">{product.vendorId}</p>
          <h3 className="font-semibold text-[#3a3a1d] mb-2 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#c23c09]">
              ₪{product.price}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 bg-[#478c0b] rounded-full flex items-center justify-center text-white"
              onClick={(e) => { e.preventDefault(); /* Add to cart */ }}
            >
              <ShoppingCart className="w-4 h-4 stroke-[1.5]" />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
```

### Vendor Card Template
```tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';
import { VendorStore } from '@/lib/data/wordpress-style-data-layer';

interface VendorCardProps {
  vendor: VendorStore;
  index?: number;
}

export function VendorCard({ vendor, index = 0 }: VendorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
      className="bg-white rounded-2xl p-6 cursor-pointer group"
    >
      <Link href={`/vendor/${vendor.id}`} className="block">
        {/* Logo */}
        <div className="relative w-16 h-16 mb-4 rounded-xl overflow-hidden border-2 border-gray-100">
          <Image
            src={vendor.logo}
            alt={vendor.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Info */}
        <h3 className="font-semibold text-lg text-[#3a3a1d] mb-1">
          {vendor.name}
        </h3>
        <p className="text-sm text-[#6b7280] mb-3 line-clamp-2">
          {vendor.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-2 text-sm text-[#478c0b] mb-4">
          <Store className="w-4 h-4 stroke-[1.5]" />
          <span>{vendor.products.length} products</span>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 text-[#478c0b] font-medium group-hover:gap-3 transition-all">
          <span>Shop Now</span>
          <ArrowRight className="w-4 h-4 stroke-[1.5]" />
        </div>
      </Link>
    </motion.div>
  );
}
```

### Section Container Template
```tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: 'white' | 'cream' | 'leaf';
}

const backgrounds = {
  white: 'bg-white',
  cream: 'bg-[#fef9ef]',
  leaf: 'bg-[#478c0b]',
};

export function Section({ children, className = '', background = 'white' }: SectionProps) {
  return (
    <section className={`py-16 md:py-24 ${backgrounds[background]} ${className}`}>
      <div className="container mx-auto px-4 md:px-6">
        {children}
      </div>
    </section>
  );
}

export function SectionHeader({
  badge,
  title,
  subtitle
}: {
  badge?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      {badge && (
        <span className="inline-block px-4 py-2 bg-[#478c0b]/10 text-[#478c0b] text-sm font-semibold rounded-full mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-[#3a3a1d] mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-[#6b7280] max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
```

---

## Quick Start Commands

### Resume Work After Context Clear
```
Read MARKETPLACE_LANDING_REBUILD.md and continue from the Task Checklist.
Use Framer Motion for all animations and Lucide icons (stroke-[1.5]) only.
All products/vendors must be database-fed from wordpress-style-data-layer.ts.
```

### Development
```bash
cd /Users/mac/Downloads/kfar-final
npm run dev
# Open http://localhost:3000
```

### Key Files to Edit
- `/app/page.tsx` - Main landing page
- `/lib/data/wordpress-style-data-layer.ts` - Data layer
- `/components/landing/*.tsx` - New components (create)

---

## Notes

- **DO NOT** use Font Awesome (`fa-*`) icons
- **DO NOT** use react-icons
- **DO** use Lucide React with `stroke-[1.5]`
- **DO** use Framer Motion for all animations
- **DO** pull data from data layer, never hardcode products
- **DO** maintain Hebrew/RTL support via `useLanguage()` hook

---

*Last Updated: January 2026*
*Status: Ready for Implementation*
