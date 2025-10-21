'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { OverviewHeroCard } from './OverviewHeroCard';
import { getHeroCardIcon } from '@/app/_lib/utils/heroCardIcons';
import { heroColors } from '@/app/_lib/constants/colors';
import type { LatestHeroWithId } from '@/app/api/latest-heroes/route';
import type { HeroColor } from '@/app/_lib/types/api';

ChartJS.register(ArcElement, Tooltip, Legend);

interface LatestHero {
  id: number;
  name: string;
  userName: string;
  personalityType: string;
  imageId: string;
  color: HeroColor;
  gender: string;
  colorScores: Record<string, number>;
  createdAt: string;
}

interface StatsData {
  total: number;
  byColor: {
    [key: string]: number;
  };
}

const titleClasses = "text-4xl font-bangers tracking-wider text-white pt-4 text-center drop-shadow-lg";

interface OverviewSectionProps {
  selectedSessionId: string | null;
}

export function OverviewSection({ selectedSessionId }: OverviewSectionProps): JSX.Element {
  const statsT = useTranslations('stats');
  const latestT = useTranslations('latest');
  const [heroes, setHeroes] = useState<LatestHero[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const lastFetchedIdRef = useRef<number | null>(null);

  const fetchLatestHeroes = useCallback(async (): Promise<void> => {
    try {
      const params = new URLSearchParams({
        includeAll: 'true',
        count: '8'
      });
      
      if (selectedSessionId) {
        params.set('sessionId', selectedSessionId);
      }
      
      const response = await fetch(`/api/latest-heroes?${params.toString()}`);
      
      // Handle rate limiting gracefully
      if (response.status === 429) {
        console.warn('Rate limited on heroes fetch, will retry on next interval');
        return;
      }
      
      if (!response.ok) throw new Error('Failed to fetch heroes');
      
      const data = await response.json();
      
      if (!data.length) return;

      const mappedData = data.map((hero: LatestHeroWithId) => ({
        id: hero.id,
        name: hero.name,
        userName: hero.userName || hero.name,
        personalityType: hero.personalityType,
        imageId: hero.imageId,
        color: hero.color as HeroColor,
        gender: hero.gender,
        colorScores: hero.colorScores,
        createdAt: hero.createdAt
      }));

      setHeroes(currentHeroes => {
        if (currentHeroes.length === 0 || mappedData[0].id !== lastFetchedIdRef.current) {
          lastFetchedIdRef.current = mappedData[0].id;
          return mappedData;
        }
        return currentHeroes;
      });
    } catch (error) {
      console.error('Error fetching latest heroes:', error);
    }
  }, [selectedSessionId]);

  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const params = new URLSearchParams();
      if (selectedSessionId) {
        params.set('sessionId', selectedSessionId);
      }
      
      const response = await fetch(`/api/hero-stats?${params.toString()}`);
      
      // Handle rate limiting gracefully
      if (response.status === 429) {
        console.warn('Rate limited on stats fetch, will retry on next interval');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Keep existing stats on error instead of clearing
    }
    // selectedSessionId is used in the function body, eslint is incorrect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId]);

  // Initial fetch for both heroes and stats
  useEffect(() => {
    fetchLatestHeroes();
    fetchStats();
  }, [fetchLatestHeroes, fetchStats]);

  // Force re-fetch when session changes
  useEffect(() => {
    if (selectedSessionId !== null) {
      // Clear current heroes to force fresh fetch when session changes
      setHeroes([]);
      lastFetchedIdRef.current = null;
      fetchLatestHeroes();
      fetchStats();
    }
  }, [selectedSessionId, fetchLatestHeroes, fetchStats]);

  // Set up polling for heroes (20s) and stats (60s)
  useEffect(() => {
    const heroesInterval = setInterval(fetchLatestHeroes, 20000);
    const statsInterval = setInterval(fetchStats, 60000);
    return () => {
      clearInterval(heroesInterval);
      clearInterval(statsInterval);
    };
  }, [fetchLatestHeroes, fetchStats]);

  const orderedHeroes = heroes;

  const colors = Object.keys(heroColors);
  const chartData = stats ? {
    labels: colors.map(color => statsT(`colors.${color}`)),
    datasets: [
      {
        data: colors.map(color => stats.byColor[color] || 0),
        backgroundColor: colors.map(color => {
          switch (color) {
            case 'red': return '#A82039';
            case 'yellow': return '#F0A45B';
            case 'green': return '#007C4D';
            case 'blue': return '#2D3A82';
            default: return '#000000';
          }
        }),
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
      },
    ],
  } : null;

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1a1a1a',
        bodyColor: '#1a1a1a',
        bodyFont: {
          size: 14
        },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6
      }
    },
  };

  return (
    <div className="flex h-screen w-screen p-4 gap-4 max-h-screen fixed inset-0">
      {/* Heroes Section - 75% width */}
      <div className="w-[75%] overflow-hidden">
        <h2 className={titleClasses.replace('text-center', 'pl-8')}>
          {latestT('overview')}
        </h2>
        <div className="h-[calc(100%-4rem)] relative">
          <div 
            className="grid grid-cols-4 grid-rows-2 gap-4 h-full w-full absolute inset-0 scale-[0.95]"
          >
            <AnimatePresence mode="popLayout">
              {orderedHeroes.slice(0, 8).map((hero, index) => (
                <div key={hero.id} className="w-full h-full">
                  <OverviewHeroCard
                    hero={hero}
                    isNew={hero.id === lastFetchedIdRef.current && lastFetchedIdRef.current !== null}
                    priority={index < 2} // Only prioritize first two cards
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stats Section - 25% width */}
      <div className="w-[25%] flex flex-col">
        <h2 className={titleClasses}>
          {statsT('title')}
        </h2>
        <div className="relative h-[calc(100%-4rem)]">
          <div className="h-full bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 p-4 flex flex-col absolute inset-0 scale-[0.95]">
          <div className="flex-1 flex flex-col gap-8 pt-12">
          
          {/* Total Heroes */}
          <div className="mb-6 text-center">
            <p className="text-6xl font-bold text-white font-bangers tracking-wider">
              {stats?.total ?? 0}
            </p>
            <p className="text-sm text-white/80 uppercase tracking-wider">
              {statsT('total.title')}
            </p>
          </div>

          {/* Pie Chart */}
          {chartData && (
            <div className="mb-8 w-full" style={{ maxHeight: '30vh' }}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4/5 mx-auto">
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Color Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {colors.map(color => {
              const colorStats = stats?.byColor[color] || 0;
              const percentage = stats?.total ? 
                ((colorStats / stats.total) * 100).toFixed(1) : '0.0';
              
              return (
                <div 
                  key={color}
                  className={`rounded-lg p-4 ${heroColors[color as keyof typeof heroColors].bg} text-white`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8">
                      {getHeroCardIcon(color as 'red' | 'yellow' | 'green' | 'blue')}
                    </div>
                    <div>
                      <p className="text-base font-bold opacity-90">{percentage}%</p>
                      <p className="text-sm opacity-90">({colorStats})</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>

          {/* Footer with Logo */}
          <div className="mt-auto pt-8 flex justify-center">
          <Image
            src="https://bouvet.fotoware.cloud/fotoweb/resources/logos/main.png"
            alt="Bouvet Logo"
            width={120}
            height={24}
            className="h-6 w-[120px] object-contain opacity-90 hover:opacity-100 transition-opacity"
          />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
