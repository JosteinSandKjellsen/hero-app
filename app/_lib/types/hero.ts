import { LatestHero as PrismaLatestHero } from '@prisma/client';

export type LatestHeroCreate = {
  name: string;
  userName: string;
  personalityType: string;
  imageId: string;
  color: string;
  gender: string;
  colorScores: Record<string, number>;
};

export type LatestHero = PrismaLatestHero;
