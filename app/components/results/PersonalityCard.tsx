'use client';

import { PersonalityType } from '../../_lib/types/personality';
import { getPersonalityIcon } from '../../_utils/personalityIcons';

interface PersonalityCardProps {
  personality: PersonalityType;
  percentage: number;
}

export function PersonalityCard({ personality, percentage }: PersonalityCardProps): JSX.Element {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className={`${personality.bgClass} rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
        {getPersonalityIcon(personality.color)}
      </div>
      <h3 className={`text-2xl font-bangers tracking-wide ${personality.textClass} mb-2`}>
        {personality.name}
      </h3>
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
        {personality.traits.map((trait: string, index: number) => (
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
