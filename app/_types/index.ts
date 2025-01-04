import type { HeroColor } from '../_lib/types/api';

export interface PersonalityType {
  name: string;
  color: HeroColor;
  heroName: string;
  description: string;
  traits: string[];
  bgClass: string;
  textClass: string;
}

export interface LayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  variant?: LayoutVariant;
}

export type LayoutVariant = 'registration' | 'quiz' | 'camera' | 'results';
