#!/bin/bash

# 🚀 KFAR Shop - Universal Deployment Script
# This script handles deployment to the correct Vercel project with customer integration

set -e  # Exit on error

echo "🎯 KFAR Shop Universal Deployment"
echo "================================="

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Navigate to project root
cd "$PROJECT_ROOT"

# Step 1: Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
if [ -d ".git" ]; then
    git pull origin main || echo "⚠️  Could not pull from GitHub, continuing..."
else
    echo "⚠️  Not a git repository, skipping pull"
fi

# Step 2: Ensure dependencies are installed
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Step 3: Build the project locally first to catch errors
echo "🔨 Building project locally..."
npm run build

# Step 4: Check which Vercel project to deploy to
echo "🔍 Checking Vercel project configuration..."

# Check if we're linked to a Vercel project
if [ -f ".vercel/project.json" ]; then
    PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId":"[^"]*' | grep -o '[^"]*$')
    echo "📌 Found linked project: $PROJECT_ID"
else
    echo "❌ No Vercel project linked. Please run 'vercel link' first."
    exit 1
fi

# Step 5: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "⏳ This may take a few minutes..."

# Deploy with production flag
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo "📊 Check deployment status at: https://vercel.com"
echo ""
echo "🔍 Troubleshooting tips:"
echo "   - If deployment fails, check the Vercel dashboard for detailed logs"
echo "   - Ensure all environment variables are set in Vercel"
echo "   - Run 'vercel env pull' to sync environment variables"
