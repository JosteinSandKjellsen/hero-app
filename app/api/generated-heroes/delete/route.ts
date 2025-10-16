import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { z } from 'zod';
import { LeonardoAiService } from '@/app/_lib/services/leonardoAi';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Input validation schema for DELETE
const DeleteHeroSchema = z.object({
  id: z.number()
});

// DELETE /api/generated-heroes/delete
// Protected endpoint - requires authentication
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const data = await request.json();
    
    // Validate input
    const validatedData = DeleteHeroSchema.parse(data);
    
    // Get hero details and perform deletion in a single transaction
    await prisma.$transaction(async (prisma) => {
      const hero = await prisma.latestHero.findUnique({
        where: { id: validatedData.id },
        select: { 
          imageId: true,
          color: true,
          createdAt: true
        }
      });

      if (!hero) {
        throw new Error('Hero not found');
      }

      // Initialize Leonardo service and delete images
      const leonardoService = new LeonardoAiService();
      try {
        await Promise.all([
          leonardoService.deleteImage(hero.imageId, 'generated'),
          leonardoService.deleteImage(hero.imageId, 'initial')
        ]);
      } catch (error) {
        console.error('Error deleting Leonardo images:', error);
        // Continue with database deletion even if image deletion fails
      }

      // Delete from both tables
      await Promise.all([
        prisma.latestHero.delete({
          where: { id: validatedData.id }
        }),
        prisma.heroStats.deleteMany({
          where: {
            AND: [
              { color: hero.color },
              { createdAt: hero.createdAt }
            ]
          }
        })
      ]);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to delete hero:', error);
    return NextResponse.json(
      { error: 'Failed to delete hero' },
      { status: 500 }
    );
  }
}
