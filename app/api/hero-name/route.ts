import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { defaultHeroNames, type HeroColor } from '../../_lib/constants/defaultNames';
import { getGeminiApiKey } from '../../_lib/config/env';

// Enhanced request validation
const requestSchema = z.object({
  personality: z.string()
    .min(1, 'Personality is required')
    .max(100, 'Personality description too long')
    // Prevent common injection patterns
    .regex(/^[a-zA-ZæøåÆØÅ\s,.-]+$/, 'Invalid characters in personality')
    .transform(str => str.trim()),
  gender: z.enum(['male', 'female'] as const),
  color: z.enum(['red', 'yellow', 'green', 'blue'] as const),
  language: z.enum(['en', 'no'] as const),
});

function getRandomDefaultName(): string {
  const colors = Object.keys(defaultHeroNames) as HeroColor[];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return defaultHeroNames[randomColor];
}

export const dynamic = 'force-dynamic'; // API routes should be dynamic

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate and sanitize request body
    const validatedData = requestSchema.parse(body);

    try {
      const genAI = new GoogleGenerativeAI(getGeminiApiKey());
      
      // Initialize model
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-pro'
      });

      // Structured prompt to prevent injection
      const prompt = [
        'Generate a superhero name with these exact characteristics:',
        `Personality: "${validatedData.personality}"`,
        `Gender: "${validatedData.gender}"`,
        `Color theme: "${validatedData.color}"`,
        '',
        'Rules:',
        '- Name must be 1-3 words',
        `- Must be in ${validatedData.language === 'no' ? 'Norwegian' : 'English'}`,
        '- No common terms like "man", "woman", "boy", "girl"',
        '- Must be creative and unique',
        '- Must reflect personality and color',
        '- Return ONLY the name, nothing else'
      ].join('\n');

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        console.error('[HeroName] Generation returned empty result');
        return NextResponse.json({ name: getRandomDefaultName() });
      }

      // Validate generated name
      const generatedName = text.trim();
      if (generatedName.length > 50) { // Sanity check on output
        console.error('[HeroName] Generated name too long:', generatedName);
        return NextResponse.json({ name: getRandomDefaultName() });
      }

      return NextResponse.json({ name: generatedName });
    } catch (error) {
      // Structured error logging
      console.error('[HeroName] Generation error:', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        personality: validatedData.personality,
        gender: validatedData.gender,
        color: validatedData.color
      });
      return NextResponse.json({ name: getRandomDefaultName() });
    }
  } catch (error) {
    // Structured error logging
    console.error('[HeroName] Request error:', {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof z.ZodError ? 'Validation Error' : 'Unknown Error'
    });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' }, // Don't expose internal error details
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' }, // Generic error message
      { status: 500 }
    );
  }
}
