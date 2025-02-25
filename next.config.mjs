import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['node:buffer', 'punycode'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=self',
        }
      ],
    },
    // Add strong caching for static assets
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'CDN-Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'Netlify-CDN-Cache-Control',
          value: 'public, max-age=31536000, immutable',
        }
      ],
    },
    {
      source: '/fonts/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'CDN-Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'Netlify-CDN-Cache-Control',
          value: 'public, max-age=31536000, immutable',
        }
      ],
    },
    // Add caching for _next/static files (JS, CSS)
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'CDN-Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
        {
          key: 'Netlify-CDN-Cache-Control',
          value: 'public, max-age=31536000, immutable',
        }
      ],
    },
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/node-fetch\/lib\/index\.js/ },
        { module: /node_modules\/punycode\/punycode\.js/ }
      ];
    }
    return config;
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bouvet.fotoware.cloud',
      },
      {
        protocol: 'https',
        hostname: 'cdn.leonardo.ai',
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
};

export default withNextIntl(nextConfig);
