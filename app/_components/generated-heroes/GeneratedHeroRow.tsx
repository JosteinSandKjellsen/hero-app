import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getHeroCardIcon } from '@/app/_lib/utils/heroCardIcons';
import { heroColors } from '@/app/_lib/constants/colors';
import { HeroColor } from '@/app/_lib/types/api';
interface GeneratedHeroRowProps {
  hero: {
    id: number;
    name: string;
    userName: string | null;
    imageId: string;
    color: HeroColor;
    gender: string;
    personalityType: string;
    colorScores: Record<string, number>;
    createdAt: string;
  };
  onDelete: (id: number) => void;
}

export function GeneratedHeroRow({ hero, onDelete }: GeneratedHeroRowProps): JSX.Element {
  const [isDeleting, setIsDeleting] = useState(false);

  // Create print URL with all required parameters
  const handlePrint = (): void => {
    // Convert colorScores to the format "red:8,blue:5,green:3,yellow:4"
    const scores = Object.entries(hero.colorScores).map(([color, percentage]) => ({
      color,
      score: Math.round(percentage / 10)
    }));

    const params = new URLSearchParams({
      imageId: hero.imageId,
      name: hero.userName || hero.name,
      heroName: hero.name,
      personalityName: hero.personalityType,
      gender: hero.gender,
      color: hero.color,
      scores: scores.map(s => `${s.color}:${s.score}`).join(','),
      print: 'true'
    });

    window.open(`/print?${params.toString()}`, '_blank');
  };

  const t = useTranslations('generatedHeroes.table');

  const handleDelete = async (): Promise<void> => {
    if (isDeleting) return;

    const confirmDelete = window.confirm(t('deleteConfirm'));
    if (!confirmDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch('/api/generated-heroes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: hero.id }),
      });

      if (!response.ok) {
        throw new Error(t('deleteError'));
      }

      // Optimistic update
      onDelete(hero.id);
    } catch (error) {
      console.error('Error deleting hero:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date to local string
  const formattedDate = new Date(hero.createdAt).toLocaleString();

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formattedDate}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {hero.userName || t('emptyUserName')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {hero.name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`inline-flex items-center px-3 py-1 rounded-full ${heroColors[hero.color]?.bg || 'bg-purple'}`}>
          <div className="w-4 h-4 mr-2">
            {getHeroCardIcon(hero.color)}
          </div>
          <span className="text-sm font-medium text-white capitalize">
            {hero.color}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={handlePrint}
          className={`p-2 ${heroColors['blue'].text} hover:opacity-80 mr-2 rounded-full hover:bg-gray-50 transition-all duration-200`}
          title={t('printHero')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`p-2 ${heroColors['red'].text} hover:opacity-80 rounded-full hover:bg-gray-50 transition-all duration-200 ${
            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={t('deleteHero')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </td>
    </tr>
  );
}
