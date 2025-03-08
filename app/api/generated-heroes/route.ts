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
};

// GET /api/generated-heroes
export async function GET(): Promise<NextResponse> {
  try {
    // Get total count of heroes
    const totalCount = await prisma.latestHero.count();

    // If we have more than 50 heroes, delete the oldest ones
    if (totalCount > 50) {
      const heroesToKeep = await prisma.latestHero.findMany({
        select: { id: true },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      // Get heroes to delete
      const heroesToDelete = await prisma.latestHero.findMany({
        where: {
          id: {
            notIn: heroesToKeep.map(h => h.id)
          }
        },
        select: {
          id: true,
          imageId: true,
          createdAt: true
        }
      });

      // Delete images from Leonardo.ai - generated first since they're guaranteed to exist
      const leonardoService = new LeonardoAiService();
      for (const hero of heroesToDelete) {
        try {
          await leonardoService.deleteImage(hero.imageId, 'generated');
          // Try to delete initial image but ignore errors since it might not exist
          await leonardoService.deleteImage(hero.imageId, 'initial').catch(() => {
            // Ignore errors for initial image deletion since it might not exist
          });
        } catch (error) {
          console.error(`Error deleting Leonardo images for hero ${hero.id}:`, error);
          // Continue with next hero even if image deletion fails
        }
      }

    // Delete heroes from both tables
    await Promise.all([
      // Delete from LatestHero table
      prisma.latestHero.deleteMany({
        where: {
          id: {
            notIn: heroesToKeep.map(h => h.id)
          }
        }
      }),
      // Delete from HeroStats for the same time period
      prisma.heroStats.deleteMany({
        where: {
          createdAt: {
            lte: heroesToDelete[heroesToDelete.length - 1]?.createdAt // Using the oldest hero's date
          }
        }
      })
    ]);
    }

    // Get latest 50 heroes
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
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // Ensure dates are serializable
    const serializedHeroes = generatedHeroes.map((hero) => ({
      ...hero,
      createdAt: hero.createdAt.toISOString()
    }));

    return NextResponse.json(serializedHeroes);
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
      // Always delete the generated image first
      await leonardoService.deleteImage(hero.imageId, 'generated');
      // Try to delete the initial image, which may or may not exist
      await leonardoService.deleteImage(hero.imageId, 'initial').catch(() => {
        // Ignore errors for initial image deletion since it might not exist
      });
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
      // Delete from both tables
      await Promise.all([
        // Delete from LatestHero
        prisma.latestHero.delete({
          where: {
            id: validatedData.id
          }
        }),
        // Delete from HeroStats
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
