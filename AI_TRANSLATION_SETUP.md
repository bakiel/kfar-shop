# 🌐 AI Translation Setup for KFAR Marketplace

## Current Status
The app has AI translation capabilities but needs API keys to work properly.

## Available Translation Providers

### 1. **Google Gemini (Recommended - FREE)**
- **Best for**: Hebrew ↔ English translation
- **Cost**: FREE tier available (60 requests/minute)
- **Setup**: 
  1. Go to: https://makersuite.google.com/app/apikey
  2. Click "Create API Key"
  3. Copy the key
  4. Add to `.env.local`:
  ```env
  GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
  ```

### 2. **OpenRouter (Currently Active)**
- **Status**: ✅ Already configured
- **Key**: Already in `.env.local`
- **Models**: Uses Google Gemini Flash through OpenRouter

### 3. **OpenAI (Optional)**
- **Cost**: Paid (GPT-3.5 ~$0.002 per translation)
- **Setup**:
  ```env
  OPENAI_API_KEY=sk-...your_key_here
  ```

### 4. **Anthropic Claude (Optional)**
- **Cost**: Paid (Haiku ~$0.001 per translation)
- **Setup**:
  ```env
  ANTHROPIC_API_KEY=sk-ant-...your_key_here
  ```

## Quick Setup Instructions

### Step 1: Get a FREE Google API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create new API key
4. Copy the key

### Step 2: Add to Environment
Edit `.env.local`:
```env
# Add this line:
GOOGLE_GENERATIVE_AI_API_KEY=AIza...your_key_here

# Keep existing:
OPENROUTER_API_KEY=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
```

### Step 3: Restart Server
```bash
# Stop server (Ctrl+C)
# Restart
npm run dev
```

## API Endpoints

### New AI Translation Endpoint
```
POST /api/translate-ai
```

Request:
```json
{
  "text": "Organic Honey",
  "targetLang": "he",
  "context": "product_name"
}
```

Response:
```json
{
  "translatedText": "דבש אורגני",
  "originalText": "Organic Honey",
  "targetLang": "he",
  "provider": "google"
}
```

### Check Available Providers
```
GET /api/translate-ai
```

Response shows which providers are configured:
```json
{
  "providers": {
    "google": true,
    "openai": false,
    "anthropic": false,
    "openrouter": true
  },
  "available": ["google", "openrouter"],
  "preferred": "google"
}
```

## Translation Contexts

The API supports different contexts for better translations:

- `store_name` - Store/vendor names
- `product_name` - Product titles
- `description` - Longer descriptions
- `general` - General text

## How It Works

1. **Priority Order**:
   - Google Gemini (if configured)
   - OpenAI GPT-3.5 (if configured)
   - Anthropic Claude (if configured)
   - OpenRouter (fallback)
   - Mock translation (testing only)

2. **Smart Fallbacks**:
   - If one provider fails, tries the next
   - Always returns something (even mock)
   - Caches translations when possible

3. **Context-Aware**:
   - Understands marketplace terminology
   - Preserves brand names
   - Handles kosher/vegan terms correctly

## Testing the Translation

### Quick Test in Browser Console:
```javascript
// Test translation API
fetch('/api/translate-ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Fresh Organic Vegetables',
    targetLang: 'he',
    context: 'product_name'
  })
})
.then(res => res.json())
.then(console.log);
```

### Test in Vendor Onboarding:
1. Go to: http://localhost:3000/vendor/onboarding
2. Toggle "Auto-Translation" ON
3. Type store name in English
4. Hebrew translation appears automatically

## Costs

| Provider | Model | Cost per 1000 translations |
|----------|-------|---------------------------|
| Google Gemini | 1.5 Flash | FREE (60/min limit) |
| OpenRouter | Gemini via OR | ~$0.15 |
| OpenAI | GPT-3.5 | ~$2.00 |
| Anthropic | Claude Haiku | ~$1.00 |

## Troubleshooting

### Translation Not Working?
1. Check API keys in `.env.local`
2. Restart server after adding keys
3. Check browser console for errors
4. Try the test endpoint: `GET /api/translate-ai`

### Slow Translations?
- Google Gemini is fastest (~500ms)
- OpenRouter adds ~200ms overhead
- First translation after restart is slower

### Wrong Translations?
- Specify correct context (product_name, description, etc.)
- Check source language detection
- Report specific issues for improvement

## For Production

### Recommended Setup:
1. **Primary**: Google Gemini (free, fast, good Hebrew)
2. **Backup**: OpenRouter (already configured)
3. **Optional**: OpenAI for complex translations

### Environment Variables for Vercel:
Add these in Vercel Dashboard → Settings → Environment Variables:
```
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
OPENROUTER_API_KEY=sk-or-v1-...
```

## Bottom Line

The translation system is **ready to use** with OpenRouter. For better performance and free translations, add a Google API key (takes 2 minutes). The system will automatically use the best available provider.