import { NextRequest, NextResponse } from 'next/server';
import { generateHeroImage } from '@/app/actions/generateHeroImage';
import { heroImageRequestSchema } from '@/app/_lib/utils/validation/apiValidation';
import { ApiError } from '@/app/_lib/errors';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = heroImageRequestSchema.parse(body);

    const imageUrl = await generateHeroImage(
      validatedData.personality,
      validatedData.gender,
      validatedData.color
    );

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error in hero image generation:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate hero image' },
      { status: 500 }
    );
  }
}