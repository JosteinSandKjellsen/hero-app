import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { z } from 'zod';
import { LeonardoAiService } from '@/app/_lib/services/leonardoAi';

// Input validation schema for DELETE
const DeleteHeroSchema = z.object({
  id: z.number()
});

export type GeneratedHeroWithId = {
  id: number;
  name: string;
  userName: string | null;
  imageId: string;
  color: string;
  createdAt: Date;
  printed: boolean;
};

// GET /api/generated-heroes
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await prisma.latestHero.count();

    // Get heroes for current page
    const generatedHeroes = await prisma.latestHero.findMany({
      select: {
        id: true,
        name: true,
        userName: true,
        imageId: true,
        color: true,
        gender: true,
        personalityType: true,
        colorScores: true,
        createdAt: true,
        printed: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: pageSize
    });

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / pageSize);

    // Ensure dates are serializable
    const serializedHeroes = generatedHeroes.map((hero) => ({
      ...hero,
      createdAt: hero.createdAt.toISOString()
    }));

    return NextResponse.json({
      heroes: serializedHeroes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount
      }
    });
  } catch (error) {
    console.error('Failed to fetch generated heroes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generated heroes' },
      { status: 500 }
    );
  }
}

// DELETE /api/generated-heroes
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const data = await request.json();
    
    // Validate input
    const validatedData = DeleteHeroSchema.parse(data);
    
    // Get hero details before deletion
    const hero = await prisma.latestHero.findUnique({
      where: { id: validatedData.id },
      select: { imageId: true }
    });

    if (!hero) {
      return NextResponse.json(
        { error: 'Hero not found' },
        { status: 404 }
      );
    }

    // Initialize Leonardo service and delete images - generated first since it's guaranteed to exist
    const leonardoService = new LeonardoAiService();
    try {
      // Delete images and log results
      const generatedDeleted = await leonardoService.deleteImage(hero.imageId, 'generated');
      console.log(`Generated image deletion ${generatedDeleted ? 'succeeded' : 'failed'} for ID ${hero.imageId}`);

      const initialDeleted = await leonardoService.deleteImage(hero.imageId, 'initial');
      console.log(`Initial image deletion ${initialDeleted ? 'succeeded' : 'failed'} for ID ${hero.imageId}`);

      if (!generatedDeleted) {
        console.error(`Failed to delete generated image for hero ${hero.imageId}`);
      }
    } catch (error) {
      console.error('Error deleting Leonardo images:', error);
      // Continue with database deletion even if image deletion fails
    }

    // Get hero details before deleting from HeroStats
    const heroToDelete = await prisma.latestHero.findUnique({
      where: { id: validatedData.id },
      select: { color: true, createdAt: true }
    });

    if (heroToDelete) {
      // Delete from both tables in a transaction
      await prisma.$transaction([
        // Delete from LatestHero first (due to foreign key constraints)
        prisma.latestHero.delete({
          where: {
            id: validatedData.id
          }
        }),
        // Then delete from HeroStats
        prisma.heroStats.deleteMany({
          where: {
            AND: [
              { color: heroToDelete.color },
              { createdAt: heroToDelete.createdAt }
            ]
          }
        })
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
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
