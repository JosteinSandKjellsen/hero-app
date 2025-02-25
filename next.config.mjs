import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['node:buffer', 'punycode'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizeServerReact: true,
    optimizeCss: true
  },
  compress: true, // Enable compression for non-edge routes
  poweredByHeader: false, // Remove X-Powered-By header for security
  optimizeFonts: true, // Enable font optimization
  swcMinify: true, // Use SWC for minification
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
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'], // Prefer modern image formats
    minimumCacheTTL: 31536000, // Cache images for 1 year
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
  },
  // Webpack optimization configuration
  webpack: (config, { dev, isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/node-fetch\/lib\/index\.js/ },
        { module: /node_modules\/punycode\/punycode\.js/ }
      ];
    }

    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          '...', // Keep default minimizers
          new (require('css-minimizer-webpack-plugin'))(),
        ],
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  }
};

export default withNextIntl(nextConfig);
