'use client';

import { PersonalityType, UserData } from '@/app/_types';
import { getPersonalityIcon } from '@/app/_utils/personalityIcons';

interface SuperheroCardProps {
  photoUrl: string;
  personality: PersonalityType;
  userData: UserData;
}

export function SuperheroCard({ photoUrl, personality, userData }: SuperheroCardProps) {
  return (
    <div 
      data-card-clone
      className={`rounded-xl overflow-hidden border-8 ${personality.bgClass} shadow-xl bg-white`}
      style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}
    >
      <div className="h-20 flex items-center gap-3 px-4 border-b-2 border-opacity-20">
        <div className={`${personality.bgClass} w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center`}>
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

      <div className="relative aspect-[3/4]">
        <img
          src={photoUrl}
          alt="Din superhelt-selfie"
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />
      </div>

      <div className="p-3 border-t-2 border-opacity-20">
        <div className="text-sm text-center font-bangers tracking-wide text-gray-700">
          {userData.name.toUpperCase()}
        </div>
      </div>
    </div>
  );
}