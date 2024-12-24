import { base64ImageSchema } from '../validation/imageValidation';

export class ImageProcessor {
  static async validateImage(base64String: string): Promise<string> {
    // Basic format check before schema validation
    if (!base64String?.startsWith('data:image/')) {
      throw new Error('Invalid image format - must be a base64 image');
    }

    try {
      // Validate using zod schema
      const validatedImage = base64ImageSchema.parse(base64String);
      
      // Additional validation by loading the image
      await this.loadImage(validatedImage);
      return validatedImage;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid image data');
    }
  }

  private static loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.crossOrigin = 'anonymous'; // Enable CORS
      img.src = src;
    });
  }

  static async compressImage(base64String: string): Promise<string> {
    try {
      const img = await this.loadImage(base64String);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Calculate dimensions while maintaining aspect ratio
      const maxDim = 1024;
      let { width, height } = img;
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        } else {
          width = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }

      // Set canvas dimensions and draw
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Compress and return
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      throw new Error('Failed to compress image');
    }
  }
}