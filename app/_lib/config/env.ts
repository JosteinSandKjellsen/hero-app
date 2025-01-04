import { z } from 'zod';

const envSchema = z.object({
  LEONARDO_API_KEY: z.string().min(1, 'LEONARDO_API_KEY is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Use environment variable with correct name
const env = {
  LEONARDO_API_KEY: process.env.LEONARDO_API_KEY ?? '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;

// Validate environment variables
try {
  envSchema.parse(env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  throw new Error('Invalid environment variables');
}

// Runtime checks when actually using the keys
export function getLeonardoApiKey(): string {
  if (!env.LEONARDO_API_KEY) {
    throw new Error('LEONARDO_API_KEY is required for this operation');
  }
  return env.LEONARDO_API_KEY;
}

export function getGeminiApiKey(): string {
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is required for this operation');
  }
  return env.GEMINI_API_KEY;
}

export { env };
