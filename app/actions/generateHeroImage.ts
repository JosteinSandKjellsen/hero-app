'use server';

import { LeonardoAiService } from '../_lib/services/leonardoAi';
import { ApiError } from '../_lib/errors';
import type { HeroColor } from '../_lib/types/api';
import { getRobotPrompt } from '../_lib/utils/prompts';

const MAX_RETRIES = 2; // Reduced retries to fit within function timeout

export async function generateHeroImage(
  personality: string,
  gender: 'male' | 'female' | 'robot',
  color: HeroColor,
  photoBase64?: string
): Promise<string> {
  const leonardoService = new LeonardoAiService();
  let initImageId: string | undefined;
  let uploadSuccessful = false;

  try {
    // Skip image upload for robot gender
    if (gender !== 'robot' && photoBase64) {
      try {
        initImageId = await leonardoService.uploadImage(photoBase64);
        uploadSuccessful = true;
      } catch (error) {
        console.error('Failed to upload initial image:', error);
        throw new ApiError('Failed to upload initial image', 500);
      }
    }

    const heroPrompts = {
      red: 'A superhero wearing a sleek, tight-fitting, flexible dark red and black suit with aerodynamic lines. Hero logo is a flame symbol. Hero has glowing red, stylized energy fins on the shoulders. For human genders: face revealing sharp, focused eyes, and tousled hair that suggests hero is always on the move. For robot: a sleek metallic face with glowing red optical sensors. The character is mid-action, slightly hovering as if ready to sprint at lightning speed, with a dynamic and adventurous pose. The background is a futuristic urban setting with a sense of motion and energy trails around the hero. Character exudes boldness, curiosity, and determination. Image in comic art style of Alex Ross.',
      blue: 'Portrait of A confident hero in a refined blue suit adorned with geometric patterns. Hero logo is a brain symbol. Midnight blue armored accents lend the hero a technological, modern feel. floating geometric forms of glowing blue light. Hero stands solidly, arms folded or one hand raised conjuring a blue energy bridge, exuding calm rationality. Image in comic art style of Alex Ross.',
      green: 'A serene, nature-inspired tough hero clad in deep-green, leaf-patterned attire. Hero logo is a leaf symbol. A light, green cape hangs quietly behind the hero. Part of the armor seems made from natural, bio-based materials that resemble leaves. Hero stands with calm confidence, perhaps one hand resting on a vine or plant, projecting an aura of peace and empathy. Image in comic art style of Alex Ross.',
      yellow: 'A superhero wearing a soft, flowing yellow cape that shimmers like a warm morning glow. Hero logo is a sun symbol. The suit is primarily yellow with white and gold accents, featuring a radiant sun symbol glowing gently on the chest. Face is fully visible, radiating warmth and positivity with a strong, confident smile. Hero stands powerfully, arms slightly extended as if uplifting and inspiring those around the hero. Gentle golden light emanates from the hero, casting a soft, warm glow in all directions. The background is a futuristic urban skyline bathed in sunlight, with vibrant energy waves spreading outward, symbolizing the heroes power to heal and inspire. Hero exudes optimism, kindness, and a sense of unity, standing as a beacon of hope and energy. Image in comic art style of Alex Ross.',
    } as const;

    const prompt = gender === 'robot' 
      ? getRobotPrompt(color)
      : `Create a ${gender} comic book style superhero portrait. Make sure the hero is distinctly ${gender}. ${
          heroPrompts[color] ?? 'classic superhero colors with bold primary tones'
        }`;

    const negativePrompt =
      'blurry, low quality, distorted, bad anatomy, text, watermark, signature, deformed, ugly, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, extra limbs, extra legs, extra arms, disfigured, bad anatomy, bad proportions, gross proportions, malformed limbs, missing arms, missing legs, extra digit, fewer digits, mask, superman logo, batman logo, spiderman logo, sexual content, bare skin, large breasts';

    // Attempt generation with retries and detailed error tracking
    let lastError: Error | null = null;
    let lastGenerationId: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Starting generation attempt ${attempt}/${MAX_RETRIES}`);
        
        // Generate the image
         lastGenerationId = await leonardoService.generateImage({
           prompt,
           negativePrompt,
           width: 512,
           height: 768,
           initImageId
         });
        
        console.log(`Generation ID received: ${lastGenerationId}`);

        // Wait for the generated image to be available and accessible
        const imageUrl = await leonardoService.getGeneratedImage(lastGenerationId);
        console.log(`Successfully generated and verified image URL: ${imageUrl}`);
        return imageUrl;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Generation attempt ${attempt} failed:`, {
          error: errorMessage,
          generationId: lastGenerationId,
          attempt,
          maxRetries: MAX_RETRIES
        });
        
        lastError = error as Error;
        
        if (attempt < MAX_RETRIES) {
          const retryDelay = Math.min(1500 * attempt, 3000); // Capped exponential backoff
          console.log(`Waiting ${retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    // If we get here, all attempts failed
    const finalError = new ApiError(
      `Failed to generate hero image after ${MAX_RETRIES} retries. Last error: ${lastError?.message || 'Unknown error'}`,
      500
    );
    console.error('All generation attempts failed:', {
      error: finalError,
      lastGenerationId,
      totalAttempts: MAX_RETRIES
    });
    throw finalError;
  } catch (error) {
    console.error('Error in hero image generation process:', error);
    throw error;
  } finally {
    // Clean up the initial image if it was uploaded
    if (uploadSuccessful && initImageId) {
      // Fire and forget cleanup - don't await or delay
      leonardoService.deleteImage(initImageId, 'initial')
        .catch(deleteError => console.error('Failed to delete initial image:', deleteError));
    }
  }
}
