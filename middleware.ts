import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { jwtVerify } from 'jose';
import { validateAndGetSecurityConfig } from '@/app/_lib/config/security';

// Simple in-memory store for rate limiting
// Note: This will reset on server restart, but provides basic protection
const rateLimits = new Map<string, { count: number; timestamp: number }>();

// Validate security config and get JWT secret
let JWT_SECRET: Uint8Array;
try {
  const { jwtSecret } = validateAndGetSecurityConfig();
  JWT_SECRET = jwtSecret;
} catch (error) {
  console.error('[SECURITY] Failed to load security configuration in middleware:', error);
  throw error;
}

// Protected routes (without locale prefix)
const PROTECTED_ROUTES = ['/sessions', '/generated-heroes'];
const PROTECTED_API_ROUTES = ['/api/sessions/manage', '/api/generated-heroes/delete'];

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

// Check authentication
async function checkAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin-token')?.value;
  
  if (!token) {
    return false;
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// Rate limiting middleware
const rateLimit = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  
  // Only rate limit API routes
  if (!pathname.startsWith('/api')) {
    return null;
  }

  // Exclude public read-only endpoints from rate limiting
  // These are safe to call frequently
  const publicReadOnlyEndpoints = [
    '/api/sessions',  // Public session listing
    '/api/generated-heroes',  // Admin view with polling
    '/api/hero-carousel',
    '/api/latest-heroes',
    '/api/hero-stats',  // Overview page polling
  ];
  
  if (publicReadOnlyEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
    return null;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0] : 'anonymous';
  const key = `${ip}-${pathname}`;
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
  const pathname = request.nextUrl.pathname;

  // Redirect /stats to /overview (with locale support)
  if (pathname.match(/^\/(en|no)\/stats$/)) {
    const locale = pathname.match(/^\/(en|no)/)?.[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/overview`, request.url));
  }

  // API routes should not be processed by i18n middleware
  if (pathname.startsWith('/api')) {
    // Check rate limit for API routes
    const rateLimitResponse = rateLimit(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Check if accessing protected API routes (skip admin login/logout)
    if (!pathname.startsWith('/api/admin/')) {
      const isProtectedApiRoute = PROTECTED_API_ROUTES.some(route => 
        pathname.startsWith(route)
      );

      if (isProtectedApiRoute) {
        const isAuthenticated = await checkAuth(request);
        if (!isAuthenticated) {
          return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        }
      }
    }

    // Let API routes pass through without i18n processing
    return NextResponse.next();
  }

  // Check if accessing protected page routes (with locale)
  if (!pathname.includes('/admin-login')) {
    const isProtectedPageRoute = PROTECTED_ROUTES.some(route => {
      // Check if pathname matches /[locale]/protected-route pattern
      const localePattern = /^\/(en|no)/;
      const withoutLocale = pathname.replace(localePattern, '');
      return withoutLocale.startsWith(route);
    });

    if (isProtectedPageRoute) {
      const isAuthenticated = await checkAuth(request);
      if (!isAuthenticated) {
        // Extract locale from pathname
        const locale = pathname.match(/^\/(en|no)/)?.[1] || 'en';
        const loginUrl = new URL(`/${locale}/admin-login`, request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Check rate limit for non-API routes
  const rateLimitResponse = rateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Handle internationalization for page routes
  return i18nMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - ... files in the public folder
  // - ... files with extensions (e.g. favicon.ico)
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
