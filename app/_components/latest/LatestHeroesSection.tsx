'use client';

import { useCallback, useEffect, useState } from 'react';
import { HeroCarousel } from './HeroCarousel';
import { HeroColor } from '@/app/_lib/types/api';

interface LatestHeroesSectionProps {
  selectedSessionId: string | null;
}

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

export function LatestHeroesSection({ selectedSessionId }: LatestHeroesSectionProps): JSX.Element {
  const [heroes, setHeroes] = useState<LatestHero[]>([]);

  const fetchHeroes = useCallback(async (): Promise<void> => {
    try {
      const params = new URLSearchParams();
      if (selectedSessionId) {
        params.set('sessionId', selectedSessionId);
      }
      
      const response = await fetch(`/api/latest-heroes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch heroes');
      const data = await response.json();
      setHeroes(data);
    } catch (error) {
      console.error('Error fetching heroes:', error);
    }
  }, [selectedSessionId]);

  // Initial fetch
  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  // Force re-fetch when session changes
  useEffect(() => {
    if (selectedSessionId !== null) {
      setHeroes([]); // Clear current heroes to show fresh data
      fetchHeroes();
    }
  }, [selectedSessionId, fetchHeroes]);

  // Set up polling
  useEffect(() => {
    const interval = setInterval(fetchHeroes, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchHeroes]);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center py-8 md:py-16">
      <div className="w-full max-w-screen-2xl mx-auto px-4">
        <HeroCarousel 
          key={selectedSessionId || 'all'} 
          initialHeroes={heroes} 
        />
      </div>
    </div>
  );
}
