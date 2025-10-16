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
    
    // Get hero details using raw SQL to bypass Prisma bug
    const heroes: Array<{ imageId: string; color: string; createdAt: Date }> = await prisma.$queryRaw`
      SELECT "imageId", color, "createdAt"
      FROM "LatestHero"
      WHERE id = ${validatedData.id}
    `;

    if (heroes.length === 0) {
      return NextResponse.json(
        { error: 'Hero not found' },
        { status: 404 }
      );
    }

    const hero = heroes[0];

    // Initialize Leonardo service and delete images
    // Continue with database deletion even if Leonardo deletion fails
    const leonardoService = new LeonardoAiService();
    await Promise.allSettled([
      leonardoService.deleteImage(hero.imageId, 'generated'),
      leonardoService.deleteImage(hero.imageId, 'initial')
    ]);

    // Delete from database using raw SQL to bypass Prisma bug
    await prisma.$executeRaw`
      DELETE FROM "LatestHero" WHERE id = ${validatedData.id}
    `;

    // Delete related stats
    await prisma.$executeRaw`
      DELETE FROM "HeroStats" 
      WHERE color = ${hero.color} 
      AND "createdAt" = ${hero.createdAt}
    `;

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
