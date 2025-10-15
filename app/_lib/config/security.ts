export interface SecurityConfig {
  adminUsername: string;
  adminPassword: string;
  jwtSecret: Uint8Array;
}

export function validateAndGetSecurityConfig(): SecurityConfig {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;

  // Check if variables exist
  if (!username || !password || !jwtSecret) {
    throw new Error(
      'SECURITY ERROR: Required environment variables missing.\n' +
      'Please set: ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET\n' +
      'See .env.example for setup instructions.'
    );
  }

  // Validate password strength (production only to allow easy local dev)
  if (process.env.NODE_ENV === 'production') {
    if (password.length < 12) {
      throw new Error(
        'SECURITY ERROR: ADMIN_PASSWORD must be at least 12 characters in production'
      );
    }

    // Prevent common weak passwords
    const weakPasswords = ['changeme', 'admin', 'password', 'password123', '123456', 'admin123'];
    if (weakPasswords.includes(password.toLowerCase())) {
      throw new Error(
        'SECURITY ERROR: Cannot use common passwords in production. Please use a strong, unique password.'
      );
    }
  }

  // Validate JWT secret length
  if (jwtSecret.length < 32) {
    throw new Error(
      'SECURITY ERROR: JWT_SECRET must be at least 32 characters long.\n' +
      'Generate a secure secret with: openssl rand -base64 32'
    );
  }

  return {
    adminUsername: username,
    adminPassword: password,
    jwtSecret: new TextEncoder().encode(jwtSecret),
  };
}
