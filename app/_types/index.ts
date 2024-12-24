export type HeroColor = 'red' | 'yellow' | 'green' | 'blue';

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  text: string;
  type: HeroColor;
}

export interface QuizResult {
  red: number;
  yellow: number;
  green: number;
  blue: number;
}

export interface PersonalityType {
  name: string;
  color: HeroColor;
  heroName: string;
  description: string;
  traits: string[];
  bgClass: string;
  textClass: string;
}

export interface UserData {
  name: string;
  gender: 'male' | 'female';
}

export interface LayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  variant?: LayoutVariant;
}

export type LayoutVariant = 'registration' | 'quiz' | 'camera' | 'results';