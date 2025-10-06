import { SessionManagement } from '@/app/_components/sessions/SessionManagement';
import { Background } from '@/app/_components/layout/Background';
import { HeroBackground } from '@/app/_components/layout/HeroBackground';

export default function SessionsPage(): JSX.Element {
  return (
    <>
      <Background variant="stats" />
      <HeroBackground />
      <main className="min-h-screen py-8 relative z-10">
        <SessionManagement />
      </main>
    </>
  );
}