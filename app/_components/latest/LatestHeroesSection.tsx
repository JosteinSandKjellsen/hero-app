'use client';

import { useEffect, useState } from 'react';
import { HeroCarousel } from './HeroCarousel';
import { HeroColor } from '@/app/_lib/types/api';
import type { DailyHero } from '@/app/api/heroes/daily-latest/route';

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

interface StoredHeroes {
  data: LatestHero[];
  timestamp: number;
}

const STORAGE_KEY = 'dailyHeroes';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

export function LatestHeroesSection(): JSX.Element {
  const [heroes, setHeroes] = useState<LatestHero[]>([]);

  const fetchDailyHeroes = async (): Promise<void> => {
    try {
      const response = await fetch('/api/heroes/daily-latest');
      if (!response.ok) throw new Error('Failed to fetch heroes');
      
      const data = await response.json();
      
      if (!data.length) return;

      // Map the data to match our expected format
      const mappedData = data.map((hero: DailyHero) => ({
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

      // Update state and store in localStorage
      setHeroes(mappedData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data: mappedData,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error('Error fetching daily heroes:', error);
    }
  };

  // Load initial data from localStorage or fetch if not available/stale
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { data, timestamp } = JSON.parse(stored) as StoredHeroes;
      const isFresh = Date.now() - timestamp < CACHE_DURATION;
      if (isFresh) {
        setHeroes(data);
        return;
      }
    }
    fetchDailyHeroes();
  }, []);

  // Set up polling every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchDailyHeroes, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center py-8 md:py-16">
      <div className="w-full max-w-screen-2xl mx-auto px-4">
        <HeroCarousel heroes={heroes} />
      </div>
    </div>
  );
}
