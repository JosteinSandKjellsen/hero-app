'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { HeroColor } from '@/app/_lib/types/api';
import { PersonalityStyle } from '@/app/_data/personalities';
import { getPersonalityIcon } from '@/app/_lib/utils/personalityIcons';

interface PersonalitySectionProps {
  personality: PersonalityStyle;
}

export function PersonalitySection({ personality }: PersonalitySectionProps): JSX.Element {
  const t = useTranslations();
  const color = personality.color as HeroColor;

  return (
    <div className="flex flex-col md:flex-row items-stretch gap-0 max-w-6xl mx-auto shadow-lg rounded-lg overflow-hidden bg-light/5 backdrop-blur-sm">
      <div className="md:w-1/4 relative">
        <Image
          src={`/images/superheroes/${color}-man.jpeg`}
          alt={`${color} personality male superhero`}
          width={240}
          height={320}
          className="w-full h-[320px] object-cover object-top"
        />
      </div>
      
      <div className="md:w-2/4" style={{ backgroundColor: '#fcf8f3' }}>
        <div className="h-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`${personality.bgClass} w-10 h-10 rounded-full flex items-center justify-center`}>
              {getPersonalityIcon(personality.color)}
            </div>
            <h3 className={`text-2xl font-bangers tracking-wide ${personality.textClass}`}>
              {t(`personalities.${personality.color}.name`)}
            </h3>
          </div>
          <p className="text-dark/80 mb-4">{t(`personalities.${personality.color}.description`)}</p>
          <div className="flex flex-wrap gap-2">
            {t.raw(`personalities.${personality.color}.traits`).map((trait: string) => (
              <span
                key={trait}
                className={`${personality.bgClass} text-white px-3 py-1 rounded-full text-sm`}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="md:w-1/4 relative">
        <Image
          src={`/images/superheroes/${color}-woman.jpeg`}
          alt={`${color} personality female superhero`}
          width={240}
          height={320}
          className="w-full h-[320px] object-cover object-top"
        />
      </div>
    </div>
  );
}
