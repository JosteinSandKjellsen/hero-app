import { env } from '../config/env';
import { API_CONFIG } from '../config/api';
import { sleep } from '../utils/async';
import { ApiError } from '../errors';
import type { GenerateImageParams } from '../types/leonardo';

export class LeonardoAiService {
  private readonly headers: HeadersInit;

  constructor() {
    this.headers = {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': `Bearer ${env.LEONARDO_API_KEY}`,
    };
  }

  async generateImage(params: GenerateImageParams): Promise<string> {
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
        }),
      });

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
      console.error('Error generating image:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to generate image', 500);
    }
  }

  async getGeneratedImage(generationId: string): Promise<string> {
    const maxAttempts = 30;
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

        await sleep(pollInterval);
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