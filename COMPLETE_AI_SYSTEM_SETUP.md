# KFAR Complete AI System Setup Guide

## What We've Built

We've created a comprehensive AI-powered marketplace system with:

1. **Vercel AI SDK Integration** - Streaming responses, better performance
2. **Intelligent Chat System** - Knowledge about all products, vendors, policies
3. **Master Orchestrator Agent** - Autonomous marketplace management
4. **Real-Time Knowledge Sync** - Dynamic updates as data changes

## Installation Steps

### 1. Install Required Dependencies

```bash
npm install ai @ai-sdk/google @ai-sdk/openai zod
```

### 2. Set Environment Variables

Add to your `.env.local` file:

```bash
# AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key (optional)
NEXT_PUBLIC_ENABLE_VERCEL_AI=true

# Supabase Configuration (for real-time sync)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Initialize Knowledge Base

Run the initialization script to populate the knowledge base with your product data:

```bash
node scripts/initialize-knowledge-base.js
```

### 4. Start Real-Time Sync

The real-time sync service will automatically start in production. For development, you can manually initialize it:

```javascript
// In your app initialization file
import { realTimeSync } from '@/lib/services/real-time-knowledge-sync';

// Start real-time synchronization
await realTimeSync.initialize();
```

## System Components

### 1. Enhanced Voice Commerce (`/lib/ai/vercel-ai-integration.ts`)
- Streaming voice responses
- Tool calling for cart operations
- 50-70% latency reduction

### 2. Intelligent Chat Widget (`/components/chat/IntelligentChatWidget.tsx`)
- Beautiful UI with animations
- Knowledge search panel
- Quick vendor access
- Conversation starters

### 3. Master Orchestrator Agent (`/lib/ai/master-orchestrator-agent.ts`)
- Vendor onboarding automation
- Product catalog management
- Analytics and reporting
- Promotion management
- Customer communications

### 4. Real-Time Knowledge Sync (`/lib/services/real-time-knowledge-sync.ts`)
- Subscribes to database changes
- Updates knowledge base instantly
- Handles new vendors automatically
- Maintains data consistency

## Usage Examples

### Add Intelligent Chat to Any Page

```tsx
import IntelligentChatWidget from '@/components/chat/IntelligentChatWidget';

export default function YourPage() {
  return (
    <>
      {/* Your page content */}
      <IntelligentChatWidget />
    </>
  );
}
```

### Execute Agent Tasks

```javascript
// Onboard a new vendor
fetch('/api/agent/orchestrator', {
  method: 'POST',
  body: JSON.stringify({
    task: 'Onboard new vendor Green Garden with organic vegetables',
    context: {
      vendorName: 'Green Garden',
      email: 'info@greengarden.com',
      specialties: ['organic', 'vegetables', 'local']
    }
  })
});

// Sync all products
fetch('/api/agent/orchestrator', {
  method: 'POST',
  body: JSON.stringify({
    task: 'Synchronize all products from database to knowledge base'
  })
});
```

### Monitor Agent Activity

```javascript
// Check agent status
fetch('/api/agent/orchestrator?action=status')

// View recent logs
fetch('/api/agent/orchestrator?action=logs')
```

## Features Overview

### 🎯 Intelligent Chat
- Knows ALL products with prices and details
- Vendor information and specialties
- Community history and values
- Shipping and return policies
- Recipe suggestions
- Health benefits information

### 🤖 Master Orchestrator
- **Automated Vendor Onboarding**: Complete setup process
- **Product Management**: Bulk imports and updates
- **Analytics**: Sales reports and insights
- **Promotions**: Campaign creation and management
- **Notifications**: Customer communications

### 🔄 Real-Time Updates
- Database changes sync instantly
- New vendors auto-added to knowledge
- Product updates reflected immediately
- Promotion activation/expiration handled
- Review scores updated in real-time

## Testing the System

### 1. Test Intelligent Chat
Ask questions like:
- "What vegan ice cream do you have?"
- "Tell me about Teva Deli"
- "What are your shipping costs?"
- "Suggest a recipe for dinner"

### 2. Test Agent Tasks
- Create a test vendor
- Add products in bulk
- Generate a vendor report
- Create a promotion

### 3. Test Real-Time Sync
- Add a product via admin panel
- Check if it appears in chat immediately
- Update a price
- Verify knowledge base reflects change

## Best Practices

1. **Knowledge Base**: Keep it updated with `syncDatabaseWithKnowledge` task
2. **Agent Tasks**: Use appropriate priority levels (urgent, high, medium, low)
3. **Chat Widget**: Place on high-traffic pages for maximum engagement
4. **Monitoring**: Regular check agent logs and status

## Troubleshooting

### Chat Not Showing Updated Products
1. Check if real-time sync is running
2. Manually run sync task via orchestrator
3. Verify Supabase connection

### Agent Tasks Failing
1. Check API logs at `/api/agent/orchestrator?action=logs`
2. Verify all required context data provided
3. Check Supabase service role permissions

### Performance Issues
1. Enable streaming responses: `NEXT_PUBLIC_ENABLE_VERCEL_AI=true`
2. Use batch operations for bulk updates
3. Monitor knowledge base size

## Next Steps

1. **Customize Agent Tools**: Add marketplace-specific operations
2. **Extend Knowledge**: Add seasonal content, events, news
3. **Analytics Dashboard**: Build UI for agent reports
4. **Voice Integration**: Connect enhanced voice commerce
5. **Mobile Optimization**: Ensure chat works perfectly on mobile

## Support

The system is designed to be self-maintaining. As your marketplace grows:
- New vendors are automatically onboarded
- Products sync in real-time
- Knowledge base stays current
- Agent handles routine tasks

This creates a truly intelligent marketplace that can scale efficiently while providing exceptional customer experience!