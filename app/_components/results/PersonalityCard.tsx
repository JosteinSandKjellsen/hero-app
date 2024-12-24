'use client';

import { PersonalityType } from '@/app/_types';
import { getPersonalityIcon } from '@/app/_utils/personalityIcons';

interface PersonalityCardProps {
  personality: PersonalityType;
  percentage: number;
}

export function PersonalityCard({ personality, percentage }: PersonalityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${personality.bgClass} w-10 h-10 rounded-full flex items-center justify-center`}>
          {getPersonalityIcon(personality.color)}
        </div>
        <h3 className={`text-2xl font-bangers tracking-wide ${personality.textClass}`}>
          {personality.name}
        </h3>
      </div>
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Matchprosent:</span>
          <span className="text-sm font-medium">{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${personality.bgClass} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <p className="text-gray-600 mb-4">{personality.description}</p>
      <div className="flex flex-wrap gap-2">
        {personality.traits.map((trait, index) => (
          <span
            key={index}
            className={`${personality.bgClass} text-white px-3 py-1 rounded-full text-sm`}
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}