import { z } from 'zod';
import type { HeroColor } from '@/app/_types/api';

export const heroNameRequestSchema = z.object({
  personality: z.string().min(1, 'Personality is required'),
  gender: z.enum(['male', 'female'] as const),
  color: z.enum(['red', 'yellow', 'green', 'blue'] as const),
});

export const heroImageRequestSchema = heroNameRequestSchema.extend({
  originalPhoto: z.string().optional(),
});

export type ValidatedHeroNameRequest = z.infer<typeof heroNameRequestSchema>;
export type ValidatedHeroImageRequest = z.infer<typeof heroImageRequestSchema>;