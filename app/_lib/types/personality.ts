import type { HeroColor } from './api';

export interface PersonalityType {
  name: string;
  color: HeroColor;
  heroName: string;
  description: string;
  traits: string[];
  bgClass: string;
  textClass: string;
}

export interface PersonalityResult extends PersonalityType {
  percentage: number;
}