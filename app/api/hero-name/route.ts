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
  gender: z.enum(['male', 'female', 'robot'] as const),
  color: z.enum(['red', 'yellow', 'green', 'blue'] as const),
  language: z.enum(['en', 'no'] as const),
  scores: z.object({
    red: z.number(),
    yellow: z.number(),
    green: z.number(),
    blue: z.number()
  })
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
      
      // Initialize model with maximum creativity settings
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 1.0,    // Maximum creativity
          topP: 0.95,         // Very diverse sampling
          topK: 40,           // Consider more token options
          maxOutputTokens: 20  // Keep names concise
        }
      });

      // Structured prompt to prevent injection and encourage unique names
      const prompt = [
        'Generate a highly unique and creative superhero name. STRICTLY AVOID common patterns, generic combinations, or predictable word pairs.',
        'IMPORTANT: Each generated name must be completely different from typical superhero names.',
        `Personality: "${validatedData.personality}"`,
        `Gender: "${validatedData.gender}"`,
        `Color theme: "${validatedData.color}"`,
        '',
        'Personality Score Analysis:',
        `Red (Power/Confidence): ${validatedData.scores.red}%`,
        `Yellow (Energy/Creativity): ${validatedData.scores.yellow}%`,
        `Green (Harmony/Balance): ${validatedData.scores.green}%`,
        `Blue (Logic/Intelligence): ${validatedData.scores.blue}%`,
        '',
        'Rules:',
        '- IMPORTANT: Vary between 1, 2, and 3 word names with equal probability',
        '- Avoid common superhero name patterns and overused words',
        '- Name should reflect the personality scores, especially high-scoring traits',
        '- Create unexpected and imaginative word combinations',
        `- Must be in ${validatedData.language === 'no' ? 'Norwegian' : 'English'}`,
        '- Draw inspiration from unconventional sources like quantum physics, ancient folklore, or abstract concepts',
        '- Must be highly creative and unique',
        '- Should reflect personality and color in unexpected ways',
        '- Return ONLY the name, nothing else'
      ].join('\n');

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        console.error('[HeroName] Generation returned empty result');
        return NextResponse.json({ name: getRandomDefaultName() });
      }

      const generatedName = text.trim();
      
      if (generatedName.length > 50) {
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
