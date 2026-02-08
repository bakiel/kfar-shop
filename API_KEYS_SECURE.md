# KFAR SHOP - API KEYS AND ENVIRONMENT VARIABLES
## Last Updated: June 22, 2025

### 🔐 CRITICAL - KEEP THIS FILE SECURE

## Supabase Configuration
- **URL**: https://pesxvleblcdwgojrxjmo.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlc3h2bGVibGNkd2dvanJ4am1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTU1OTMsImV4cCI6MjA2NTk3MTU5M30.joOhKw9lkiTGFkFWjZ_LGPy7rE5Y3Al4NPVYP6n0GNM
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlc3h2bGVibGNkd2dvanJ4am1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM5NTU5MywiZXhwIjoyMDY1OTcxNTkzfQ.igGJbl0Bsb7Jt-Ree_k8SZ61DPMahLV2Excl4UOw8TA
- **Database Password**: JTB40JwYvi1FXtR7
- **Personal Token**: sbp_6596626ef518ed0e896aa4031a560c3dd19d0193

## ElevenLabs (Voice AI)
- **API Key**: sk_c7840977c36d8ecaa5592287ce1df0222e255328dbae110d
- **Voice IDs**:
  - Yaakov (Male): TX3LPaxmHKxFdv7VOQHJ
  - Daniella (Female): Z3R5wn05IrDiVCyEkUrK

## AI Models Configuration
- **OpenRouter API Key**: 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
- **DeepSeek API Key**: sk-eadcdd62f6ba460e945de9d4d70fe659
- **Fal.ai API Key**: f6acc575-f48f-4105-b167-d18e9e8f8412:8f81fca2f7683516773605ec32ad2373

### Recommended AI Models:
1. **Google**: Gemini 2.5 Flash Lite Preview 06-17 (OpenRouter)
2. **Qwen**: Qwen2.5 VL 72B Instruct (Free on OpenRouter for vision)
3. **OpenAI**: GPT-4o-mini Search Preview
4. **DeepSeek**: V3 (via OpenRouter)

## Database URLs
- **Connection Pool**: postgresql://postgres.pesxvleblcdwgojrxjmo:JTB40JwYvi1FXtR7@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
- **Direct Connection**: postgresql://postgres.pesxvleblcdwgojrxjmo:JTB40JwYvi1FXtR7@aws-0-us-west-1.pooler.supabase.com:5432/postgres

## Deployment URLs
- **Production**: https://kfar-final.vercel.app
- **Alternative Names**:
  - https://kfar-shop.vercel.app
  - https://kfar-shop-clean-repo.vercel.app

## Security
- **JWT Secret**: Generated with timestamp (kfar-jwt-secret-2025-[timestamp])
- **Admin Token**: kfar-admin-token-2025
- **Admin Email**: admin@kfarmarketplace.com
- **Admin Password**: KfarAdmin2025!

## Notes
- All environment variables have been configured in Vercel
- Database migration has been applied successfully
- Voice features are enabled with ElevenLabs integration
- Multiple AI models are available for the chatbot

## Quick Commands
```bash
# Deploy to production
cd /Users/mac/Downloads/kfar-final && vercel --prod

# Check deployment status
cd /Users/mac/Downloads/kfar-final && vercel ls

# View environment variables
cd /Users/mac/Downloads/kfar-final && vercel env ls production
```
