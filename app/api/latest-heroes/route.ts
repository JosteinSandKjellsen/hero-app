import { NextResponse } from 'next/server';
import type { JsonValue } from '@prisma/client/runtime/library';
import { prisma } from '@/app/_lib/prisma';
import { z } from 'zod';

// Input validation schema
const HeroDataSchema = z.object({
  name: z.string().min(1),
  userName: z.string().min(1),
  personalityType: z.string().min(1),
  imageId: z.string().min(1),
  color: z.string().min(1),
  gender: z.string().min(1),
  colorScores: z.record(z.number())
});

export type LatestHeroWithId = {
  id: number;
  name: string;
  userName: string | null;
  personalityType: string;
  imageId: string;
  color: string;
  gender: string;
  colorScores: JsonValue;
  createdAt: Date;
};

// GET /api/latest-heroes
export async function GET(): Promise<NextResponse> {
  try {
    // Get latest heroes
    const allLatestHeroes = await prisma.$queryRaw<LatestHeroWithId[]>`
      WITH RankedHeroes AS (
        SELECT 
          id, name, "userName", "personalityType", "imageId", color, gender,
          "colorScores", "createdAt",
          ROW_NUMBER() OVER (PARTITION BY "imageId" ORDER BY "createdAt" DESC) as rn
        FROM "LatestHero"
      )
      SELECT 
        id, name, "userName", "personalityType", "imageId", color, gender,
        "colorScores", "createdAt"
      FROM RankedHeroes WHERE rn = 1
      ORDER BY "createdAt" DESC;
    `;

    // Delete duplicates in a separate query
    await prisma.$executeRaw`
      WITH RankedHeroes AS (
        SELECT id,
          ROW_NUMBER() OVER (PARTITION BY "imageId" ORDER BY "createdAt" DESC) as rn
        FROM "LatestHero"
      )
      DELETE FROM "LatestHero"
      WHERE id IN (
        SELECT id FROM RankedHeroes WHERE rn > 1
      );
    `;

    // Filter out duplicates keeping only the latest entry for each imageId
    const uniqueHeroes = allLatestHeroes.reduce((acc: LatestHeroWithId[], current: LatestHeroWithId) => {
      const x = acc.find(item => item.imageId === current.imageId);
      if (!x) {
        return [...acc, current];
      }
      return acc;
    }, [] as LatestHeroWithId[]);

    // Take only the first 3 and ensure dates are serializable
    const latestHeroes = uniqueHeroes.slice(0, 3).map((hero: LatestHeroWithId) => ({
      ...hero,
      createdAt: hero.createdAt.toISOString()
    }));

    console.log('Filtered heroes:', latestHeroes);

    return NextResponse.json(latestHeroes);
  } catch (error) {
    console.error('Failed to fetch latest heroes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest heroes' },
      { status: 500 }
    );
  }
}

// POST /api/latest-heroes
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const data = await request.json();
    
    // Validate input
    const validatedData = HeroDataSchema.parse(data);
    
    const newHero = await prisma.latestHero.upsert({
      where: {
        imageId: validatedData.imageId
      },
      update: {
        name: validatedData.name,
        userName: validatedData.userName,
        personalityType: validatedData.personalityType,
        color: validatedData.color,
        gender: validatedData.gender,
        colorScores: validatedData.colorScores,
        createdAt: new Date()
      },
      create: {
        name: validatedData.name,
        userName: validatedData.userName,
        personalityType: validatedData.personalityType,
        imageId: validatedData.imageId,
        color: validatedData.color,
        gender: validatedData.gender,
        colorScores: validatedData.colorScores
      }
    });

    // Ensure all fields are JSON serializable
    const result = {
      ...newHero,
      createdAt: newHero.createdAt.toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to add latest hero:', error);
    return NextResponse.json(
      { error: 'Failed to add latest hero' },
      { status: 500 }
    );
  }
}
