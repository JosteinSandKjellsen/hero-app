'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GeneratedHeroRow } from './GeneratedHeroRow';
import { getHeroCardIcon } from '@/app/_lib/utils/heroCardIcons';

interface GeneratedHero {
  id: number;
  name: string;
  userName: string | null;
  imageId: string;
  color: string;
  gender: string;
  personalityType: string;
  colorScores: Record<string, number>;
  createdAt: string;
}

export function GeneratedHeroesTable(): JSX.Element {
  const [heroes, setHeroes] = useState<GeneratedHero[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('generatedHeroes.table');

  const fetchHeroes = useCallback(async () => {
    try {
      const response = await fetch('/api/generated-heroes');
      if (!response.ok) throw new Error('Failed to fetch heroes');
      
      const data = await response.json();
      setHeroes(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching heroes:', error);
      setError(t('fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Initial fetch
  useEffect(() => {
    fetchHeroes();
  }, [fetchHeroes]);

  // Set up polling every 20 seconds
  useEffect(() => {
    const interval = setInterval(fetchHeroes, 20000);
    return () => clearInterval(interval);
  }, [fetchHeroes]);

  const handleDelete = (id: number): void => {
    setHeroes(currentHeroes => currentHeroes.filter(hero => hero.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="-my-2 sm:-mx-6 lg:-mx-8">
        {/* Mobile view */}
        <div className="block sm:hidden">
          {heroes.map((hero) => (
            <div key={hero.id} className="bg-white shadow rounded-lg mb-4 p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-900">{hero.name}</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full bg-${hero.color.toLowerCase()}-600`}>
                    <div className="w-4 h-4 mr-2">
                      {getHeroCardIcon(hero.color.toLowerCase() as 'red' | 'yellow' | 'green' | 'blue')}
                    </div>
                    <span className="text-sm font-medium text-white capitalize">
                      {hero.color}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{t('userName')}: </span>
                  {hero.userName || t('emptyUserName')}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{t('timeCreated')}: </span>
                  {new Date(hero.createdAt).toLocaleString()}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => {
                      const printParams = new URLSearchParams({
                        imageId: hero.imageId,
                        name: hero.userName || hero.name,
                        heroName: hero.name,
                        personalityName: hero.personalityType,
                        gender: hero.gender,
                        color: hero.color,
                        scores: Object.entries(hero.colorScores)
                          .map(([color, percentage]) => `${color}:${Math.round(percentage / 10)}`)
                          .join(','),
                        print: 'true'
                      });
                      window.open(`/print?${printParams.toString()}`, '_blank');
                    }}
                    className="p-2 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-indigo-50 transition-all duration-200"
                    title={t('printHero')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(hero.id)}
                    className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50 transition-all duration-200"
                    title={t('deleteHero')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {heroes.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-4">
              {t('noHeroes')}
            </div>
          )}
        </div>
        
        {/* Desktop view */}
        <div className="hidden sm:block">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('timeCreated')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('userName')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('heroName')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('color')}
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">{t('actions')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {heroes.map((hero) => (
                    <GeneratedHeroRow
                      key={hero.id}
                      hero={hero}
                      onDelete={handleDelete}
                    />
                  ))}
                  {heroes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        {t('noHeroes')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
