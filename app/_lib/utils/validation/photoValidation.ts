import { z } from 'zod';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'] as const;

export const photoSchema = z.string()
  .min(1, 'Image data is required')
  .refine(
    (data) => data.startsWith('data:image/'),
    'Invalid image format - must be a base64 image'
  )
  .refine(
    (data) => {
      const mimeType = data.split(';')[0].split(':')[1];
      return ALLOWED_MIME_TYPES.includes(mimeType as any);
    },
    'Invalid image type - must be JPEG or PNG'
  )
  .refine(
    (data) => {
      const base64Data = data.split(',')[1];
      const sizeInBytes = (base64Data.length * 3) / 4;
      return sizeInBytes <= MAX_IMAGE_SIZE;
    },
    'Image size exceeds 5MB limit'
  );

export type ValidatedPhoto = z.infer<typeof photoSchema>;