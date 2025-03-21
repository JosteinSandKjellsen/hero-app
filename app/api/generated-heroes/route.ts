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
  carousel: boolean;
};

// GET /api/generated-heroes
export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    // Use a single transaction for count and data fetch to ensure consistency
    const [totalCount, generatedHeroes] = await prisma.$transaction([
      prisma.latestHero.count(),
      prisma.latestHero.findMany({
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
          printed: true,
          carousel: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: pageSize
      })
    ]);

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
