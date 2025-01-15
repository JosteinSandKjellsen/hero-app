'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { HeroImage } from '../ui/HeroImage';
import { getPersonalityIcon } from '@/app/_utils/personalityIcons';
import { getHeroCardIcon } from '@/app/_utils/heroCardIcons';
import { HeroColor } from '@/app/_lib/types/api';

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
  isNew: boolean;
}

export const LatestHeroCard = forwardRef<HTMLDivElement, LatestHeroCardProps>(
  function LatestHeroCard({ hero, isNew }, ref): JSX.Element {
  // Animation variants
  const variants = {
    enter: {
      x: 100,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
    exit: {
      x: -100,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const getColorValue = (color: string): string => {
    switch (color) {
      case 'red': return 'rgb(220, 38, 38)'; // text-red-600
      case 'yellow': return 'rgb(234, 179, 8)'; // text-yellow-500
      case 'green': return 'rgb(22, 163, 74)'; // text-green-600
      case 'blue': return 'rgb(37, 99, 235)'; // text-blue-600
      default: return 'rgb(147, 51, 234)'; // text-purple-600
    }
  };

  const getBorderColorClass = (): string => {
    switch (hero.color) {
      case 'red': return 'border-red-600';
      case 'yellow': return 'border-yellow-500';
      case 'green': return 'border-green-600';
      case 'blue': return 'border-blue-600';
      default: return 'border-purple-600';
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={isNew ? 'enter' : 'center'}
      animate="center"
      exit="exit"
      variants={variants}
      className="w-[90%] md:w-[450px]"
    >
      <div 
        className={`rounded-xl overflow-hidden border-[10px] ${getBorderColorClass()} bg-white h-full flex flex-col`}
      >
        <div className="h-24 flex items-center px-6 border-b-2 border-opacity-20">
          <div className="flex items-center gap-4 flex-1">
            <div 
              className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center personality-icon"
              style={{ backgroundColor: getColorValue(hero.color) }}
            >
              <div className="scale-[2]">
                {getPersonalityIcon(hero.color)}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center -mt-0.5 py-2">
              <h3 className={`text-3xl font-bangers tracking-wide text-${hero.color}-600 leading-none mb-1`}>
                {hero.name}
              </h3>
              <p className="text-xs text-gray-600 uppercase tracking-wider font-medium leading-none">
                {hero.personalityType}
              </p>
            </div>
          </div>
        </div>

        <div className="relative aspect-[3/5] overflow-hidden">
          <HeroImage
            imageId={hero.imageId}
            alt={hero.name}
            className="rounded-none"
          />
          <div className="absolute bottom-3 right-3 bg-white/30 backdrop-blur-sm py-1.5 rounded-full flex items-center justify-center w-[6.25rem]">
            <Image
              src="/images/logos/bouvet.svg"
              alt="Bouvet Logo"
              width={64}
              height={32}
              className="w-16 h-8"
              style={{ filter: 'brightness(0)' }}
              priority
            />
          </div>
        </div>

        <div className="p-4 border-t-2 border-opacity-20 flex justify-between items-center mt-auto">
          <div className="flex items-center gap-4">
            <div className="text-base font-bangers tracking-wide text-gray-700">
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
                  width: '2.75rem',
                  height: '1.75rem',
                  paddingLeft: '0.5rem',
                  gap: '0.375rem'
                }}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {getHeroCardIcon(color)}
                </div>
                <span className="text-xs font-bold text-white">{hero.colorScores[color] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
