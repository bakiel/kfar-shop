# KFAR Marketplace Sub-Page Upgrade Plan

> **TL;DR**: Upgrade 6 pages to $20k quality with Framer Motion animations, Lucide icons, and Hebrew/English support.

---

## QUICK START (Do This First)

```bash
# 1. Open this plan
cat /Users/mac/Downloads/kfar-final/UPGRADE_PLAN.md

# 2. Check progress dashboard below

# 3. Find next incomplete task (search for "[ ]")

# 4. Start dev server
cd /Users/mac/Downloads/kfar-final && npm run dev

# 5. Work on next page, update checkboxes as you go
```

---

## PROGRESS DASHBOARD

| Page | Status | Animations | Icons | Bilingual |
|------|--------|------------|-------|-----------|
| Marketplace | `COMPLETE ✓` | 100% | Lucide | RTL ✓ |
| Vendors | `COMPLETE ✓` | 100% | Lucide | RTL ✓ |
| Vendor Store | `COMPLETE ✓` | 100% | Lucide | RTL ✓ |
| Product Detail | `COMPLETE ✓` | 100% | Lucide | RTL ✓ |
| Cart | `COMPLETE ✓` | 100% | Lucide | RTL ✓ |
| Checkout | `COMPLETE ✓` | 100% | Lucide | RTL ✓ |

**Overall Progress**: `6/6 pages complete` | **Target**: All pages at 8/10 quality ✅

---

## WHAT "DONE" LOOKS LIKE

Each upgraded page must have:
- [x] Staggered entrance animation on page load
- [x] Cards lift on hover (y: -8, shadow)
- [x] Buttons scale on tap (1.02 hover, 0.98 tap)
- [x] Scroll reveals for content below fold
- [x] All Lucide icons with `stroke-[1.5]`
- [x] Hebrew/English text toggle working
- [x] RTL layout when Hebrew selected
- [x] No console errors
- [x] Mobile responsive

---

## SKILLS REFERENCE

| Skill | When to Use |
|-------|-------------|
| `/framer-motion` | Animation patterns for React/Next.js |
| `/frontend-design` | Bold aesthetics, micro-interactions |
| `mcp__shadcn-ui__get_component_demo("button")` | Production component code |
| `/css-animations` | Pure CSS/Tailwind animations |

---

## BRAND COLORS

```css
--leaf-green: #478c0b    /* Primary actions */
--sun-gold: #f6af0d      /* Highlights, stars */
--earth-flame: #c23c09   /* Alerts, badges */
--soil-brown: #3a3a1d    /* Text */
--cream-base: #fef9ef    /* Backgrounds */
```

---

## TECH STACK

- **Framework**: Next.js 15.1.8 (App Router)
- **Animation**: Framer Motion (installed)
- **Icons**: Lucide React (installed)
- **Data**: `/lib/data/wordpress-style-data-layer.ts`
- **Language**: Hebrew/English via `useLanguage()` hook

---

# PAGE UPGRADES

---

## PAGE 1: MARKETPLACE

**File**: `/app/marketplace/page.tsx`
**Time**: ~2 hours
**Priority**: HIGH (most traffic)

### Current Issues
- Cards don't lift on hover
- Missing staggered entrance for product grid
- Inconsistent animation patterns

### Tasks

| Task | Line | Status |
|------|------|--------|
| Add cardHover to product cards | 754-858 | [ ] |
| Add whileHover/whileTap to cart button | ~842 | [ ] |
| Verify search bar focus animation | 401-426 | [ ] |
| Verify tag filter animations | 516-540 | [ ] |
| Verify view toggle animation | 454-479 | [ ] |

### Code Change: Product Card Hover

```typescript
// BEFORE (line ~754)
<motion.div
  key={product.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: Math.min(index * 0.05, 0.3) }}
  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all group"
>

// AFTER
<motion.div
  key={product.id}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
  transition={{ duration: 0.2, ease: "easeOut" }}
  className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer"
>
```

### Verification

```bash
# Open http://localhost:3000/marketplace
# Check:
- [ ] Cards lift on hover
- [ ] Add to cart button scales on click
- [ ] Search bar animates on focus
- [ ] Tags animate on selection
```

### Sign-Off
- [ ] Code complete
- [ ] Visual verified
- [ ] Mobile verified
- [ ] RTL verified

---

## PAGE 2: VENDORS

**File**: `/app/vendors/page.tsx`
**Time**: ~1 hour
**Priority**: HIGH
**Status**: Data loading FIXED, needs animation polish

### Tasks

| Task | Line | Status |
|------|------|--------|
| Add cardHover to vendor cards | 268-377 | [ ] |
| Verify Visit Store button animation | 358-372 | [ ] |
| Verify category pills animation | 186-208 | [ ] |
| Verify stats cards hover | 411-464 | [ ] |
| Verify info section scroll reveal | 383-468 | [ ] |

### Code Change: Vendor Card Hover

```typescript
// Find vendor card motion.div and add:
whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
transition={{ duration: 0.2, ease: "easeOut" }}
className="... cursor-pointer"
```

### Verification

```bash
# Open http://localhost:3000/vendors
# Check:
- [ ] Vendor cards lift on hover
- [ ] Visit Store button scales on click
- [ ] Category pills animate
- [ ] Stats cards scale on hover
- [ ] Info section reveals on scroll
```

### Sign-Off
- [ ] Code complete
- [ ] Visual verified
- [ ] Mobile verified
- [ ] RTL verified

---

## PAGE 3: VENDOR STORE

**File**: `/app/vendor/[id]/page.tsx`
**Time**: ~3 hours
**Priority**: MEDIUM

### Current Issues
- Minimal Framer Motion
- Product cards lack hover effects
- No entrance animations

### Tasks

| Task | Status |
|------|--------|
| Add motion imports | [ ] |
| Page entrance animation | [ ] |
| Hero banner parallax | [ ] |
| Product card hover effects | [ ] |
| Quick view modal animation | [ ] |
| Filter/sort controls animation | [ ] |

### Code Additions

```typescript
// Add at top of file
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

// Page entrance
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
}

// Banner parallax
const { scrollY } = useScroll();
const y = useTransform(scrollY, [0, 300], [0, 100]);
```

### Verification

```bash
# Open http://localhost:3000/vendor/teva-deli
# Check:
- [ ] Staggered entrance animation
- [ ] Banner has parallax effect
- [ ] Product cards lift on hover
- [ ] Quick view modal animates
```

### Sign-Off
- [ ] Code complete
- [ ] Visual verified
- [ ] Mobile verified
- [ ] RTL verified

---

## PAGE 4: PRODUCT DETAIL

**File**: `/app/product/[id]/page.tsx`
**Time**: ~3 hours
**Priority**: HIGH (conversion critical)

### Current Issues
- Basic CSS only, no Framer Motion
- Needs complete animation overhaul

### Tasks

| Task | Status |
|------|--------|
| Add motion imports | [ ] |
| Staggered page entrance | [ ] |
| Image gallery transitions | [ ] |
| Quantity selector feedback | [ ] |
| Add to cart button animation | [ ] |
| Accordion smooth animation | [ ] |
| Related products scroll reveal | [ ] |

### Code: Image Gallery Transition

```typescript
<motion.div
  key={selectedImage}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  <Image src={selectedImage} ... />
</motion.div>
```

### Code: Accordion

```typescript
<motion.div
  initial={false}
  animate={{ height: isOpen ? 'auto' : 0 }}
  transition={{ duration: 0.3 }}
  className="overflow-hidden"
>
  {content}
</motion.div>
```

### Verification

```bash
# Open http://localhost:3000/product/TD-001
# Check:
- [ ] Page elements animate in sequence
- [ ] Image gallery transitions smoothly
- [ ] +/- buttons have feedback
- [ ] Add to cart button scales
- [ ] Accordion opens smoothly
- [ ] Related products reveal on scroll
```

### Sign-Off
- [ ] Code complete
- [ ] Visual verified
- [ ] Mobile verified
- [ ] RTL verified

---

## PAGE 5: CART

**File**: `/app/cart/page.tsx`
**Time**: ~2 hours
**Priority**: HIGH (conversion critical)

### Current Issues
- No Framer Motion
- Static cart items
- No remove animation

### Tasks

| Task | Status |
|------|--------|
| Add motion imports + AnimatePresence | [ ] |
| Cart items staggered entrance | [ ] |
| Remove item fade out | [ ] |
| Quantity control feedback | [ ] |
| Coupon success/error animation | [ ] |
| Checkout button animation | [ ] |

### Code: Cart Item with AnimatePresence

```typescript
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {items.map(item => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cart item content */}
    </motion.div>
  ))}
</AnimatePresence>
```

### Code: Coupon Error Shake

```typescript
const [shake, setShake] = useState(false);

<motion.input
  animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
  transition={{ duration: 0.4 }}
/>

// On invalid coupon:
setShake(true);
setTimeout(() => setShake(false), 500);
```

### Verification

```bash
# Add items to cart, open http://localhost:3000/cart
# Check:
- [ ] Items animate in on load
- [ ] Remove animates out smoothly
- [ ] +/- buttons have feedback
- [ ] Invalid coupon shakes
- [ ] Valid coupon celebrates
- [ ] Checkout button scales
```

### Sign-Off
- [ ] Code complete
- [ ] Visual verified
- [ ] Mobile verified
- [ ] RTL verified

---

## PAGE 6: CHECKOUT

**File**: `/app/checkout/page.tsx`
**Time**: ~3 hours
**Priority**: HIGH (conversion critical)

### Current Issues
- Multi-step form with no animations
- Static progress indicator
- No form feedback

### Tasks

| Task | Status |
|------|--------|
| Step slide transitions | [ ] |
| Progress indicator animation | [ ] |
| Form field focus states | [ ] |
| Delivery option selection bounce | [ ] |
| Payment method selection bounce | [ ] |
| Submit button loading state | [ ] |
| Confirmation celebration | [ ] |

### Code: Step Transitions

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.3 }}
  >
    {renderStep()}
  </motion.div>
</AnimatePresence>
```

### Code: Selection Bounce

```typescript
<motion.div
  whileTap={{ scale: 0.98 }}
  animate={{
    borderColor: selected ? '#478c0b' : '#e5e7eb',
    backgroundColor: selected ? '#f0fdf4' : '#ffffff'
  }}
  transition={{ duration: 0.2 }}
  onClick={() => setSelected(true)}
>
```

### Verification

```bash
# Go through checkout flow
# Check:
- [ ] Steps slide in/out
- [ ] Progress bar animates
- [ ] Form fields highlight on focus
- [ ] Options bounce on selection
- [ ] Submit shows loading spinner
- [ ] Confirmation animates in
```

### Sign-Off
- [ ] Code complete
- [ ] Visual verified
- [ ] Mobile verified
- [ ] RTL verified

---

# REFERENCE

---

## ICON REPLACEMENT

Replace ALL FontAwesome with Lucide:

```bash
# Find FontAwesome usage
grep -r "fa-" --include="*.tsx" ./app/
```

| FontAwesome | Lucide |
|-------------|--------|
| fa-shopping-cart | ShoppingCart |
| fa-heart | Heart |
| fa-star | Star |
| fa-search | Search |
| fa-filter | SlidersHorizontal |
| fa-times | X |
| fa-check | Check |
| fa-plus | Plus |
| fa-minus | Minus |
| fa-trash | Trash2 |
| fa-truck | Truck |
| fa-clock | Clock |
| fa-leaf | Leaf |
| fa-arrow-right | ArrowRight |
| fa-chevron-down | ChevronDown |

**Icon Style**:
```tsx
<ShoppingCart className="w-5 h-5 stroke-[1.5]" />
```

---

## BILINGUAL PATTERN

```typescript
import { useLanguage } from '@/lib/context/LanguageContext';

const { language, isRTL, t } = useLanguage();

// In JSX
<div dir={isRTL ? 'rtl' : 'ltr'}>
  <h1>{language === 'he' ? 'כותרת' : 'Title'}</h1>
  <button>{language === 'he' ? 'הוסף לסל' : 'Add to Cart'}</button>
</div>
```

---

## ANIMATION PATTERNS

### Card Hover (REQUIRED)
```tsx
<motion.div
  whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
  transition={{ duration: 0.2, ease: "easeOut" }}
  className="cursor-pointer"
>
```

### Button (REQUIRED)
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.15 }}
>
```

### Staggered List (REQUIRED for grids)
```tsx
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => <motion.div key={i} variants={item}>{i}</motion.div>)}
</motion.div>
```

### Scroll Reveal (REQUIRED for below-fold)
```tsx
import { useInView } from 'framer-motion'

const ref = useRef(null)
const isInView = useInView(ref, { once: true, margin: "-100px" })

<motion.section
  ref={ref}
  initial={{ opacity: 0, y: 50 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6 }}
>
```

---

## TESTING COMMANDS

```bash
# Start dev server
npm run dev

# Build check
npm run build

# Find FontAwesome
grep -r "fa-" --include="*.tsx" ./app/

# Find pages without Framer Motion
grep -L "framer-motion" ./app/**/page.tsx

# Find hardcoded English
grep -r "Add to Cart" --include="*.tsx" ./app/
```

---

## EMERGENCY ROLLBACK

```bash
git status          # See what changed
git diff            # See exact changes
git checkout -- .   # Rollback everything (careful!)
```

---

## EXECUTION ORDER

1. [ ] Create motion variants file (if not exists)
2. [ ] Marketplace page (highest traffic)
3. [ ] Vendors page (discovery)
4. [ ] Product detail (conversion)
5. [ ] Cart page (conversion)
6. [ ] Checkout page (conversion)
7. [ ] Vendor store (vendor success)
8. [ ] Icon cleanup pass
9. [ ] Bilingual pass
10. [ ] Final QA

---

## CHANGE LOG

| Date | Change |
|------|--------|
| 2025-01-21 | Created plan |
| 2025-01-21 | Fixed vendors data loading |
| 2025-01-21 | Refined plan UX |
| 2025-01-21 | Completed all 6 page animation upgrades |
| 2025-01-21 | Icon cleanup - all FontAwesome replaced with Lucide |
| 2025-01-21 | Bilingual pass - RTL support added to all pages |
| 2025-01-21 | Final QA - build successful, all pages verified |

---

**Status**: ✅ ALL UPGRADES COMPLETE - All 6 pages upgraded to $20k quality with Framer Motion animations, Lucide icons, and RTL Hebrew/English support.
