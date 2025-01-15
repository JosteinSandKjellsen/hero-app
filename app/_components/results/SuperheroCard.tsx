'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { PersonalityType } from '../../_lib/types/personality';
import { UserData } from '../../_lib/types';
import { getPersonalityIcon } from '../../_utils/personalityIcons';
import { getHeroCardIcon } from '../../_utils/heroCardIcons';

interface SuperheroCardProps {
  photoUrl: string;
  personality: PersonalityType;
  userData: UserData;
  results?: { color: string; percentage: number }[];
}

export function SuperheroCard({ photoUrl, personality, userData, results = [] }: SuperheroCardProps): JSX.Element {
  const t = useTranslations('results');

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
    switch (personality.color) {
      case 'red': return 'border-red-600';
      case 'yellow': return 'border-yellow-500';
      case 'green': return 'border-green-600';
      case 'blue': return 'border-blue-600';
      default: return 'border-purple-600';
    }
  };

  return (
    <div 
      data-card-clone
      className={`rounded-xl overflow-hidden border-[10px] ${getBorderColorClass()} transform hover:scale-[1.02] transition-transform duration-300 print:transform-none print:transition-none`}
      style={{ 
        width: '100%', 
        maxWidth: '600px', 
        margin: '0 auto',
        backgroundColor: 'white',
        boxShadow: 'none',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        colorAdjust: 'exact'
      }}
    >
      <div 
        className="h-20 flex items-center px-4 border-b-2 border-opacity-20"
        style={{ backgroundColor: 'white' }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center personality-icon"
            data-color-bg="true"
            style={{ backgroundColor: getColorValue(personality.color) }}
          >
            {getPersonalityIcon(personality.color)}
          </div>
          <div className="flex-1 flex flex-col justify-center -mt-0.5 py-2">
            <h3 className={`text-2xl font-bangers tracking-wide ${personality.textClass} leading-none mb-1`}>
              {personality.heroName}
            </h3>
            <p className="text-xs text-gray-600 uppercase tracking-wider font-medium leading-none">
              {personality.name}
            </p>
          </div>
        </div>
      </div>

      <div className="relative aspect-[3/4]">
        <Image
          src={photoUrl}
          alt={t('selfieAlt')}
          className="object-cover"
          fill
          sizes="(max-width: 600px) 100vw, 600px"
          crossOrigin="anonymous"
          priority
        />
        <div className="absolute bottom-3 right-3 bg-white/30 backdrop-blur-sm py-1.5 rounded-full flex items-center justify-center w-[6.25rem]" style={{ backdropFilter: 'blur(4px)' }}>
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

      <div 
        className="p-3 border-t-2 border-opacity-20 flex justify-between items-center"
        style={{ backgroundColor: 'white' }}
      >
        <div className="flex items-center gap-4">
          <div className="text-sm font-bangers tracking-wide text-gray-700">
            {userData.name.toUpperCase()}
          </div>
        </div>
        <div className="flex gap-2">
          {(['red', 'yellow', 'green', 'blue'] as const).map(color => {
            const result = results.find(r => r.color === color);
            const score = result ? Math.round(result.percentage / 10) : 0;
            return (
              <div 
                key={color}
                className="score-circle rounded-full flex items-center"
                data-color-bg="true"
                style={{ 
                  backgroundColor: getColorValue(color),
                  width: '2.7rem',
                  height: '1.7rem',
                  paddingLeft: '0.5rem',
                  gap: '0.3rem'
                }}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {getHeroCardIcon(color)}
                </div>
                <span className="text-xs font-bold text-white">{score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
