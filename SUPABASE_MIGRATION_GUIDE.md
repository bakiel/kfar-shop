# KFAR Marketplace - Supabase Migration Guide

## Overview
This guide documents the migration from PostgreSQL to Supabase for the KFAR Marketplace.

## Migration Status ✅
- [x] Installed Supabase dependencies
- [x] Created Supabase client configuration
- [x] Created new `supabase-database.ts` module
- [x] Updated all imports to use Supabase implementation
- [x] Removed hardcoded credentials from migration script
- [x] Created database migration schema

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project credentials

### 2. Configure Environment Variables
Add these to your `.env.local` file:
```env
# Enable database usage
USE_DATABASE=true

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Direct database connection (optional)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 3. Run Database Migration
Execute the migration SQL in your Supabase dashboard:
1. Go to SQL Editor in Supabase dashboard
2. Copy contents of `/supabase/migrations/001_initial_schema.sql`
3. Run the migration

### 4. Migrate Existing Data
If you have existing registration data:
```bash
node scripts/migrate-registrations.js
```

## Architecture Changes

### Old System (PostgreSQL)
- Direct PostgreSQL connection using `pg` library
- Raw SQL queries in `/lib/db/database.ts`
- No built-in authentication or RLS

### New System (Supabase)
- Supabase client with built-in auth
- Row Level Security (RLS) enabled
- Real-time subscriptions available
- Built-in file storage capabilities

## Key Files Changed

1. **Database Service**
   - OLD: `/lib/db/database.ts` (PostgreSQL)
   - NEW: `/lib/db/supabase-database.ts` (Supabase)

2. **Supabase Configuration**
   - `/lib/supabase/client.ts` - Client-side configuration
   - `/lib/supabase/server.ts` - Server-side configuration

3. **Updated Imports**
   - `/lib/services/data-adapter.ts`
   - All API routes in `/app/api/`

## Security Improvements

### Environment Variables
- All sensitive credentials moved to environment variables
- No hardcoded API keys or database credentials
- Service role key only used server-side

### Row Level Security (RLS)
- Public can only view active vendors and published products
- Vendors can only access their own analytics
- Service role has full access for admin operations

### API Security
- Authentication middleware ready (`/lib/middleware/auth.ts`)
- Rate limiting middleware ready (`/lib/middleware/rate-limit.ts`)
- Input validation with Zod schemas

## Testing the Migration

1. **Test Database Connection**
   ```typescript
   import { initializeDatabase } from '@/lib/db/supabase-database';
   await initializeDatabase();
   ```

2. **Test Data Operations**
   ```typescript
   import { vendorDb, productDb } from '@/lib/db/supabase-database';
   
   // Get all vendors
   const vendors = await vendorDb.getAll();
   
   // Get products
   const products = await productDb.getAll();
   ```

## Rollback Plan
If you need to rollback to PostgreSQL:
1. Set `USE_DATABASE=false` in `.env.local`
2. The data adapter will automatically use JSON files
3. No code changes needed

## Next Steps
1. Set up Supabase Auth for vendor authentication
2. Configure real-time subscriptions for live updates
3. Set up Supabase Storage for image uploads
4. Implement proper RLS policies based on auth

## Troubleshooting

### Common Issues
1. **Missing environment variables**
   - Ensure all Supabase env vars are set
   - Check `.env.example` for required variables

2. **RLS blocking queries**
   - Use service role key for admin operations
   - Check RLS policies in Supabase dashboard

3. **Migration script fails**
   - Ensure `dotenv` is installed
   - Check Supabase credentials are correct

### Support
For issues, check:
- Supabase documentation: https://supabase.com/docs
- Project logs in Supabase dashboard
- API logs in `/lib/db/supabase-database.ts`