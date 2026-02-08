# KFAR Master Orchestrator Agent - Complete Guide

## Overview

The Master Orchestrator Agent is an AI-powered system that manages your entire marketplace ecosystem. It keeps the knowledge base synchronized, handles vendor onboarding, manages products, and performs various marketplace tasks autonomously.

## Key Features

### 1. **Dynamic Knowledge Updates**
- Real-time synchronization between database and knowledge base
- Automatic updates when products, vendors, or promotions change
- Handles new store onboarding seamlessly
- Maintains data consistency across all systems

### 2. **Agent Capabilities**
- **Knowledge Management**: Update and sync knowledge base
- **Vendor Onboarding**: Complete vendor setup process
- **Product Management**: Bulk imports, updates, inventory
- **Analytics**: Generate reports and insights
- **Promotions**: Create and manage campaigns
- **Communications**: Send notifications to customers
- **Order Processing**: Handle new orders and inventory

### 3. **Real-Time Sync Service**
- Subscribes to database changes via Supabase
- Updates knowledge base instantly
- Tracks products, vendors, promotions, reviews, orders
- Maintains historical data and audit trails

## Architecture

### Master Orchestrator Agent (`lib/ai/master-orchestrator-agent.ts`)
```typescript
// Core agent with all tools
export const orchestratorTools = {
  updateKnowledgeBase,     // Update knowledge documents
  onboardNewVendor,        // Complete vendor setup
  addBulkProducts,         // Import product catalogs
  syncDatabaseWithKnowledge, // Sync all data
  generateVendorReport,    // Analytics and insights
  createPromotion,         // Marketing campaigns
  sendBulkNotification,    // Customer communications
};
```

### Real-Time Knowledge Sync (`lib/services/real-time-knowledge-sync.ts`)
```typescript
// Automatic synchronization
- Subscribes to database tables
- Handles INSERT, UPDATE, DELETE events
- Updates knowledge base in real-time
- Maintains data integrity
```

### API Endpoints (`app/api/agent/orchestrator/route.ts`)
```typescript
POST /api/agent/orchestrator    // Execute agent tasks
GET  /api/agent/orchestrator    // Get status and capabilities
PATCH /api/agent/orchestrator   // Update configuration
```

## Usage Examples

### 1. Onboard a New Vendor
```javascript
// POST /api/agent/orchestrator
{
  "task": "Onboard a new vendor called 'Organic Harvest' selling fresh produce",
  "context": {
    "vendorName": "Organic Harvest",
    "description": "Fresh organic fruits and vegetables",
    "contactEmail": "info@organicharvest.com",
    "contactPhone": "+972-XX-XXXXXXX",
    "specialties": ["organic", "fresh produce", "seasonal"],
    "certifications": ["Organic Israel", "Fair Trade"]
  }
}
```

### 2. Sync All Products
```javascript
// POST /api/agent/orchestrator
{
  "task": "Synchronize all products from database to knowledge base",
  "priority": "high"
}
```

### 3. Generate Vendor Report
```javascript
// POST /api/agent/orchestrator
{
  "task": "Generate weekly sales report for Teva Deli",
  "context": {
    "vendorId": "teva-deli",
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-07"
    }
  }
}
```

### 4. Create Promotion
```javascript
// POST /api/agent/orchestrator
{
  "task": "Create a 20% discount promotion for Gahn Delight ice cream",
  "context": {
    "name": "Summer Ice Cream Sale",
    "type": "discount",
    "vendorId": "gahn-delight",
    "discountPercent": 20,
    "startDate": "2024-07-01",
    "endDate": "2024-07-31"
  }
}
```

## Real-Time Events

### Database Change Events
When any database change occurs, the system automatically:
1. Detects the change via Supabase real-time subscriptions
2. Updates the knowledge base immediately
3. Notifies the orchestrator agent
4. Executes any necessary follow-up tasks

### Supported Tables
- **products**: New products, price changes, stock updates
- **vendors**: New vendors, profile updates, status changes
- **promotions**: New campaigns, activations, expirations
- **reviews**: New reviews update product ratings
- **orders**: Sales tracking and inventory updates

## Installation

### 1. Environment Variables
```bash
# Add to .env.local
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
```

### 2. Install Dependencies
```bash
npm install ai @ai-sdk/google @supabase/supabase-js zod
```

### 3. Initialize Services
```javascript
// In your app initialization
import { realTimeSync } from '@/lib/services/real-time-knowledge-sync';
import { masterOrchestrator } from '@/lib/ai/master-orchestrator-agent';

// Start real-time sync
await realTimeSync.initialize();

// Agent is ready to receive tasks
```

### 4. Set Up Webhooks (Optional)
Configure your external services to send webhooks to:
```
POST https://your-domain.com/api/agent/orchestrator
```

## Scheduled Tasks

The orchestrator can run scheduled tasks:

```javascript
// Example scheduled tasks
{
  "Sync Database": "Every 6 hours",
  "Vendor Reports": "Weekly on Mondays",
  "Promotion Check": "Daily at midnight",
  "Inventory Alerts": "Every hour"
}
```

## Monitoring and Logs

### Check Agent Status
```bash
GET /api/agent/orchestrator?action=status
```

### View Recent Activity
```bash
GET /api/agent/orchestrator?action=logs
```

### Task Templates
```bash
GET /api/agent/orchestrator?action=tasks
```

## Best Practices

1. **Priority Levels**: Use appropriate priority for tasks
   - `urgent`: Immediate execution
   - `high`: Process quickly
   - `medium`: Normal queue
   - `low`: Background tasks

2. **Context Data**: Always provide complete context for complex tasks

3. **Error Handling**: The agent will retry failed tasks automatically

4. **Performance**: Batch operations when possible (e.g., bulk product imports)

5. **Monitoring**: Regular check agent status and logs

## Security Considerations

- Service role key required for database operations
- Agent validates all inputs before execution
- Audit trail maintained for all operations
- Sensitive data (bank details, etc.) encrypted

## Extending the Agent

### Add New Tools
```typescript
export const customTool = tool({
  description: 'Your custom tool description',
  parameters: z.object({
    // Define parameters
  }),
  execute: async (params) => {
    // Implementation
  }
});
```

### Custom Event Handlers
```typescript
// Add to handleDatabaseChange method
case 'custom_table':
  await this.handleCustomTableChange(eventType, data);
  break;
```

## Troubleshooting

### Knowledge Base Not Updating
1. Check Supabase real-time subscriptions
2. Verify service role key permissions
3. Check agent logs for errors

### Agent Tasks Failing
1. Verify task format and required context
2. Check database connectivity
3. Review error logs

### Performance Issues
1. Enable batching for bulk operations
2. Adjust sync frequency if needed
3. Monitor resource usage

## Conclusion

The Master Orchestrator Agent transforms your marketplace into an intelligent, self-managing system. It ensures data consistency, automates routine tasks, and provides powerful capabilities for scaling your business.

With real-time synchronization and AI-powered decision making, your marketplace stays current and responsive to changes automatically!