import type { HeroColor } from './api';

export interface QuizQuestion {
  id: number;
  options: QuizOption[];
}

export interface QuizOption {
  type: HeroColor;
}

export interface QuizResult {
  red: number;
  yellow: number;
  green: number;
  blue: number;
}

export interface UserData {
  name: string;
  gender: 'male' | 'female' | 'robot';
}
