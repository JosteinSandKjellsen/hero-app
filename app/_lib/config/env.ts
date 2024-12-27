import { z } from 'zod';

const envSchema = z.object({
  LEONARDO_API_KEY: z.string().min(1, 'LEONARDO_API_KEY is required'),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
});

// Use environment variable with correct name
const env = {
  LEONARDO_API_KEY: process.env.LEONARDO_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
} as const;

// Validate environment variables
try {
  envSchema.parse(env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  throw new Error('Invalid environment variables');
}

export { env };
