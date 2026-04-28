import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  // Server-only packages (never bundled for the browser)
  serverExternalPackages: ['nodemailer'],

  // Turbopack configuration (moved from deprecated experimental.turbo)
  turbopack: {},

  experimental: {},

  // Fix workspace root detection when multiple lockfiles exist
  outputFileTracingRoot: '/Users/mac/Downloads/Claude_Tech_Lab/kfar-review',
  
  images: {
    minimumCacheTTL: 2592000, // 30 days - prevents re-optimization
    // Include smaller responsive widths so card grids and small logos
    // don't over-fetch desktop-sized variants on mobile.
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 20, 24, 32, 40, 44, 48, 64, 72, 96, 128, 256, 384],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip API route validation
  skipTrailingSlashRedirect: true,
  
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
