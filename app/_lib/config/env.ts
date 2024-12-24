import { z } from 'zod';

const envSchema = z.object({
  LEONARDO_API_KEY: z.string().min(1, 'LEONARDO_API_KEY is required'),
});

// Use environment variable with correct name
const env = {
  LEONARDO_API_KEY: '8ae9ed82-15be-44d0-a15b-0823e1bb6492', // Hardcoded for demo
} as const;

// Validate environment variables
try {
  envSchema.parse(env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  throw new Error('Invalid environment variables');
}

export { env };