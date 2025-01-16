'use client';

import { useCallback, useEffect, useState } from 'react';
import { GeneratedHeroRow } from './GeneratedHeroRow';

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

  const fetchHeroes = useCallback(async () => {
    try {
      const response = await fetch('/api/generated-heroes');
      if (!response.ok) throw new Error('Failed to fetch heroes');
      
      const data = await response.json();
      setHeroes(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching heroes:', error);
      setError('Failed to load heroes');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hero Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Color
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
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
                      No heroes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
