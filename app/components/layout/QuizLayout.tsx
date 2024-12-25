'use client';

import { FC } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Background } from './Background';
import { HeroBackground } from './HeroBackground';
import type { LayoutProps } from '../../_types/layout';

export const QuizLayout: FC<LayoutProps> = ({ 
  children, 
  showBackground = false, 
  variant = 'quiz' 
}): JSX.Element => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      {showBackground ? <HeroBackground /> : <Background variant={variant} />}
      <div className="relative z-10 max-w-3xl mx-auto pb-20">
        <Header variant={variant} />
        {children}
      </div>
      <Footer />
    </div>
  );
};
