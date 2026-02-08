#!/bin/bash

echo "🔍 KFar Shop Deployment Status Check"
echo "===================================="
echo ""

# Check Git status
echo "📦 Git Repository Status:"
git status --short
echo ""

# Check latest commits
echo "📝 Latest Commits:"
git log --oneline -5
echo ""

# Check remote sync
echo "🔄 Remote Sync Status:"
git remote -v
echo ""
git fetch origin
git status -uno
echo ""

# List key files
echo "📂 Key Project Files:"
ls -la *.json *.md vercel.json .env.example 2>/dev/null | grep -v "not found"
echo ""

# Check deployment trigger
echo "⏰ Last Deployment Trigger:"
if [ -f .deployment-trigger ]; then
    cat .deployment-trigger
else
    echo "No deployment trigger file found"
fi
echo ""

echo "✅ Status check complete!"
echo ""
echo "🌐 Vercel URLs:"
echo "   Production: https://kfar-shop.vercel.app"
echo "   Dashboard: https://vercel.com/bakielisrael-gmailcoms-projects/kfar-final"
echo ""
echo "💡 To trigger a new deployment:"
echo "   1. Make any change to code"
echo "   2. Commit and push to GitHub"
echo "   3. Or use: date > .deployment-trigger && git add . && git commit -m 'Deploy' && git push"
