'use client';

import { PersonalityType } from '../../_lib/types/personality';
import { PersonalityCard } from './PersonalityCard';
import { MatchingTip } from './MatchingTip';

interface PersonalityProfileProps {
  results: (PersonalityType & { percentage: number })[];
}

export function PersonalityProfile({ results }: PersonalityProfileProps): JSX.Element {
  const dominantPersonality = results[0];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bangers tracking-wide text-center mb-8 text-purple-900">
        Din Superhelt-Profil
      </h2>
      
      <MatchingTip color={dominantPersonality.color as 'red' | 'yellow' | 'green' | 'blue'} />
      
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
