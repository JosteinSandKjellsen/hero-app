import { z } from 'zod';

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
});

export const env = {
  GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
} as const;

// Validate environment variables
try {
  envSchema.parse(env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  throw new Error('Invalid environment variables');
}