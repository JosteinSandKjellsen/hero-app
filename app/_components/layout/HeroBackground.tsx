'use client';

export function HeroBackground(): JSX.Element {
  return (
    <div 
      className="fixed inset-0 -z-15 overflow-hidden"
      style={{
        backgroundImage: 'url(/images/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 comic-dots-overlay" style={{ zIndex: 1 }} />
    </div>
  );
}
