'use client';

import { useState, useEffect } from 'react';
import { generateHeroName } from '@/app/actions/generateHeroName';
import type { HeroColor } from '@/app/_types/api';

interface UseHeroNameProps {
  personality: string;
  gender: 'male' | 'female';
  color: string;
}

export function useHeroName({ personality, gender, color }: UseHeroNameProps) {
  const [heroName, setHeroName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function getHeroName() {
      if (!personality || !gender || !color) return;
      
      try {
        const name = await fetch('/api/hero-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ personality, gender, color }),
        }).then(res => res.json());

        if (isMounted && name) {
          setHeroName(name.name);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error generating hero name:', error);
          setError(error instanceof Error ? error.message : 'Failed to generate hero name');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    getHeroName();

    return () => {
      isMounted = false;
    };
  }, [personality, gender, color]);

  return {
    heroName,
    isLoading,
    error
  };
}