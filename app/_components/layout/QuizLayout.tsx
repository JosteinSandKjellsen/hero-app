'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { Background } from './Background';
import { HeroBackground } from './HeroBackground';
import type { LayoutProps } from '../../_lib/types/layout';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface QuizLayoutProps extends LayoutProps {
}

export function QuizLayout({ children, showBackground = false, variant = 'quiz' }: QuizLayoutProps): JSX.Element {
  // Use a state to track animation and responsive behavior
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  
  // Force layout recalculation on route changes or variant changes
  useEffect(() => {
    // Force layout recalculation
    const layoutTimer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 10);
    
    // Add a slight delay before showing content to prevent blinking
    const visibilityTimer = setTimeout(() => {
      setVisible(true);
    }, 50);
    
    return () => {
      clearTimeout(layoutTimer);
      clearTimeout(visibilityTimer);
    };
  }, [pathname, variant]);
  
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0">
        {showBackground ? <HeroBackground /> : <Background variant={variant} />}
      </div>
      {/* Use Tailwind responsive classes for consistent spacing and responsive top margin */}
      <div className={`relative z-10 w-full ${
        variant === 'registration'
          ? 'pt-8 md:pt-16 lg:pt-32' /* Responsive padding for registration: small on mobile, large on desktop */
          : 'pt-4 md:pt-8' /* Reduced padding for other variants */
      }`}>
        <Header variant={variant} key={`header-${variant}-${pathname}-key`} />
      </div>
      {/* Apply opacity transition to prevent content blinking */}
      <main 
        className={`relative z-10 flex-1 pb-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden ${
          variant === 'registration' ? 'flex flex-col md:items-center mt-12 md:mt-24' 
          : variant === 'stats' ? '' 
          : 'flex flex-col md:justify-center'
        } transition-opacity duration-200`}
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className={`mx-auto w-full ${variant === 'stats' ? 'max-w-6xl' : 'max-w-3xl'}`}>
          {children}
        </div>
      </main>
      <Footer variant={variant} />
    </div>
  );
}
