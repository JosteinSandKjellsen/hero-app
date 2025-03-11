'use client';

import { useCallback, useEffect, useState } from 'react';
import { HeroCarousel } from './HeroCarousel';
import { HeroColor } from '@/app/_lib/types/api';
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
  carousel: boolean;
}

const POLL_INTERVAL = 60000; // 1 minute in milliseconds

export function LatestHeroesSection(): JSX.Element {
  const [heroes, setHeroes] = useState<LatestHero[]>([]);

  const fetchHeroes = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/latest-heroes');
      if (!response.ok) throw new Error('Failed to fetch heroes');
      const data = await response.json();
      setHeroes(data);
    } catch (error) {
      console.error('Error fetching heroes:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  // Set up polling
  useEffect(() => {
    const interval = setInterval(fetchHeroes, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchHeroes]);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center py-8 md:py-16">
      <div className="w-full max-w-screen-2xl mx-auto px-4">
        <HeroCarousel initialHeroes={heroes} />
      </div>
    </div>
  );
}
