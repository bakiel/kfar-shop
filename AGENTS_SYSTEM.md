# KFAR Marketplace Agents System ✅

## Overview
Inspired by the iSPEAK project structure, we've created a comprehensive agent system for KFAR marketplace that provides automated assistance for vendors and customers.

## What's Been Built

### 1. Marketplace Agents (`/lib/agents/marketplace-agents.ts`)
Six specialized AI agents for different marketplace needs:

#### Vendor Support Agent 🏪
- **Purpose**: Helps vendors manage their stores
- **Features**:
  - Onboarding assistance
  - Product management help
  - Invoice generation support
  - Sales analytics guidance
  - Order management

#### Customer Service Bot 🎧
- **Purpose**: Assists customers with orders and inquiries
- **Features**:
  - Order status tracking
  - Payment assistance
  - Product information
  - Delivery updates
  - Return/refund guidance

#### Order Tracking Assistant 🚚
- **Purpose**: Real-time order tracking
- **Features**:
  - Order status updates
  - Delivery estimates
  - Vendor communication
  - WhatsApp notifications
  - QR code tracking

#### Product Recommendation Agent ✨
- **Purpose**: Personalized product suggestions
- **Features**:
  - VOP compliance checking
  - Dietary filtering (vegan, kosher)
  - Price comparison
  - Similar products
  - Community favorites

#### Payment Assistant 💰
- **Purpose**: Payment guidance
- **Features**:
  - Braysheet token help
  - Payment method selection
  - Currency conversion
  - Invoice downloads
  - Troubleshooting

#### Community Coordinator 👥
- **Purpose**: VOP community connection
- **Features**:
  - Group order coordination
  - Community announcements
  - Event notifications
  - Vendor spotlights
  - Special offers

### 2. Agent Chat Interface (`/components/agents/AgentChat.tsx`)
Interactive chat component with:
- **Floating chat button**: Bottom-right corner
- **Agent switching**: Change agents on the fly
- **Quick actions**: Pre-defined action buttons
- **Bilingual support**: Hebrew/English
- **Smart responses**: Context-aware replies
- **Action handlers**: Redirects, forms, WhatsApp

### 3. Help Center (`/components/support/HelpCenter.tsx`)
Comprehensive FAQ system with:
- **Categorized FAQs**: Vendor, Customer, Payment, Community
- **Search functionality**: Find answers quickly
- **Bilingual content**: Hebrew/English
- **Helpful voting**: Track useful answers
- **Expandable items**: Clean UI
- **Contact options**: WhatsApp, Email support

## How to Use

### Adding Agent Chat to Any Page:
```tsx
import AgentChat from '@/components/agents/AgentChat';

// In your page component
<AgentChat 
  defaultAgent="customer-service"
  language="en"
/>
```

### Adding Help Center:
```tsx
import HelpCenter from '@/components/support/HelpCenter';

// In your page
<HelpCenter />
```

### Using Agent Actions:
```typescript
import { AgentActionHandler } from '@/lib/agents/marketplace-agents';

// Process vendor support action
const result = await AgentActionHandler.processVendorSupport('generate_invoice', data);

// Process customer service action
const result = await AgentActionHandler.processCustomerService('track_order', { orderId: 'KFAR-123' });
```

## Agent Capabilities

### Vendor Support:
- Generate invoices → Redirects to `/vendor/pos`
- View analytics → Redirects to `/vendor/dashboard`
- Add products → Redirects to `/vendor/onboarding`
- Manage orders → Redirects to `/vendor/orders`

### Customer Service:
- Track orders → Shows tracking modal
- Contact vendor → Opens WhatsApp
- Report issues → Shows support form
- Find products → Triggers search

### Smart Responses:
Agents respond to keywords intelligently:
- "invoice" → Invoice generation help
- "order" → Order tracking assistance
- "delivery" → Delivery information
- "payment" → Payment guidance
- "vegan" → VOP certified products

## FAQ Categories

### For Vendors:
- How to start selling
- Invoice generation
- Commission rates
- Product management

### For Customers:
- Braysheet tokens
- Order tracking
- Delivery options
- Returns

### Payments:
- Accepted methods
- Refund process
- Currency support

### VOP Community:
- VOP certification
- Group orders
- Community benefits

## Integration Points

### With Existing Systems:
- **Checkout**: Add chat for payment help
- **Vendor Dashboard**: Agent for vendor support
- **Product Pages**: Recommendation agent
- **Order Confirmation**: Tracking assistant

### WhatsApp Integration:
Agents can trigger WhatsApp messages for:
- Vendor contact
- Support tickets
- Order updates

### QR Code Integration:
- Order tracking via QR
- Payment QR codes
- Product information

## Testing the Agents

1. **Test Chat Interface**:
   - Click floating chat button
   - Try different agents
   - Test quick actions
   - Switch languages

2. **Test Help Center**:
   - Search for topics
   - Filter by category
   - Vote on helpful answers
   - Test contact options

3. **Test Agent Actions**:
   - Vendor: "How do I generate an invoice?"
   - Customer: "Track order KFAR-12345"
   - Product: "Show me vegan products"
   - Payment: "How to use Braysheet?"

## Benefits

### For Vendors:
- 24/7 support availability
- Quick answers to common questions
- Automated invoice help
- Sales guidance

### For Customers:
- Instant order tracking
- Payment assistance
- Product recommendations
- Community connection

### For Platform:
- Reduced support load
- Consistent responses
- Scalable assistance
- Community engagement

## Future Enhancements
- AI-powered responses (GPT integration)
- Voice chat support
- Video tutorials
- Multi-language support (Arabic, Russian)
- Analytics dashboard
- Machine learning for better recommendations

## Files Created
1. `/lib/agents/marketplace-agents.ts` - Agent definitions and handlers
2. `/components/agents/AgentChat.tsx` - Chat interface component
3. `/components/support/HelpCenter.tsx` - FAQ and help system

## Summary
The agent system provides automated, intelligent assistance throughout the KFAR marketplace, helping both vendors and customers with common tasks while reducing support workload and improving user experience.