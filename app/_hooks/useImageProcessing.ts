import { useState } from 'react';
import { ImageProcessor } from '@/app/_lib/utils/image/imageProcessing';

interface UseImageProcessingResult {
  processImage: (base64Image: string) => Promise<string>;
  isProcessing: boolean;
  error: string | null;
}

export function useImageProcessing(): UseImageProcessingResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (base64Image: string): Promise<string> => {
    if (!base64Image) {
      throw new Error('No image data provided');
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Validate the image first
      const validatedImage = await ImageProcessor.validateImage(base64Image);
      
      // Then compress it
      const compressedImage = await ImageProcessor.compressImage(validatedImage);
      
      return compressedImage;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process image';
      setError(message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processImage,
    isProcessing,
    error
  };
}