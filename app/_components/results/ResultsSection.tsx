'use client';

import { PersonalityType } from '../../_lib/types/personality';
import { UserData } from '../../_lib/types';
import { SuperheroCard } from './SuperheroCard';
import { PersonalityProfile } from './PersonalityProfile';
import { ResultsActions } from './ResultsActions';
import { useMemo } from 'react';

interface ResultsSectionProps {
  results: (PersonalityType & { percentage: number })[];
  photoUrl: string;
  userData: UserData;
  onReset: () => void;
  heroName: string;
}

export function ResultsSection({ 
  results, 
  photoUrl, 
  userData, 
  onReset, 
  heroName
}: ResultsSectionProps): JSX.Element {
  const scoreResults = useMemo(() => results.map(r => ({
    color: r.color,
    percentage: r.percentage
  })), [results]);

  const dominantPersonality = results[0];

  return (
    <div className="space-y-16">
      <div className="w-full max-w-md mx-auto pt-4 md:pt-6">
        <SuperheroCard
          photoUrl={photoUrl}
          personality={{ ...dominantPersonality, heroName }}
          userData={userData}
          results={scoreResults}
        />
      </div>

      <PersonalityProfile results={results} />

      <ResultsActions 
        printData={{
          photoUrl,
          name: userData.name,
          gender: userData.gender,
          heroName,
          personalityName: dominantPersonality.name,
          color: dominantPersonality.color,
          scores: scoreResults
        }}
        onReset={onReset}
      />
    </div>
  );
}
