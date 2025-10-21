import { useTranslations } from 'next-intl';
import Link from 'next/link';
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
        <div className="w-24 h-1 bg-gradient-to-r from-red via-yellow to-blue mx-auto mb-6"></div>
        <Link 
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bangers text-xl tracking-wide rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
          {t('takeTest')}
        </Link>
      </div>

      <div className="space-y-8">
        {personalities.map((personality) => (
          <PersonalitySection key={personality.color} personality={personality} />
        ))}
      </div>

      <div className="text-center mt-12">
        <Link 
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bangers text-xl tracking-wide rounded-lg shadow-lg transition-all transform hover:scale-105"
        >
          {t('takeTest')}
        </Link>
      </div>
    </main>
  );
}
