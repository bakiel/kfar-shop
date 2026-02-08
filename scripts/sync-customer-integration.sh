#!/bin/bash

# 🔄 KFAR Shop - Customer Integration Sync Script
# This script syncs the customer integration files from GitHub

set -e  # Exit on error

echo "🔄 KFAR Shop Customer Integration Sync"
echo "====================================="

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Navigate to project root
cd "$PROJECT_ROOT"

# Define the files we need to sync
echo "📋 Customer integration files to sync:"
echo "   - components/layout/CustomerQuickAccess.tsx"
echo "   - services/customerAuth.ts"
echo "   - app/customer/join/page.tsx"
echo "   - docs/CUSTOMER_IMPLEMENTATION_GUIDE.md"

# Create directories if they don't exist
echo "📁 Creating necessary directories..."
mkdir -p components/layout
mkdir -p services
mkdir -p app/customer/join
mkdir -p docs

# Download files from GitHub using raw content URLs
echo "⬇️  Downloading customer integration files..."

# CustomerQuickAccess component
curl -s -o components/layout/CustomerQuickAccess.tsx \
  https://raw.githubusercontent.com/bakiel/kfar-shop/main/components/layout/CustomerQuickAccess.tsx

# Customer Auth Service
curl -s -o services/customerAuth.ts \
  https://raw.githubusercontent.com/bakiel/kfar-shop/main/services/customerAuth.ts

# Customer Join Page
curl -s -o app/customer/join/page.tsx \
  https://raw.githubusercontent.com/bakiel/kfar-shop/main/app/customer/join/page.tsx

# Implementation Guide
curl -s -o docs/CUSTOMER_IMPLEMENTATION_GUIDE.md \
  https://raw.githubusercontent.com/bakiel/kfar-shop/main/docs/CUSTOMER_IMPLEMENTATION_GUIDE.md

echo "✅ Customer integration files synced!"

# Check if files were downloaded successfully
echo ""
echo "🔍 Verifying downloaded files..."
for file in "components/layout/CustomerQuickAccess.tsx" "services/customerAuth.ts" "app/customer/join/page.tsx"; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        echo "   ✅ $file - OK"
    else
        echo "   ❌ $file - FAILED"
    fi
done

echo ""
echo "📝 Next steps:"
echo "   1. Review the synced files"
echo "   2. Update any import paths if needed"
echo "   3. Run 'npm run build' to test locally"
echo "   4. Deploy using './scripts/universal-deploy.sh'"
