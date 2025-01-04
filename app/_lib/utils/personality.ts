import { QuizResult } from '../types';
import { personalities } from '../../_data/personalities';
import type { PersonalityStyle } from '../../_data/personalities';

export function calculatePersonalityResults(answers: QuizResult): (PersonalityStyle & { percentage: number })[] {
  const values = Object.values(answers) as number[];
  const total = values.reduce((acc, curr) => acc + curr, 0);
  
  return personalities
    .map((personality) => ({
      ...personality,
      percentage: Math.round((answers[personality.color as keyof QuizResult] / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

export function getDominantPersonality(results: (PersonalityStyle & { percentage: number })[]): PersonalityStyle & { percentage: number } {
  return results[0];
}

export function getMatchingPersonality(color: string): PersonalityStyle | undefined {
  return personalities.find((p) => p.color === color);
}
