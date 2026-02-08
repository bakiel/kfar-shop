# KFAR Marketplace - Complete Vercel Deployment Guide

## 📋 Prerequisites

Before starting, ensure you have:
- GitHub account with repository access
- Vercel account (free tier works)
- Supabase project with credentials
- API keys for services

## 🚀 Step 1: Prepare GitHub Repository

### Option A: Use Fresh Repository (Recommended)
```bash
# Navigate to fresh repo
cd /Users/mac/Downloads/kfar-final/fresh-repo

# Add remote origin
git remote add origin https://github.com/bakiel/kfar-shop.git

# Push to GitHub
git push -u origin main --force
```

### Option B: Use Existing Repository
```bash
# If using existing repo with issues
git push origin main --force-with-lease
```

## 🔧 Step 2: Vercel Project Setup

### 2.1 Create New Vercel Project

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click "Add New Project"

2. **Import Git Repository**
   - Select "Import Git Repository"
   - Choose: `bakiel/kfar-shop`
   - Click "Import"

3. **Configure Project**
   ```
   Project Name: kfar-marketplace
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

### 2.2 Environment Variables Configuration

Add ALL of these environment variables in Vercel Dashboard:

#### Essential Variables (REQUIRED)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vupkqtyhhdvqzbxgyyqv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your Anon Key]
SUPABASE_SERVICE_ROLE_KEY=[Your Service Role Key]

# AI Translation Services
OPENROUTER_API_KEY=[Your OpenRouter API Key]
DEEPSEEK_API_KEY=[Your DeepSeek API Key]

# WhatsApp Business API
WHATSAPP_API_TOKEN=[Your WhatsApp Token]
WHATSAPP_PHONE_NUMBER_ID=[Your Phone Number ID]
```

#### Optional Services
```env
# Text-to-Speech (Optional)
ELEVENLABS_API_KEY=[Your ElevenLabs API Key]

# Email Service (Optional)
SENDGRID_API_KEY=[Your SendGrid API Key]
SENDGRID_FROM_EMAIL=noreply@kfar-marketplace.com

# Analytics (Optional)
VERCEL_ANALYTICS_ID=[Auto-generated]
```

### 2.3 Vercel CLI Setup (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENROUTER_API_KEY
# Add each variable when prompted
```

## 🗄️ Step 3: Supabase Configuration

### 3.1 Get Supabase Credentials

1. **Login to Supabase**
   - Visit: https://app.supabase.com
   - Select your project

2. **Get API Keys**
   - Go to: Settings → API
   - Copy:
     - Project URL
     - Anon/Public Key
     - Service Role Key (keep secret!)

### 3.2 Database Tables Setup

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL,
  business_name_he VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  whatsapp_number VARCHAR(20),
  address JSONB,
  business_type VARCHAR(100),
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  name_he VARCHAR(255),
  description TEXT,
  description_he TEXT,
  price DECIMAL(10,2) NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  category VARCHAR(100),
  slug VARCHAR(255) UNIQUE NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID,
  vendor_id UUID REFERENCES vendors(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ILS',
  status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  preferred_language VARCHAR(2) DEFAULT 'he',
  address JSONB,
  loyalty_points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view active vendors" ON vendors
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Create indexes for performance
CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_vendor ON orders(vendor_id);
```

### 3.3 Import Initial Data

```sql
-- Import vendors (run this after tables are created)
-- Use the scripts/migrate-products-to-supabase.js script
-- Or manually insert vendors and products
```

## 🌐 Step 4: Deploy to Vercel

### 4.1 Initial Deployment

1. **Via Dashboard**
   - Click "Deploy" in Vercel Dashboard
   - Wait for build to complete (3-5 minutes)

2. **Via CLI**
   ```bash
   vercel --prod
   ```

### 4.2 Verify Deployment

1. **Check Build Logs**
   - Look for any errors
   - Verify all environment variables loaded

2. **Test Live Site**
   - Visit: https://kfar-marketplace.vercel.app
   - Check:
     - [ ] Homepage loads
     - [ ] Products display
     - [ ] Language toggle works
     - [ ] Vendor pages load
     - [ ] Checkout process

## 🔄 Step 5: Continuous Deployment

### 5.1 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update: Description"
git push origin main

# Vercel auto-deploys within minutes
```

### 5.2 Preview Deployments

Create pull requests for preview deployments:

```bash
git checkout -b feature/new-feature
git push origin feature/new-feature
# Create PR on GitHub
# Vercel creates preview deployment
```

## 🛠️ Step 6: Post-Deployment Configuration

### 6.1 Custom Domain (Optional)

1. **Add Domain in Vercel**
   - Go to: Project Settings → Domains
   - Add: `marketplace.villageofpeace.org`
   - Follow DNS configuration

2. **Configure DNS**
   ```
   Type: CNAME
   Name: marketplace
   Value: cname.vercel-dns.com
   ```

### 6.2 Analytics Setup

1. **Enable Vercel Analytics**
   - Go to: Project Settings → Analytics
   - Enable Web Analytics
   - Enable Speed Insights

### 6.3 Monitoring

1. **Set Up Alerts**
   - Configure error alerts
   - Set up performance monitoring
   - Enable uptime monitoring

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Build Fails
```bash
# Check package.json for issues
npm run build --verbose

# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

#### Environment Variables Not Loading
- Ensure no spaces in values
- Check for special characters
- Redeploy after adding variables

#### Supabase Connection Issues
- Verify URL format (https://)
- Check API keys are correct
- Ensure RLS policies are set

#### 500 Errors in Production
- Check Vercel function logs
- Verify all API routes work
- Check environment variables

## 📊 Monitoring Dashboard

### Key Metrics to Track

1. **Performance**
   - Page load time < 3s
   - Time to Interactive < 5s
   - Core Web Vitals

2. **Errors**
   - Monitor 500 errors
   - Check failed API calls
   - Review function timeouts

3. **Usage**
   - Daily active users
   - API request count
   - Bandwidth usage

## 🔐 Security Checklist

- [ ] Environment variables set correctly
- [ ] Service role key not exposed
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] SSL certificate active
- [ ] Security headers configured

## 📱 Mobile Testing

Test on various devices:
- [ ] iPhone Safari
- [ ] Android Chrome
- [ ] iPad Safari
- [ ] Desktop Chrome/Firefox/Safari

## 🎉 Launch Checklist

Before going live:
- [ ] All environment variables configured
- [ ] Database populated with products
- [ ] Payment gateway tested
- [ ] WhatsApp notifications working
- [ ] Translation system verified
- [ ] Mobile responsiveness confirmed
- [ ] Load testing completed
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation updated

## 📞 Support

For deployment issues:
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- GitHub Issues: https://github.com/bakiel/kfar-shop/issues

## 🚀 Quick Deploy Script

Save this as `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying KFAR Marketplace to Vercel"

# Build locally first to catch errors
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    
    echo "✅ Deployment complete!"
    echo "🔗 Visit: https://kfar-marketplace.vercel.app"
else
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
fi
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Success! 🎊

Your KFAR Marketplace should now be live at:
- Production: https://kfar-marketplace.vercel.app
- Preview: https://kfar-marketplace-git-main.vercel.app

Remember to:
1. Test all features thoroughly
2. Monitor the first 24 hours closely
3. Gather user feedback
4. Keep documentation updated