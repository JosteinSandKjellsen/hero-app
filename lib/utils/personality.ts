import { Result, PersonalityType } from '@/types';
import { personalities } from '@/data/personalities';

export function calculatePersonalityResults(answers: Result): (PersonalityType & { percentage: number })[] {
  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  
  return personalities
    .map(personality => ({
      ...personality,
      percentage: Math.round((answers[personality.color as keyof Result] / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

export function getDominantPersonality(results: (PersonalityType & { percentage: number })[]) {
  return results[0];
}

export function getMatchingPersonality(color: string): PersonalityType | undefined {
  return personalities.find(p => p.color === color);
}