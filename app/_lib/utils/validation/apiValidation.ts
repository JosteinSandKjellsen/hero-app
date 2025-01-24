import { z } from 'zod';
import type { HeroColor } from '../../types';

export const heroNameRequestSchema = z.object({
  personality: z.string().min(1, 'Personality is required'),
  gender: z.enum(['male', 'female', 'robot'] as const, {
    required_error: 'Gender must be male, female or robot'
  }),
  color: z.enum(['red', 'yellow', 'green', 'blue'] as const, {
    required_error: 'Invalid hero color'
  }),
});

export const heroImageRequestSchema = heroNameRequestSchema.extend({
  originalPhoto: z.string().optional(),
});

export type ValidatedHeroNameRequest = z.infer<typeof heroNameRequestSchema>;
export type ValidatedHeroImageRequest = z.infer<typeof heroImageRequestSchema>;

export function validateHeroNameRequest(data: unknown): ValidatedHeroNameRequest {
  return heroNameRequestSchema.parse(data);
}

export function isValidHeroColor(color: string): color is HeroColor {
  return ['red', 'yellow', 'green', 'blue'].includes(color);
}
