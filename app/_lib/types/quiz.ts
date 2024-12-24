import type { HeroColor } from './api';

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

export interface UserData {
  name: string;
  gender: 'male' | 'female';
}