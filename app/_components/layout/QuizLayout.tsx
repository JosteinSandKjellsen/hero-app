'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { Background } from './Background';
import { HeroBackground } from './HeroBackground';
import type { LayoutProps } from '../../_lib/types/layout';

interface QuizLayoutProps extends LayoutProps {
}

export function QuizLayout({ children, showBackground = false, variant = 'quiz' }: QuizLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0">
        {showBackground ? <HeroBackground /> : <Background variant={variant} />}
      </div>
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="max-w-3xl w-full">
        {children}
        </div>
      </main>
      <Footer variant={variant} />
    </div>
  );
}
