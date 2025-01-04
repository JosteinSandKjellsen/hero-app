import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';

// Simple in-memory store for rate limiting
// Note: This will reset on server restart, but provides basic protection
const rateLimits = new Map<string, { count: number; timestamp: number }>();

// Rate limit configuration
const RATE_LIMIT = {
  tokens: 10, // requests
  interval: 3600000, // 1 hour in milliseconds
};

// Clean up old rate limit entries
const cleanup = () => {
  const now = Date.now();
  Array.from(rateLimits.entries()).forEach(([key, value]) => {
    if (now - value.timestamp > RATE_LIMIT.interval) {
      rateLimits.delete(key);
    }
  });
};

// Rate limiting middleware
const rateLimit = (request: NextRequest) => {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return null;
  }

  const ip = request.ip ?? 'anonymous';
  const key = `${ip}-${request.nextUrl.pathname}`;
  const now = Date.now();

  cleanup();

  const currentLimit = rateLimits.get(key);
  if (!currentLimit) {
    rateLimits.set(key, { count: 1, timestamp: now });
    return null;
  }

  if (now - currentLimit.timestamp > RATE_LIMIT.interval) {
    rateLimits.set(key, { count: 1, timestamp: now });
    return null;
  }

  if (currentLimit.count >= RATE_LIMIT.tokens) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  currentLimit.count++;
  return null;
};

// Create the internationalization middleware
const i18nMiddleware = createI18nMiddleware({
  locales: ['en', 'no'],
  defaultLocale: 'en',
  localePrefix: 'always',
  // Use the prefix for better static optimization
  pathnames: {
    '/': '/',
    '/print': '/print'
  }
});

// Combined middleware
export default async function middleware(request: NextRequest) {
  // Check rate limit first
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Then handle internationalization
  return i18nMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - ... files in the public folder
  // - ... files with extensions (e.g. favicon.ico)
  // - ... files in the api folder
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
