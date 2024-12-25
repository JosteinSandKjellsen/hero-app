import { NextRequest, NextResponse } from 'next/server';
import { generateHeroName } from '@/app/actions/generateHeroName';
import { z } from 'zod';

const requestSchema = z.object({
  personality: z.string().min(1, 'Personality is required'),
  gender: z.enum(['male', 'female'] as const),
  color: z.enum(['red', 'yellow', 'green', 'blue'] as const),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = requestSchema.parse(body);

    const name = await generateHeroName(
      validatedData.personality,
      validatedData.gender,
      validatedData.color
    );

    return NextResponse.json({ name });
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
