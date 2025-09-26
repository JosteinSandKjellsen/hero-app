import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { z } from 'zod';

const UpdateCarouselSchema = z.object({
  id: z.number(),
  carousel: z.boolean()
});

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const data = await request.json();
    const validatedData = UpdateCarouselSchema.parse(data);

    const updatedHero = await prisma.latestHero.update({
      where: { id: validatedData.id },
      data: { carousel: validatedData.carousel }
    });

    return NextResponse.json({
      success: true,
      hero: updatedHero
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to update hero carousel status:', error);
    return NextResponse.json(
      { error: 'Failed to update hero carousel status' },
      { status: 500 }
    );
  }
}
