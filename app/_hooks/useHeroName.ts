'use client';

import { useState } from 'react';
import { defaultHeroNames } from '@/app/_lib/constants/defaultNames';
import type { HeroColor } from '@/app/_lib/constants/defaultNames';

interface HeroNameResponse {
  name: string;
  error?: string;
}

export function useHeroName() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateHeroName = async (
    personality: string,
    gender: 'male' | 'female',
    color: string
  ): Promise<string> => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/hero-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ personality, gender, color }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hero name');
      }

      const data: HeroNameResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.name || defaultHeroNames[color as HeroColor];
    } catch (error) {
      console.error('Error generating hero name:', error);
      return defaultHeroNames[color as HeroColor];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateHeroName,
    isGenerating
  };
}