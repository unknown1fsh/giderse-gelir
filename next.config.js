/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone mode devre dışı - normal build kullanıyoruz
  // output: 'standalone',

  serverExternalPackages: ['@prisma/client'],

  // Environment variables to expose to the client
  env: {
    PORT: process.env.PORT || '3000',
    NEXT_PUBLIC_APP_URL:
      process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  typescript: {
    // TypeScript hataları build'i durdurur
    ignoreBuildErrors: false,
  },

  eslint: {
    // ESLint hataları build'i durdurur
    ignoreDuringBuilds: false,
  },

  // Image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Railway için SSL bypass
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: https://www.googletagmanager.com https://www.google-analytics.com https://googleads.g.doubleclick.net https://www.googleadservices.com; frame-src 'self' https://www.googletagmanager.com https://googleads.g.doubleclick.net;",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
