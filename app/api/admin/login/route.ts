import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { timingSafeEqual } from 'crypto';
import { validateAndGetSecurityConfig } from '@/app/_lib/config/security';
import { 
  checkLoginRateLimit, 
  recordFailedLoginAttempt, 
  recordSuccessfulLogin,
  getClientIdentifier 
} from '@/app/_lib/utils/rate-limit';

// Validate on module load (fails fast if misconfigured)
let securityConfig: ReturnType<typeof validateAndGetSecurityConfig>;
try {
  securityConfig = validateAndGetSecurityConfig();
} catch (error) {
  console.error('[SECURITY] Failed to load security configuration:', error);
  throw error;
}

const { adminUsername, adminPassword, jwtSecret } = securityConfig;

// Timing-safe string comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  // Ensure both strings are same length to prevent length-based timing attacks
  const bufferA = Buffer.from(a, 'utf-8');
  const bufferB = Buffer.from(b, 'utf-8');
  
  // Pad shorter buffer to match length
  const maxLength = Math.max(bufferA.length, bufferB.length);
  const paddedA = Buffer.alloc(maxLength);
  const paddedB = Buffer.alloc(maxLength);
  
  bufferA.copy(paddedA);
  bufferB.copy(paddedB);
  
  try {
    return timingSafeEqual(paddedA, paddedB) && bufferA.length === bufferB.length;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get client identifier for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : undefined;
    const identifier = getClientIdentifier(
      ip,
      request.headers.get('user-agent') || undefined
    );

    // Check rate limit
    const rateLimitCheck = checkLoginRateLimit(identifier);

    if (!rateLimitCheck.allowed) {
      const retryAfter = Math.ceil((rateLimitCheck.lockUntil! - Date.now()) / 1000);
      const minutesRemaining = Math.ceil(retryAfter / 60);
      
      console.warn(
        `[SECURITY] Blocked login attempt from locked account: ${identifier} at ${new Date().toISOString()}`
      );
      
      return NextResponse.json(
        { 
          error: `Too many failed login attempts. Account locked for ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`,
          retryAfter: rateLimitCheck.lockUntil
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString()
          }
        }
      );
    }

    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Add 1 second delay to slow brute force attempts
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Use timing-safe comparison to prevent timing attacks
    const usernameMatch = constantTimeCompare(username, adminUsername);
    const passwordMatch = constantTimeCompare(password, adminPassword);

    if (usernameMatch && passwordMatch) {
      // Clear failed attempts on success
      recordSuccessfulLogin(identifier);
      
      console.log(
        `[SECURITY] Successful login for user "${username}" from ${identifier} at ${new Date().toISOString()}`
      );


      // Create JWT token
      const token = await new SignJWT({ username, role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(jwtSecret);

      const response = NextResponse.json({ success: true });
      
      // Set HTTP-only cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return response;
    }

    // Record failed attempt
    recordFailedLoginAttempt(identifier);
    
    const updatedCheck = checkLoginRateLimit(identifier);
    const attemptsLeft = updatedCheck.attemptsRemaining || 0;
    
    console.warn(
      `[SECURITY] Failed login attempt for user "${username}" from ${identifier} (${attemptsLeft} attempts remaining) at ${new Date().toISOString()}`
    );

    return NextResponse.json(
      { 
        error: 'Invalid credentials',
        attemptsRemaining: attemptsLeft > 0 ? attemptsLeft : undefined
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('[SECURITY] Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
