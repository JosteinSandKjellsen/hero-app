import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { defaultHeroNames, type HeroColor } from '../../_lib/constants/defaultNames';
import { getGeminiApiKey } from '../../_lib/config/env';

const requestSchema = z.object({
  personality: z.string().min(1, 'Personality is required'),
  gender: z.enum(['male', 'female'] as const),
  color: z.enum(['red', 'yellow', 'green', 'blue'] as const),
});

function getRandomDefaultName(): string {
  const colors = Object.keys(defaultHeroNames) as HeroColor[];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return defaultHeroNames[randomColor];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = requestSchema.parse(body);

    try {
      const genAI = new GoogleGenerativeAI(getGeminiApiKey());
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Generate a superhero name based on the following characteristics:
        - Personality: ${validatedData.personality}
        - Gender: ${validatedData.gender}
        - Color theme: ${validatedData.color}
        
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
        return NextResponse.json({ name: getRandomDefaultName() });
      }

      return NextResponse.json({ name: text.trim() });
    } catch (error) {
      console.error('Error generating hero name:', error);
      return NextResponse.json({ name: getRandomDefaultName() });
    }
  } catch (error) {
    console.error('Error in hero name generation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate hero name' },
      { status: 500 }
    );
  }
}
