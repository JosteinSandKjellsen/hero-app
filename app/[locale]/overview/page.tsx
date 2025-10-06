'use client';

import { Background } from '@/app/_components/layout/Background';
import { OverviewSection } from '@/app/_components/overview/OverviewSection';
import { SessionSelectionModal } from '@/app/_components/sessions/SessionSelectionModal';
import { useSessionSelection } from '@/app/_hooks/useSessionSelection';
import { useTranslations } from 'next-intl';
import { useEffect, Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function OverviewContent(): JSX.Element {
  const t = useTranslations('latest');
  const {
    activeSessions,
    selectedSessionId,
    showSessionModal,
    isLoading,
    handleSessionSelected
  } = useSessionSelection(true); // Force modal to show All option

  // Set page title
  useEffect(() => {
    document.title = t('overview');
  }, [t]);

  if (isLoading) {
    return (
      <>
        <Background variant="stats" />
        <main className="min-h-screen h-screen overflow-hidden flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </main>
      </>
    );
  }

  return (
    <>
      <Background variant="stats" />
      <main className="min-h-screen h-screen overflow-hidden">
        <OverviewSection selectedSessionId={selectedSessionId} />
      </main>
      {showSessionModal && (
        <SessionSelectionModal
          sessions={activeSessions}
          onSessionSelected={handleSessionSelected}
          showAllOption={true}
        />
      )}
    </>
  );
}

export default function OverviewPage(): JSX.Element {
  return (
    <Suspense fallback={
      <>
        <Background variant="stats" />
        <main className="min-h-screen h-screen overflow-hidden flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </main>
      </>
    }>
      <OverviewContent />
    </Suspense>
  );
}
