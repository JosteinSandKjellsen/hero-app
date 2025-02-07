'use client';

import { useState } from 'react';
import { defaultHeroNames } from '../_lib/constants/defaultNames';
import type { HeroColor } from '../_lib/types/api';

interface HeroNameResponse {
  name: string;
  error?: string;
}

interface UseHeroNameReturn {
  generateHeroName: (
    personality: string,
    gender: 'male' | 'female',
    color: HeroColor,
    scores: {
      red: number;
      yellow: number;
      green: number;
      blue: number;
    }
  ) => Promise<string>;
  isGenerating: boolean;
}

export function useHeroName(): UseHeroNameReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateHeroName = async (
    personality: string,
    gender: 'male' | 'female',
    color: HeroColor,
    scores: {
      red: number;
      yellow: number;
      green: number;
      blue: number;
    }
  ): Promise<string> => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/hero-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personality, gender, color, scores }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hero name');
      }

      const data: HeroNameResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.name || defaultHeroNames[color];
    } catch (error) {
      console.error('Error generating hero name:', error);
      return defaultHeroNames[color];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateHeroName,
    isGenerating
  };
}
