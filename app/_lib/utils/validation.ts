import { z } from 'zod';
import type { HeroColor } from '../constants/colors';

export const heroNameRequestSchema = z.object({
  personality: z.string().min(1, 'Personality is required'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Gender must be either male or female'
  }),
  color: z.enum(['red', 'yellow', 'green', 'blue'] as const, {
    required_error: 'Invalid hero color'
  })
});

export type ValidatedHeroNameRequest = z.infer<typeof heroNameRequestSchema>;

export function validateHeroNameRequest(data: unknown): ValidatedHeroNameRequest {
  return heroNameRequestSchema.parse(data);
}

export function isValidHeroColor(color: string): color is HeroColor {
  return ['red', 'yellow', 'green', 'blue'].includes(color);
}