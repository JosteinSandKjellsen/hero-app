import { Background } from '@/app/_components/layout/Background';
import { OverviewSection } from '@/app/_components/overview/OverviewSection';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function generateMetadata({ params: { locale } }: { params: { locale: string }}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'latest' });
  return {
    title: t('overview')
  };
}

export default async function OverviewPage(): Promise<JSX.Element> {
  return (
    <>
      <Background variant="stats" />
      <main className="min-h-screen h-screen overflow-hidden">
        <OverviewSection />
      </main>
    </>
  );
}
