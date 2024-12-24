import { z } from 'zod';

export const heroColorSchema = z.enum(['red', 'yellow', 'green', 'blue'] as const);

export const heroNameRequestSchema = z.object({
  personality: z.string().min(1, 'Personality is required'),
  gender: z.enum(['male', 'female'] as const),
  color: heroColorSchema
});

export const imageValidationSchema = z.object({
  base64: z.string()
    .min(1, 'Image data is required')
    .refine(
      (data) => data.startsWith('data:image/'),
      'Invalid image format'
    )
    .refine(
      (data) => {
        const mimeType = data.split(';')[0].split(':')[1];
        return ['image/jpeg', 'image/png'].includes(mimeType);
      },
      'Invalid image type - must be JPEG or PNG'
    )
    .refine(
      (data) => {
        const base64Data = data.split(',')[1];
        const sizeInBytes = (base64Data.length * 3) / 4;
        return sizeInBytes <= 5 * 1024 * 1024; // 5MB
      },
      'Image size exceeds 5MB limit'
    )
});

export type HeroNameRequest = z.infer<typeof heroNameRequestSchema>;
export type ValidatedImage = z.infer<typeof imageValidationSchema>;