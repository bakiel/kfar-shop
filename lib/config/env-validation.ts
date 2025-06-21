// Environment variable validation
const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // API Keys (Server-side only)
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  
  // Optional but recommended
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value) {
      // Some are optional in development
      if (key.includes('ELEVENLABS') || key.includes('TWILIO')) {
        warnings.push(key);
      } else {
        missing.push(key);
      }
    }
  });

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Missing optional environment variables:', warnings.join(', '));
  }

  // Throw error for required missing vars
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate formats
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  console.log('✅ Environment variables validated successfully');
}

// Run validation in development
if (process.env.NODE_ENV === 'development') {
  try {
    validateEnv();
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
  }
}