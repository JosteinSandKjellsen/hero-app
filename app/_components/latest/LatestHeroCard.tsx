'use client';

import { forwardRef, CSSProperties } from 'react';
import Image from 'next/image';
import { HeroImage } from '../ui/HeroImage';
import { getPersonalityIcon } from '@/app/_lib/utils/personalityIcons';
import { getHeroCardIcon } from '@/app/_lib/utils/heroCardIcons';
import { HeroColor } from '@/app/_lib/types/api';
import { heroColors } from '@/app/_lib/constants/colors';

interface LatestHeroCardProps {
  hero: {
    name: string;
    userName: string | null;
    personalityType: string;
    imageId: string;
    color: HeroColor;
    gender: string;
    colorScores: Record<string, number>;
  };
  style?: CSSProperties;
}

const calculateProportionalScores = (colorScores: Record<string, number>): Record<string, number> => {
  const sum = Object.values(colorScores).reduce((acc, val) => acc + val, 0);
  if (sum === 0) return { red: 0, yellow: 0, green: 0, blue: 0 };
  
  // Calculate initial proportional scores
  const rawScores: Record<string, number> = {};
  Object.entries(colorScores).forEach(([color, percentage]) => {
    rawScores[color] = (percentage / sum) * 10;
  });
  
  // Handle rounding to ensure sum is exactly 10
  const flooredScores: Record<string, number> = {};
  Object.entries(rawScores).forEach(([color, score]) => {
    flooredScores[color] = Math.floor(score);
  });
  
  const remainder = 10 - Object.values(flooredScores).reduce((a, b) => a + b, 0);
  
  // Distribute remaining points based on decimal parts
  const decimalParts = Object.entries(rawScores).map(([color, score]) => ({
    color,
    decimal: score - flooredScores[color]
  }));
  decimalParts.sort((a, b) => b.decimal - a.decimal);
  
  const finalScores = { ...flooredScores };
  for (let i = 0; i < remainder; i++) {
    finalScores[decimalParts[i].color]++;
  }
  
  return finalScores;
};

export const LatestHeroCard = forwardRef<HTMLDivElement, LatestHeroCardProps>(
  function LatestHeroCard({ hero, style }, ref): JSX.Element {
  const scores = calculateProportionalScores(hero.colorScores);

  const getColorValue = (color: string): string => {
    switch (color) {
      case 'red': return '#A82039';
      case 'yellow': return '#F0A45B';
      case 'green': return '#007C4D';
      case 'blue': return '#2D3A82';
      default: return '#11133C';
    }
  };

  const getBorderColorClass = (): string => {
    return heroColors[hero.color]?.border || 'border-purple';
  };

  return (
      <div
        ref={ref}
        className="w-full transition-transform duration-500"
        style={style}
      >
        <div 
        className={`rounded-xl overflow-hidden border-[10px] ${getBorderColorClass()} bg-white flex flex-col h-[720px]`}
      >
        <div className="h-20 flex items-center px-6 border-b-2 border-opacity-20">
          <div className="flex items-center gap-4 flex-1">
            <div 
              className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center personality-icon"
              style={{ backgroundColor: getColorValue(hero.color) }}
            >
              <div className="scale-150">
                {getPersonalityIcon(hero.color)}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className={`text-2xl font-bangers tracking-wide ${heroColors[hero.color]?.text} leading-none mb-1`}>
                {hero.name}
              </h3>
              <p className="text-xs text-gray-600 uppercase tracking-wider font-medium leading-none">
                {hero.personalityType}
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <HeroImage
            imageId={hero.imageId}
            alt={hero.name}
            className="rounded-none"
            priority
          />
          <div className="absolute bottom-3 right-3 bg-white/30 backdrop-blur-sm py-1.5 rounded-full flex items-center justify-center w-[6.25rem]" style={{ backdropFilter: 'blur(4px)' }}>
            <Image
              src="/images/logos/bouvet.svg"
              alt="Bouvet Logo"
              width={100}
              height={50}
              className="w-12 h-6"
              priority
            />
          </div>
        </div>

        <div className="p-4 border-t-2 border-opacity-20 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-4">
            <div className="text-sm font-bangers tracking-wide text-gray-700">
              {(hero.userName ?? hero.name).toUpperCase()}
            </div>
          </div>
          <div className="flex gap-1">
            {(['red', 'yellow', 'green', 'blue'] as const).map(color => (
              <div 
                key={color}
                className="score-circle rounded-full flex items-center"
                style={{ 
                  backgroundColor: getColorValue(color),
                  width: '2.5rem',
                  height: '1.5rem',
                  paddingLeft: '0.5rem',
                  gap: '0.25rem'
                }}
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  {getHeroCardIcon(color)}
                </div>
                <span className="text-xs font-bold text-white">{scores[color]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
  );
});
