# 🚀 GPT-5 Translation Setup for KFAR Marketplace

## 🎉 GPT-5 Models are Available!

OpenRouter now offers GPT-5 models for translation:

### Available Models:
1. **GPT-5** - $1.25/M input, $10/M output (Most advanced)
2. **GPT-5 Mini** - $0.25/M input, $2/M output (Perfect for translation)
3. **GPT-5 Nano** - $0.05/M input, $0.40/M output (Fastest & cheapest)

## ⚠️ Important: BYOK Required

**"Bring Your Own Key" (BYOK)** is required for GPT-5 models.

### How to Set Up BYOK:
1. Go to: https://openrouter.ai/settings/integrations
2. Add your OpenAI API key
3. This links your OpenAI account to OpenRouter
4. GPT-5 models will then work

## 📊 Model Comparison for Translation

| Model | Input Cost | Output Cost | Best For |
|-------|-----------|-------------|----------|
| GPT-5 | $1.25/M | $10/M | Complex context, cultural nuance |
| **GPT-5 Mini** | **$0.25/M** | **$2/M** | **Perfect balance for translation** |
| GPT-5 Nano | $0.05/M | $0.40/M | Simple, fast translations |
| GPT-4o-mini | $0.15/M | $0.60/M | Good alternative |

## 🔧 Current Configuration

The app is now configured to use:
```javascript
model: 'openai/gpt-5-mini' // Best for Hebrew ↔ English translation
```

## 💰 Cost Example

For 1000 translations (avg 50 tokens each):
- **Input**: 50,000 tokens = $0.0125
- **Output**: 50,000 tokens = $0.10
- **Total**: ~$0.11 for 1000 translations

That's about **$0.0001 per translation**!

## 🧪 Testing

Test the translation:
```bash
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Fresh Organic Vegetables from Local Farm",
    "targetLang": "he",
    "context": "product_name"
  }'
```

## 🔄 Fallback Options

If GPT-5 doesn't work (no BYOK setup), the system automatically falls back to:
1. GPT-4o-mini (if available)
2. Google Gemini (if API key added)
3. Mock translation (for testing)

## ✅ To Enable GPT-5:

### Option 1: Set up BYOK (Recommended)
1. Go to: https://openrouter.ai/settings/integrations
2. Add your OpenAI API key
3. GPT-5 models will work immediately

### Option 2: Use GPT-4o-mini (No BYOK needed)
Change the model in `/app/api/translate/route.ts`:
```javascript
model: 'openai/gpt-4o-mini' // Works without BYOK
```

### Option 3: Add Google Gemini (FREE)
Add to `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY=AIza...your_key
```

## 📱 Translation Features

The GPT-5 Mini translation:
- ✅ Understands Hebrew cultural context
- ✅ Maintains brand names appropriately
- ✅ Handles kosher/vegan terms correctly
- ✅ Preserves tone and formality
- ✅ Works with RTL text direction
- ✅ Context-aware (store names vs products)

## 🎯 Bottom Line

**GPT-5 Mini is configured** and ready to use for translation at just $0.0001 per translation. To activate it, either:
1. Set up BYOK at OpenRouter (takes 2 minutes)
2. Or use GPT-4o-mini which works now
3. Or add a free Google Gemini key

The system will automatically use the best available model!