import { LatestHero as PrismaLatestHero } from '@prisma/client';

export type GenderType = 'male' | 'female' | 'robot';
export type HeroColor = 'red' | 'yellow' | 'green' | 'blue';
export type Language = 'en' | 'no';

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

export interface Hero {
  id: string;
  name: string;
  imageUrl: string;
  personality: string;
  color: HeroColor;
  gender: GenderType;
  createdAt: Date;
  updatedAt: Date;
}
