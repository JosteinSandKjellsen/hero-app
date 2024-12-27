import { GoogleGenerativeAI } from '@google/generative-ai';
import { defaultHeroNames, type HeroColor } from '../_lib/constants/defaultNames';
import { getGeminiApiKey } from '../_lib/config/env';

const genAI = new GoogleGenerativeAI(getGeminiApiKey());
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function generateHeroName(
  personality: string,
  gender: string,
  color: string
): Promise<string> {
  try {
    const prompt = `Generate a superhero name based on the following characteristics:
      - Personality: ${personality}
      - Gender: ${gender}
      - Color theme: ${color}
      
      Rules:
      - The name should be short (1-3 words)
      - Should not include common superhero names like "man", "woman", "boy", "girl"
      - Should be creative and unique
      - Should reflect the personality and color theme
      - Return ONLY the superhero name, nothing else
      `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      console.error('No hero name generated');
      return getRandomDefaultName();
    }

    return text.trim();
  } catch (error) {
    console.error('Error generating hero name:', error);
    return getRandomDefaultName();
  }
}

function getRandomDefaultName(): string {
  const colors = Object.keys(defaultHeroNames) as HeroColor[];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return defaultHeroNames[randomColor];
}
