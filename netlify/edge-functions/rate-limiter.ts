import type { Context } from "@netlify/edge-functions";

// In-memory store for rate limiting (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const rateLimiter = async (request: Request, context: Context): Promise<Response | void> => {
  const url = new URL(request.url);
  
  // Only apply to API routes (excluding existing edge functions)
  if (!url.pathname.startsWith('/api/') || 
      url.pathname === '/api/hero-image' || 
      url.pathname === '/api/hero-name') {
    return;
  }

  const clientIP = context.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100; // 100 requests per minute per IP

  // Clean up old entries to prevent memory leaks
  if (rateLimitStore.size > 1000) {
    const entries = Array.from(rateLimitStore.entries());
    for (const [ip, data] of entries) {
      if (now > data.resetTime) {
        rateLimitStore.delete(ip);
      }
    }
  }

  const userLimit = rateLimitStore.get(clientIP);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + windowMs });
    return;
  }

  if (userLimit.count >= maxRequests) {
    const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
    
    return new Response(
      JSON.stringify({ 
        error: 'Too many requests', 
        retryAfter: retryAfter 
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(userLimit.resetTime / 1000).toString(),
        },
      }
    );
  }

  userLimit.count++;
  
  // Add rate limit headers to the response
  const response = await context.next();
  if (response) {
    const remaining = Math.max(0, maxRequests - userLimit.count);
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(userLimit.resetTime / 1000).toString());
  }

  return response;
};

export default rateLimiter;