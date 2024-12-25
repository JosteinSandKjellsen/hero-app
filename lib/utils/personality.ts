import { QuizResult, PersonalityType } from '../../app/_lib/types';
import { personalities } from '../../app/_data/personalities';

export function calculatePersonalityResults(answers: QuizResult): (PersonalityType & { percentage: number })[] {
  const values = Object.values(answers) as number[];
  const total = values.reduce((acc, curr) => acc + curr, 0);
  
  return personalities
    .map((personality: PersonalityType) => ({
      ...personality,
      percentage: Math.round((answers[personality.color as keyof QuizResult] / total) * 100),
    }))
    .sort((a: PersonalityType & { percentage: number }, b: PersonalityType & { percentage: number }): number => b.percentage - a.percentage);
}

export function getDominantPersonality(results: (PersonalityType & { percentage: number })[]): PersonalityType & { percentage: number } {
  return results[0];
}

export function getMatchingPersonality(color: string): PersonalityType | undefined {
  return personalities.find((p: PersonalityType): boolean => p.color === color);
}
