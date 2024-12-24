export class ImageProcessingService {
  static async validateAndProcessBase64(base64String: string): Promise<string> {
    if (!base64String) {
      throw new Error('No image data provided');
    }

    // Ensure the base64 string has the correct format
    if (!base64String.startsWith('data:image')) {
      throw new Error('Invalid image format');
    }

    try {
      // Validate by attempting to load the image
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = base64String;
      });

      return base64String;
    } catch (error) {
      throw new Error('Invalid image data');
    }
  }

  static async compressImage(base64String: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas with desired dimensions
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Set dimensions (max 1024px while maintaining aspect ratio)
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;
          
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = base64String;
    });
  }
}