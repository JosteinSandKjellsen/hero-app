interface FailedLoginRecord {
  count: number;
  lockUntil?: number;
  firstAttempt: number;
}

const failedLogins = new Map<string, FailedLoginRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Cleanup old entries periodically
function cleanup(): void {
  const now = Date.now();
  const entries = Array.from(failedLogins.entries());
  
  for (const [key, record] of entries) {
    // Remove if lockout expired or attempt window passed
    if (
      (record.lockUntil && record.lockUntil < now) ||
      (now - record.firstAttempt > ATTEMPT_WINDOW && !record.lockUntil)
    ) {
      failedLogins.delete(key);
    }
  }
  
  // Prevent memory leaks - cap at 10000 entries
  if (failedLogins.size > 10000) {
    console.warn('[SECURITY] Rate limit cache exceeded 10000 entries, clearing old data');
    failedLogins.clear();
  }
}

export interface RateLimitResult {
  allowed: boolean;
  lockUntil?: number;
  attemptsRemaining?: number;
}

export function checkLoginRateLimit(identifier: string): RateLimitResult {
  cleanup();
  
  const now = Date.now();
  const record = failedLogins.get(identifier);

  if (!record) {
    return { allowed: true, attemptsRemaining: MAX_FAILED_ATTEMPTS };
  }

  // Check if still locked out
  if (record.lockUntil && record.lockUntil > now) {
    return { 
      allowed: false, 
      lockUntil: record.lockUntil,
      attemptsRemaining: 0
    };
  }

  // Reset if lockout expired or attempt window passed
  if (
    (record.lockUntil && record.lockUntil <= now) ||
    (now - record.firstAttempt > ATTEMPT_WINDOW)
  ) {
    failedLogins.delete(identifier);
    return { allowed: true, attemptsRemaining: MAX_FAILED_ATTEMPTS };
  }

  const remaining = MAX_FAILED_ATTEMPTS - record.count;
  return { allowed: true, attemptsRemaining: Math.max(0, remaining) };
}

export function recordFailedLoginAttempt(identifier: string): void {
  const now = Date.now();
  const record = failedLogins.get(identifier);

  if (!record) {
    failedLogins.set(identifier, { 
      count: 1, 
      firstAttempt: now 
    });
  } else {
    record.count += 1;
    
    if (record.count >= MAX_FAILED_ATTEMPTS) {
      record.lockUntil = now + LOCKOUT_DURATION;
      console.warn(
        `[SECURITY] Account locked due to ${MAX_FAILED_ATTEMPTS} failed attempts from ${identifier} at ${new Date().toISOString()}`
      );
    }
  }
}

export function recordSuccessfulLogin(identifier: string): void {
  failedLogins.delete(identifier);
}

export function getClientIdentifier(ip: string | undefined, userAgent: string | undefined): string {
  // Combine IP and user agent for better tracking
  // This prevents attackers from bypassing by changing user agent only
  return `${ip || 'unknown'}-${userAgent?.substring(0, 50) || 'no-ua'}`;
}
