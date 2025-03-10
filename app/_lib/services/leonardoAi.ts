import { env } from '../config/env';
import { API_CONFIG } from '../config/api';
import { sleep } from '../utils/async';
import { ApiError, RateLimitError } from '../errors';
import type { GenerateImageParams, UploadUrlResponse } from '../types/leonardo';

export class LeonardoAiService {
  private readonly headers: HeadersInit;
  private readonly uploadHeaders: HeadersInit;

  constructor() {
    const authHeader = `Bearer ${env.LEONARDO_API_KEY}`;
    this.headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': authHeader,
    };
    this.uploadHeaders = {
      'accept': 'application/json',
      'authorization': authHeader,
    };
  }

  private async getUploadUrl(): Promise<UploadUrlResponse> {
    const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/init-image', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        extension: 'jpeg'
      })
    });

    if (!response.ok) {
      throw new ApiError('Failed to get upload URL', response.status);
    }

    const data = await response.json();
    const uploadData = data.uploadInitImage;

    if (!uploadData?.id || !uploadData?.url || !uploadData?.fields) {
      throw new ApiError('Invalid upload URL response', 500);
    }

    return {
      id: uploadData.id,
      url: uploadData.url,
      fields: JSON.parse(uploadData.fields)
    };
  }

  async uploadImage(base64Image: string): Promise<string> {
    try {
      // Get S3 upload URL and fields
      const { id, url, fields } = await this.getUploadUrl();

      // Convert base64 to array buffer and create blob
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'image/jpeg' });

      // Create form data with all required fields
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', blob, 'image.jpg');

      // Upload to S3
      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new ApiError('Failed to upload image to S3', uploadResponse.status);
      }

      // Image is available immediately after S3 upload
      return id;
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to upload image', 500);
    }
  }

  async generateImage(params: GenerateImageParams, maxRetries = 1): Promise<string> {
    let attempts = 0;

    while (attempts <= maxRetries) {
      try {
        const response = await fetch(`${API_CONFIG.leonardo.baseUrl}/generations`, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            height: params.height || 768,
            width: params.width || 512,
            modelId: API_CONFIG.leonardo.modelId,
            styleUUID: API_CONFIG.leonardo.styleUUID,
            num_images: 1,
            presetStyle: 'LEONARDO',
            sd_version: API_CONFIG.leonardo.version,
            prompt: params.prompt,
            nsfw: false,
            negative_prompt: params.negativePrompt,
            contrast: 1.3,
            controlnets: params.initImageId ? [
              {
                preprocessorId: 133, // ID for the image preprocessor
                initImageType: "UPLOADED",
                initImageId: params.initImageId,
                strengthType: "High"
              }
            ] : [],
            elements: [],
            guidance_scale: 7,
            highContrast: false,
            num_inference_steps: 10,
            photoReal: false,
            scheduler: "LEONARDO",
            tiling: false,
            transparency: "disabled",
            ultra: false,
            userElements: [],
            weighting: 0.75
          }),
        });

        if (response.status === 429) {
          if (attempts === maxRetries) {
            throw new RateLimitError(
              'Many users are creating heroes right now. Please wait a moment and try again.',
              10
            );
          }
          console.log('Rate limited, waiting 10 seconds before retry...');
          await sleep(10000); // 10 second delay
          attempts++;
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.error || `API request failed: ${response.statusText}`,
            response.status
          );
        }

        const data = await response.json();

        if (!data.sdGenerationJob?.generationId) {
          throw new ApiError('No generation ID received', 500);
        }

        return data.sdGenerationJob.generationId;
      } catch (error) {
        if (error instanceof RateLimitError) {
          throw error; // Let the UI handle rate limit errors specifically
        }
        console.error('Error generating image:', error);
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError('Failed to generate image', 500);
      }
    }

    throw new ApiError('Maximum retries exceeded', 500);
  }

  async deleteImage(imageId: string, type: 'initial' | 'generated' = 'initial', maxRetries = 3): Promise<boolean> {
    let attempts = 0;
    
    while (attempts <= maxRetries) {
      try {
        // Different endpoints for different image types
        const endpoint = type === 'initial' ? 'init-image' : 'generations';
        const url = `${API_CONFIG.leonardo.baseUrl}/${endpoint}/${imageId}`;
        console.log(`Attempting to delete ${type} image at: ${url}`);

        const response = await fetch(url, {
          method: 'DELETE',
          headers: this.headers
        });

        // Log the full response for debugging
        const responseText = await response.text();
        console.log(`Delete response for ${type} image:`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText
        });

        if (response.status === 429) {
          if (attempts === maxRetries) {
            console.error('Rate limit reached after max retries, skipping deletion for:', imageId);
            return false;
          }
          console.log('Rate limited on delete, waiting before retry...');
          await sleep(2000 * Math.pow(2, attempts)); // Exponential backoff: 2s, 4s, 8s
          attempts++;
          continue;
        }

        if (!response.ok && response.status !== 404) {
          console.error(`Failed to delete ${type} image:`, {
            imageId,
            status: response.status,
            statusText: response.statusText
          });
          return false;
        }

        // Consider both success and 404 (not found) as successful deletion
        return true;
      } catch (error) {
        console.error(`Network error deleting ${type} image:`, {
          imageId,
          type,
          error: error instanceof Error ? error.message : error
        });
        if (attempts === maxRetries) return false;
        attempts++;
      }
    }
    return false;
  }

  async getGeneratedImage(generationId: string): Promise<string> {
    const maxAttempts = 12;
    const pollInterval = 2000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          `${API_CONFIG.leonardo.baseUrl}/generations/${generationId}`,
          { headers: this.headers }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.error || `API request failed: ${response.statusText}`,
            response.status
          );
        }

        const data = await response.json();
        const generation = data.generations_by_pk;

        if (!generation) {
          throw new ApiError('Generation not found', 404);
        }

        if (generation.status === 'COMPLETE' && generation.generated_images?.length) {
          return generation.generated_images[0].url;
        }

        if (generation.status === 'FAILED') {
          throw new ApiError('Image generation failed', 500);
        }

        // Exponential backoff for polling
        const backoffDelay = Math.min(pollInterval * Math.pow(1.5, attempts), 5000);
        await sleep(backoffDelay);
        attempts++;
      } catch (error) {
        console.error('Error checking generation status:', error);
        if (error instanceof ApiError) {
          throw error;
        }
        throw new ApiError('Failed to check generation status', 500);
      }
    }

    throw new ApiError('Timeout waiting for image generation', 504);
  }
}
