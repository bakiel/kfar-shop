import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-only packages (never bundled for the browser)
  serverExternalPackages: ['nodemailer'],

  // Bypass all build errors
  experimental: {
    turbo: {
      // Turbopack configuration
    }
  },
  
  images: {
    minimumCacheTTL: 2592000, // 30 days - prevents re-optimization
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Disable ALL build-time checks
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip API route validation
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
  
  // Handle server-only modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve server modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        pg: false,
        'pg-native': false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
      };
    }
    
    // Ignore specific problematic modules
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };
    
    return config;
  },
}

export default nextConfig;