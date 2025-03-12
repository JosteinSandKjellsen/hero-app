'use client';

import { useTranslations } from 'next-intl';
import { GeneratedHeroesTable } from '@/app/_components/generated-heroes/GeneratedHeroesTable';
import { QuizLayout } from '@/app/_components/layout/QuizLayout';

export default function GeneratedHeroesPage(): JSX.Element {
  const t = useTranslations('generatedHeroes');

  return (
    <QuizLayout variant="stats">
      <div className="mt-4">
        <h1 className="text-2xl font-semibold text-white">{t('title')}</h1>
        <p className="mt-2 text-sm text-gray-300">{t('description')}</p>
      </div>
      <div className="mt-6">
        <GeneratedHeroesTable />
      </div>
    </QuizLayout>
  );
}
