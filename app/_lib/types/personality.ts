import type { HeroColor } from './api';

export interface PersonalityType {
  color: HeroColor;
  bgClass: string;
  textClass: string;
  name: string;
  heroName: string;
}

export interface PersonalityResult extends PersonalityType {
  percentage: number;
}
