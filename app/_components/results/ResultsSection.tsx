'use client';

import { useRef } from 'react';
import { PersonalityType, UserData } from '@/app/_types';
import { SuperheroCard } from './SuperheroCard';
import { PersonalityProfile } from './PersonalityProfile';
import { ResultsActions } from './ResultsActions';

interface ResultsSectionProps {
  results: (PersonalityType & { percentage: number })[];
  photoUrl: string;
  userData: UserData;
  onReset: () => void;
  heroName: string;
}

export function ResultsSection({ results, photoUrl, userData, onReset, heroName }: ResultsSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const dominantPersonality = results[0];

  const scoreResults = results.map(r => ({
    color: r.color,
    percentage: r.percentage
  }));

  return (
    <div className="space-y-12">
      <div className="w-full max-w-md mx-auto">
        <SuperheroCard
          photoUrl={photoUrl}
          personality={{ ...dominantPersonality, heroName }}
          userData={userData}
          results={scoreResults}
        />
        
        <div 
          ref={cardRef}
          className="fixed left-[-9999px] opacity-0 pointer-events-none"
          aria-hidden="true"
        >
          <SuperheroCard
            photoUrl={photoUrl}
            personality={{ ...dominantPersonality, heroName }}
            userData={userData}
            results={scoreResults}
          />
        </div>
      </div>

      <PersonalityProfile results={results} />

      <ResultsActions 
        cardRef={cardRef}
        heroName={heroName}
        onReset={onReset}
      />
    </div>
  );
}