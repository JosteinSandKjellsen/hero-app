'use client';

import { PersonalityType, UserData } from '@/app/_types';
import { getPersonalityIcon } from '@/app/_utils/personalityIcons';

interface SuperheroCardProps {
  photoUrl: string;
  personality: PersonalityType;
  userData: UserData;
  results?: { color: string; percentage: number }[];
}

export function SuperheroCard({ photoUrl, personality, userData, results = [] }: SuperheroCardProps) {
  const getBorderColorClass = () => {
    switch (personality.color) {
      case 'red': return 'border-red-600';
      case 'yellow': return 'border-yellow-500';
      case 'green': return 'border-green-600';
      case 'blue': return 'border-blue-600';
      default: return 'border-purple-600';
    }
  };

  const getScoreCircleClasses = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-600';
      case 'yellow': return 'bg-yellow-500';
      case 'green': return 'bg-green-600';
      case 'blue': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div 
      data-card-clone
      className={`rounded-xl overflow-hidden border-[10px] ${getBorderColorClass()} shadow-2xl bg-white transform hover:scale-[1.02] transition-transform duration-300`}
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

      <div className="p-3 border-t-2 border-opacity-20 flex justify-between items-center">
        <div className="text-sm font-bangers tracking-wide text-gray-700 px-4">
          {userData.name.toUpperCase()}
        </div>
        <div className="flex gap-2">
          {['red', 'yellow', 'green', 'blue'].map(color => {
            const result = results.find(r => r.color === color);
            const score = result ? Math.round(result.percentage / 10) : 0;
            return (
              <div 
                key={color}
                className={`w-8 h-8 rounded-full ${getScoreCircleClasses(color)} flex items-center justify-center`}
              >
                <span className="text-xs font-bold text-white">{score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}