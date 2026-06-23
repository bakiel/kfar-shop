# KFAR Marketplace - Database Migration Guide

## Migration Status: COMPLETE ✅

**Migration Date:** December 31, 2025
**From:** Supabase (pesxvleblcdwgojrxjmo.supabase.co)
**To:** Hostinger VPS PostgreSQL (72.61.201.237)

## Database Connection Details

### VPS PostgreSQL
```
Host: 72.61.201.237
Port: 5432
Database: kfar_marketplace
User: kfar
Password: <password>
```

### Connection String
```
postgresql://kfar:<password>@<vps-host>:5432/kfar_marketplace
```

### For Vercel Environment Variables
```env
DATABASE_URL=postgresql://kfar:<password>@<vps-host>:5432/kfar_marketplace
POSTGRES_HOST=72.61.201.237
POSTGRES_PORT=5432
POSTGRES_DB=kfar_marketplace
POSTGRES_USER=kfar
POSTGRES_PASSWORD=<password>
```

## Data Migrated

| Table | Records | Status |
|-------|---------|--------|
| vendors | 12 | ✅ Migrated |
| products | 129 | ✅ Migrated |
| customers | 3 | ✅ Migrated |
| orders | 4 | ✅ Migrated |
| product_reviews | 0 | ✅ Schema ready |
| customer_registrations | 0 | ✅ Schema ready |
| vendor_registrations | 0 | ✅ Schema ready |
| invoices | 0 | ✅ Schema ready |

## App Updates Required

### Step 1: Install PostgreSQL client
```bash
npm install pg
npm install @types/pg --save-dev
```

### Step 2: Update lib/db/client.ts (NEW FILE)
Replace Supabase client with direct PostgreSQL connection.

### Step 3: Update Environment Variables
Add the new database connection variables to:
- `.env.local` (local development)
- Vercel Environment Variables (production)

### Step 4: Update API Routes
Files that need updating (use new `db` client instead of `supabase`):
- `app/api/supabase/*` → rename to `app/api/db/*`
- `lib/services/onboarding-service.ts`
- `services/customerAuth.ts`
- `app/api/invoices/*`
- `app/api/orders/*`
- `app/api/vendors/*`
- `app/api/reviews/*`
- `app/api/customers/*`

### Step 5: Auth Migration
Replace Supabase Auth with JWT-based auth:
- Passwords already hashed with bcrypt
- Implement JWT token generation/validation
- Update login/signup endpoints

## Testing Commands

### Test Connection
```bash
PGPASSWORD='<password>' psql -h <vps-host> -U kfar -d kfar_marketplace -c "SELECT COUNT(*) FROM vendors"
```

### SSH Access
```bash
ssh root@72.61.201.237
sudo -u postgres psql kfar_marketplace
```

## Backup Commands

### Export from VPS
```bash
ssh root@72.61.201.237 'pg_dump -U postgres kfar_marketplace > /tmp/kfar_backup.sql'
scp root@72.61.201.237:/tmp/kfar_backup.sql ./backups/
```

### Restore to VPS
```bash
scp ./backup.sql root@72.61.201.237:/tmp/
ssh root@72.61.201.237 'psql -U postgres kfar_marketplace < /tmp/backup.sql'
```

## Old Supabase Details (for reference)
```
URL: https://pesxvleblcdwgojrxjmo.supabase.co
Project Ref: pesxvleblcdwgojrxjmo
```

## Security Notes
1. PostgreSQL is accessible from any IP (0.0.0.0/0)
2. Change password after migration is stable
3. Consider restricting to Vercel IP ranges later
4. SSL not enabled yet (add for production)

## Next Steps
1. [ ] Create new db client (`lib/db/client.ts`)
2. [ ] Update Vercel environment variables
3. [ ] Migrate authentication to JWT
4. [ ] Test all API endpoints
5. [ ] Deprecate Supabase client
6. [ ] Enable SSL on PostgreSQL
