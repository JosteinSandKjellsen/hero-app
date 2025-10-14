import { useEffect, useState } from 'react';
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
    printed: boolean;
    carousel: boolean;
    sessionId: string | null;
    session: {
      name: string;
    } | null;
  };
  onDelete: (id: number) => void;
  onPrinted?: (id: number) => void;
  onCarouselChange?: (id: number, carousel: boolean) => void;
}

export function GeneratedHeroRow({ hero, onDelete, onPrinted, onCarouselChange }: GeneratedHeroRowProps): JSX.Element {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInCarousel, setIsInCarousel] = useState(hero.carousel ?? false);
  const t = useTranslations('generatedHeroes.table');

  // Keep local state in sync with prop
  useEffect(() => {
    setIsInCarousel(hero.carousel ?? false);
  }, [hero.carousel]);

  const handleCarouselChange = async (checked: boolean): Promise<void> => {
    if (onCarouselChange) {
      setIsUpdating(true);
      try {
        const response = await fetch('/api/hero-carousel', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: hero.id,
            carousel: checked
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update carousel status');
        }

        setIsInCarousel(checked);
        onCarouselChange(hero.id, checked);
      } catch (error) {
        console.error('Error updating carousel status:', error);
        setIsInCarousel(!checked); // Revert local state on error
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handlePrint = async (): Promise<void> => {
    // Convert colorScores to the format "red:8,blue:5,green:3,yellow:4"
    const scores = Object.entries(hero.colorScores).map(([color, percentage]) => ({
      color,
      score: percentage
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

    // Mark hero as printed
    try {
      const response = await fetch('/api/hero-printed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: hero.id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark as printed');
      }
      
      // Call onPrinted callback to update the parent's state
      if (onPrinted) {
        onPrinted(hero.id);
      }
    } catch (error) {
      console.error('Error marking hero as printed:', error);
    }
  };

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
        const errorData = await response.json();
        throw new Error(errorData.error || t('deleteError'));
      }

      // Optimistic update
      onDelete(hero.id);
    } catch (error) {
      console.error('Error deleting hero:', error);
      alert(error instanceof Error ? error.message : t('deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date to local string
  const formattedDate = new Date(hero.createdAt).toLocaleString();

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-500">
        {formattedDate}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 truncate">
        {hero.userName || t('emptyUserName')}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 truncate" title={hero.name}>
        {hero.name}
      </td>
      <td className="px-4 py-3 text-sm text-center">
        {hero.printed && (
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-center">
        <input
          type="checkbox"
          id={`carousel-${hero.id}`}
          checked={isInCarousel}
          disabled={isUpdating}
          onChange={(e) => handleCarouselChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
        />
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 truncate">
        {hero.session?.name || ''}
      </td>
      <td className="px-4 py-3">
        <div className={`inline-flex items-center px-2 py-1 rounded-full ${heroColors[hero.color]?.bg || 'bg-blue'}`}>
          <div className="w-3 h-3 mr-1.5">
            {getHeroCardIcon(hero.color)}
          </div>
          <span className="text-xs font-medium text-white capitalize">
            {hero.color}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={handlePrint}
            className={`inline-flex items-center justify-center p-1.5 rounded-full border-2 transition-all duration-200 hover:scale-105 ${
              hero.printed 
                ? 'text-green-600 border-green-600 bg-green-50 hover:bg-green-100' 
                : 'text-blue-600 border-blue-600 bg-blue-50 hover:bg-blue-100'
            }`}
            title={hero.printed ? t('printAgain') : t('printHero')}
            aria-label={hero.printed ? t('printAgain') : t('printHero')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`inline-flex items-center justify-center p-1.5 rounded-full border-2 border-red-600 text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200 hover:scale-105 ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={t('deleteHero')}
            aria-label={isDeleting ? `${t('deleteHero')} ${t('inProgress')}` : t('deleteHero')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
