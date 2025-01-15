import { LatestHeroesSection } from '@/app/_components/latest/LatestHeroesSection';
import { Background } from '@/app/_components/layout/Background';

export default function LatestPage(): JSX.Element {
  return (
    <>
      <Background variant="stats" />
      <main className="min-h-screen">
        <LatestHeroesSection />
      </main>
    </>
  );
}
