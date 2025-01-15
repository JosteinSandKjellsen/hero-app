'use client';

import { PersonalityType } from '../../_lib/types/personality';
import { UserData } from '../../_lib/types';
import { SuperheroCard } from './SuperheroCard';
import { PersonalityProfile } from './PersonalityProfile';
import { ResultsActions } from './ResultsActions';
import { useEffect, useMemo, useRef } from 'react';

interface ResultsSectionProps {
  results: (PersonalityType & { percentage: number })[];
  photoUrl: string;
  userData: UserData;
  onReset: () => void;
  heroName: string;
}

export function ResultsSection({ results, photoUrl, userData, onReset, heroName }: ResultsSectionProps): JSX.Element {
  const scoreResults = useMemo(() => results.map(r => ({
    color: r.color,
    percentage: r.percentage
  })), [results]);

  const hasSavedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Save to latest heroes
    const saveToLatestHeroes = async (): Promise<void> => {
      try {
        // Check if already saved to prevent double saves
        if (!mounted || hasSavedRef.current) return;
        const dominantPersonality = results[0];
        // Extract generation ID from the URL
        const match = photoUrl.match(/generations\/([^/]+)\//) || [];
        const imageId = match[1];
        
        if (!imageId) {
          console.error('Could not extract generation ID from URL:', photoUrl);
          return;
        }

        await fetch('/api/latest-heroes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: heroName,
            userName: userData.name,
            personalityType: dominantPersonality.name,
            imageId,
            color: dominantPersonality.color,
            gender: userData.gender,
            promptStyle: 'default', // You might want to make this dynamic if you have different styles
            basePrompt: `Generate a ${userData.gender === 'male' ? 'male' : 'female'} superhero with ${dominantPersonality.color} color scheme`,
            negativePrompt: null,
            colorScores: scoreResults.reduce((acc, { color, percentage }) => ({
              ...acc,
              [color]: Math.round(percentage / 10)
            }), {}),
          }),
        });
        hasSavedRef.current = true;
      } catch (error) {
        console.error('Failed to save to latest heroes:', error);
      }
    };

    saveToLatestHeroes();

    return () => {
      mounted = false;
    };
  }, [results, photoUrl, userData, heroName, scoreResults]);

  const dominantPersonality = results[0];

  return (
    <div className="space-y-12">
      <div className="w-full max-w-md mx-auto">
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
