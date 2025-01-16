import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';
import { z } from 'zod';

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
    // Delete heroes older than a month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    await prisma.latestHero.deleteMany({
      where: {
        createdAt: {
          lt: oneMonthAgo
        }
      }
    });

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
    
    // Delete the hero
    await prisma.latestHero.delete({
      where: {
        id: validatedData.id
      }
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
