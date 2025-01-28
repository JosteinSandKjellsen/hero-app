import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey } from '../../_lib/config/env';

// Request validation schema
const requestSchema = z.object({
  personality: z.string()
    .min(1, 'Personality is required')
    .max(100, 'Personality description too long')
    .regex(/^[a-zA-ZæøåÆØÅ\s,.-]+$/, 'Invalid characters in personality')
    .transform(str => str.trim()),
  gender: z.enum(['male', 'female', 'robot'] as const),
  color: z.enum(['red', 'yellow', 'green', 'blue'] as const),
  language: z.enum(['en', 'no'] as const),
  heroName: z.string()
    .min(1, 'Hero name is required')
    .max(50, 'Hero name too long')
    .transform(str => str.trim()),
});

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    try {
      const genAI = new GoogleGenerativeAI(getGeminiApiKey());
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = [
        `Create a short, funny superhero story about ${validatedData.heroName} in ${validatedData.language === 'no' ? 'Norwegian' : 'English'}.`,
        `The story should include:`,
        `- Personality traits: ${validatedData.personality}`,
        `- Color theme: ${validatedData.color}`,
        `- Gender: ${validatedData.gender}`,
        '',
        'Rules:',
        '- Keep it under 200 words',
        '- Use a humorous tone',
        '- Include at least one funny situation',
        '- Make it appropriate for all ages',
        '- Return ONLY the story text, nothing else'
      ].join('\n');

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        console.error('[HeroStory] Generation returned empty result');
        return NextResponse.json({ story: 'Failed to generate story' }, { status: 500 });
      }

      return NextResponse.json({ story: text.trim() });
    } catch (error) {
      console.error('[HeroStory] Generation error:', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        ...validatedData
      });
      return NextResponse.json({ story: 'Failed to generate story' }, { status: 500 });
    }
  } catch (error) {
    console.error('[HeroStory] Request error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof z.ZodError ? 'Validation Error' : 'Unknown Error'
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
