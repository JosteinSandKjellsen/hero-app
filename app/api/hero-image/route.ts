import { NextRequest, NextResponse } from 'next/server';
import { generateHeroImage } from '../../actions/generateHeroImage';
import { heroImageRequestSchema } from '../../_lib/utils/validation/apiValidation';
import { ApiError } from '../../_lib/errors';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Add request size check
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    let validatedData;
    try {
      validatedData = heroImageRequestSchema.parse(body);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Log the size of the photo if present
    if (validatedData.originalPhoto) {
      const photoSize = Math.ceil((validatedData.originalPhoto.length * 3) / 4); // Approximate base64 size
      console.log(`Processing photo of size: ${photoSize} bytes`);
    }

    try {
      const imageUrl = await generateHeroImage(
        validatedData.personality,
        validatedData.gender,
        validatedData.color,
        validatedData.originalPhoto
      );
      return NextResponse.json({ imageUrl });
    } catch (generationError) {
      console.error('Error in hero image generation:', generationError);
      
      if (generationError instanceof ApiError) {
        return NextResponse.json(
          { error: generationError.message },
          { status: generationError.statusCode }
        );
      }

      // Log detailed error information
      if (generationError instanceof Error) {
        console.error('Detailed error:', {
          name: generationError.name,
          message: generationError.message,
          stack: generationError.stack,
        });
      }

      return NextResponse.json(
        { error: 'Failed to generate hero image' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
