'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { defaultHeroNames } from '../_lib/constants/defaultNames';
import type { HeroColor } from '../_types/api';

const genAI = new GoogleGenerativeAI('AIzaSyAm0VLbDu1RsYM2U32GOp-vnN70FBocQUM');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function generateHeroName(
  personality: string,
  gender: 'male' | 'female',
  color: HeroColor
): Promise<string> {
  try {
    console.log('Generating hero name for:', { personality, gender, color });

    const prompt = `Generate a short, memorable superhero name (2-3 words) for a ${gender} hero with ${color} as their primary color and this personality: ${personality}. The name should be appropriate for all ages.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const heroName = response.text().trim();

    console.log('Generated hero name:', heroName);

    if (!heroName) {
      console.warn('Generated hero name was empty, using default');
      return defaultHeroNames[color];
    }

    return heroName;
  } catch (error) {
    console.error('Error generating hero name:', error);
    return defaultHeroNames[color];
  }
}