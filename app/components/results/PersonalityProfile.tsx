'use client';

import { PersonalityType } from '@/types';
import { PersonalityCard } from './PersonalityCard';

interface PersonalityProfileProps {
  results: (PersonalityType & { percentage: number })[];
}

export function PersonalityProfile({ results }: PersonalityProfileProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bangers tracking-wide text-center mb-8 text-purple-900">
        Din Superhelt-Profil
      </h2>
      {results.map((result) => (
        <PersonalityCard
          key={result.color}
          personality={result}
          percentage={result.percentage}
        />
      ))}
    </div>
  );
}