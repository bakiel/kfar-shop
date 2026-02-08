# Quick Start Guide for Vercel Deployment

## Prerequisites
- Vercel account
- Supabase account (free tier works)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `kfar-shop` (or any name)
   - Database Password: (save this somewhere safe)
   - Region: Choose closest to your users
4. Click "Create Project" and wait for setup

## Step 2: Get Supabase Credentials

Once your project is ready:
1. Go to Settings → API
2. Copy these values:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Set up Database

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. You should see "Success" message

## Step 4: Configure Vercel

1. Go to your [Vercel project](https://vercel.com/bakielisrael-gmailcoms-projects/kfar-shop-clean-repo)
2. Go to Settings → Environment Variables
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=[your-project-url-from-step-2]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key-from-step-2]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key-from-step-2]
NEXT_PUBLIC_API_URL=https://kfar-shop-clean-repo.vercel.app
NODE_ENV=production
```

4. Click "Save" for each variable

## Step 5: Redeploy

1. Go to Deployments tab in Vercel
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

## Step 6: Test Your App

Your app should now be running at: https://kfar-shop-clean-repo.vercel.app

## Optional: Add More Features

To enable voice, email, and AI features, add these environment variables later:

- **Voice**: Get API key from [ElevenLabs](https://elevenlabs.io)
- **Email**: Get API key from [SendGrid](https://sendgrid.com)
- **AI**: Get API key from [OpenRouter](https://openrouter.ai)

## Troubleshooting

If you still see 404:
1. Check all environment variables are correctly set
2. Make sure database migration ran successfully
3. Check Vercel function logs for errors
4. Ensure you redeployed after adding environment variables
