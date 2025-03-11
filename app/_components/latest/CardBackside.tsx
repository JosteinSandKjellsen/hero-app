'use client';

import Image from 'next/image';
import { HeroColor } from '@/app/_lib/types/api';
import { heroColors } from '@/app/_lib/constants/colors';

interface CardBacksideProps {
  color: HeroColor;
}

export function CardBackside({ color }: CardBacksideProps): JSX.Element {
  const getBorderColorClass = (): string => {
    return heroColors[color]?.border || 'border-purple';
  };

  return (
    <div 
      className={`absolute inset-0 w-full h-full backface-hidden ${getBorderColorClass()} bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl border-[10px] flex items-center justify-center transition-all duration-500`}
      style={{ 
        transform: 'rotateY(180deg)',
        backfaceVisibility: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.5s ease-in-out',
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(${color === 'red' ? '168, 32, 57' : 
          color === 'yellow' ? '240, 164, 91' : 
          color === 'green' ? '0, 124, 77' : 
          color === 'blue' ? '45, 58, 130' : 
          '17, 19, 60'}, 0.02) 15%, transparent 60%)`
      }}
    >
      <div 
        className="relative w-[240px] h-[120px] transition-opacity duration-500"
        style={{ opacity: 0.85 }}
      >
        <Image
          src="/images/logos/bouvet.svg"
          alt="Bouvet Logo"
          fill
          className="object-contain transition-all duration-500"
          style={{ 
            filter: 'brightness(0)',
            transform: 'scale(0.95)'
          }}
          priority
        />
      </div>
      <div className="absolute inset-0 w-full h-full overflow-hidden rounded">
        <div className="absolute inset-4 border-2 border-gray-100 rounded-lg opacity-30" />
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: 'radial-gradient(circle at 100% 100%, rgba(0,0,0,0.02) 0%, transparent 60%)',
            transform: 'scale(2)',
            opacity: 0.5
          }} 
        />
      </div>
    </div>
  );
}
