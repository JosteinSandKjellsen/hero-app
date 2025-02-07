import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { PersonalitySection } from '@/app/_components/personalities/PersonalitySection';
import { personalities } from '@/app/_data/personalities';

export default function PersonalitiesPage(): JSX.Element {
  const t = useTranslations('personalitiesPage');

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bangers tracking-wide mb-4 text-light">
          {t('title')}
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-red via-yellow to-blue mx-auto"></div>
      </div>

      <div className="space-y-8">
        {personalities.map((personality) => (
          <PersonalitySection key={personality.color} personality={personality} />
        ))}
      </div>
    </main>
  );
}
