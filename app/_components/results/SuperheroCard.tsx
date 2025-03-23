'use client';

import { useTranslations } from 'next-intl';
import { PersonalityType } from '../../_lib/types/personality';
import { UserData } from '../../_lib/types';
import { getPersonalityIcon } from '@/app/_lib/utils/personalityIcons';
import { getHeroCardIcon } from '@/app/_lib/utils/heroCardIcons';
import { HeroImage } from '../ui/HeroImage';
import Image from 'next/image';

interface SuperheroCardProps {
  photoUrl: string;
  personality: PersonalityType;
  userData: UserData;
  results?: { color: string; percentage: number }[];
  optimizePrint?: boolean;
}

export function SuperheroCard({ photoUrl, personality, userData, results = [], optimizePrint = false }: SuperheroCardProps): JSX.Element {
  const t = useTranslations('results');

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

  // Convert results array to color-score record
  const colorScores = results.reduce((acc, r) => ({
    ...acc,
    [r.color]: r.percentage
  }), { red: 0, yellow: 0, green: 0, blue: 0 });

  const scores = calculateProportionalScores(colorScores);

  const getColorValue = (color: string): string => {
    switch (color) {
      case 'red': return '#A82039';
      case 'yellow': return '#F0A45B';
      case 'green': return '#007C4D';
      case 'blue': return '#2D3A82';
      default: return '#11133C';
    }
  };

  return (
    <div
      data-card-clone
      className={`rounded-xl transform hover:scale-[1.02] transition-transform duration-300 print:transform-none print:transition-none hover:z-10 origin-center`}
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        boxShadow: `0 0 40px -5px ${getColorValue(personality.color)}80`,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
        colorAdjust: 'exact',
        borderWidth: '10px',
        borderStyle: 'solid',
        borderColor: getColorValue(personality.color)
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
        <div className="relative w-full h-full bg-gray-100/50">
          {photoUrl.includes('cdn.leonardo.ai') ? (
            <HeroImage
              imageId={photoUrl.match(/generations\/([^/]+)/)?.[1] || ''}
              alt={t('selfieAlt')}
              className="rounded-none"
              priority={optimizePrint}
              quality={95}
            />
          ) : (
            <Image
              src={photoUrl}
              alt={t('selfieAlt')}
              className="object-cover"
              fill
              sizes={optimizePrint ? "500px" : "(max-width: 600px) 100vw, 600px"}
              crossOrigin="anonymous"
              priority={optimizePrint}
              loading={optimizePrint ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            />
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/30 backdrop-blur-sm py-1.5 rounded-full flex items-center justify-center w-[6.25rem]" style={{ backdropFilter: 'blur(4px)' }}>
          <Image
            src="/images/logos/bouvet-optimized.webp"
            alt="Bouvet Logo"
            width={48}
            height={24}
            className="w-12 h-6"
            style={{ filter: 'brightness(0)' }}
            loading={optimizePrint ? "eager" : "lazy"}
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
            const score = scores[color];
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
