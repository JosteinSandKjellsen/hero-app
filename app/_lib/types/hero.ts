import { LatestHero as PrismaLatestHero } from '@prisma/client';

export type GenderType = 'male' | 'female' | 'robot';

export type LatestHeroCreate = {
  name: string;
  userName: string;
  personalityType: string;
  imageId: string;
  color: string;
  gender: GenderType;
  colorScores: Record<string, number>;
};

export type LatestHero = PrismaLatestHero;
