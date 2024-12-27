import { z } from 'zod';

const envSchema = z.object({
  LEONARDO_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
});

// Use environment variable with correct name
const env = {
  LEONARDO_API_KEY: process.env.LEONARDO_API_KEY ?? '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
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
