'use client';

import { QuizLayout } from '../../_components/layout/QuizLayout';
import { StatsSection } from '../../_components/stats/StatsSection';

export default function Stats(): JSX.Element {
  return (
    <QuizLayout variant="stats">
      <StatsSection />
    </QuizLayout>
  );
}

// Add metadata export for static optimization
export const dynamic = 'force-static';
