'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getHeroCardIcon } from '@/app/_utils/heroCardIcons';
import { heroColors } from '@/app/_lib/constants/colors';
ChartJS.register(ArcElement, Tooltip, Legend);

interface StatsData {
  total: number;
  byColor: {
    [key: string]: number;
  };
}

export function StatsSection(): JSX.Element {
  const t = useTranslations('stats');
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const response = await fetch('/api/hero-stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    // Fetch immediately on mount
    fetchStats();

    // Set up polling interval (every minute)
    const intervalId = setInterval(fetchStats, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
        <p className="text-white/80">{t('total.loading')}</p>
      </div>
    );
  }

  const colors = Object.keys(heroColors);
  const chartData = {
    labels: colors.map(color => t(`colors.${color}`).toUpperCase()),
    datasets: [
      {
        data: colors.map(color => stats.byColor[color] || 0),
        backgroundColor: colors.map(color => {
          const colorClass = heroColors[color as keyof typeof heroColors].bg;
          // Convert Tailwind classes to actual colors with higher brightness for better visibility
          switch (colorClass) {
            case 'bg-red-600':
              return '#ef4444';  // Brighter red
            case 'bg-yellow-500':
              return '#fbbf24'; // Brighter yellow
            case 'bg-green-600':
              return '#22c55e'; // Brighter green
            case 'bg-blue-600':
              return '#3b82f6'; // Brighter blue
            default:
              return '#000000';
          }
        }),
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
      },
    ],
  };

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
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <h1 className="text-4xl font-bangers tracking-wider text-white text-center mb-12 drop-shadow-lg">{t('title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 p-6 min-h-[300px] flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-white">{t('total.title')}</h2>
          <div className="flex items-center justify-center flex-1">
            <p className="text-9xl font-bold text-white font-bangers tracking-wider">{stats.total}</p>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 p-6 min-h-[300px] flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-white">{t('distribution.title')}</h2>
          <div className="w-full max-w-[300px] mx-auto">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {colors.map(color => {
          const colorStats = stats.byColor[color] || 0;
          const percentage = stats.total > 0 
            ? ((colorStats / stats.total) * 100).toFixed(1)
            : '0.0';
          
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
                  <h3 className="text-lg font-bold">{t(`colors.${color}`)}</h3>
                  <p className="text-sm opacity-90">{percentage}% ({colorStats})</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
