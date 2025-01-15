'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LatestHeroCard } from './LatestHeroCard';
import { HeroColor } from '@/app/_lib/types/api';
import type { LatestHeroWithId } from '@/app/api/latest-heroes/route';

interface LatestHero {
  id: number;
  name: string;
  userName: string;
  personalityType: string;
  imageId: string;
  color: HeroColor;
  gender: string;
  colorScores: Record<string, number>;
  createdAt: string;
}

export function LatestHeroesSection(): JSX.Element {
  const [heroes, setHeroes] = useState<LatestHero[]>([]);
  const lastFetchedIdRef = useRef<number | null>(null);

  const fetchLatestHeroes = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/latest-heroes');
      if (!response.ok) throw new Error('Failed to fetch heroes');
      
      const data = await response.json();
      
      if (!data.length) return;

      // Map the data to match our expected format
      const mappedData = data.map((hero: LatestHeroWithId) => ({
        id: hero.id,
        name: hero.name,
        userName: hero.userName || hero.name,
        personalityType: hero.personalityType,
        imageId: hero.imageId,
        color: hero.color as HeroColor,
        gender: hero.gender,
        colorScores: hero.colorScores,
        createdAt: hero.createdAt
      }));

      // Only update if we have new data
      setHeroes(currentHeroes => {
        if (currentHeroes.length === 0 || mappedData[0].id !== lastFetchedIdRef.current) {
          console.log('Updating heroes with new data:', mappedData);
          lastFetchedIdRef.current = mappedData[0].id;
          return mappedData;
        }
        return currentHeroes;
      });
    } catch (error) {
      console.error('Error fetching latest heroes:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLatestHeroes();
  }, [fetchLatestHeroes]); // Include fetchLatestHeroes in deps

  // Set up polling
  useEffect(() => {
    const interval = setInterval(fetchLatestHeroes, 20000);
    return () => clearInterval(interval);
  }, [fetchLatestHeroes]);


  console.log('Rendering heroes:', heroes.length, heroes);

  const reversedHeroes = [...heroes].reverse();
  console.log('Reversed heroes:', reversedHeroes.length, reversedHeroes);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center py-8 md:py-16">
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center">
          <AnimatePresence mode="sync">
            {reversedHeroes.map((hero) => (
              <LatestHeroCard
                key={hero.id}
                hero={hero}
                isNew={hero.id === lastFetchedIdRef.current && lastFetchedIdRef.current !== null}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
