'use client';

import Image from 'next/image';

export function CardBackside(): JSX.Element {
  const BOUVET_BLUE = '45, 58, 130'; // Bouvet's blue color
  const BORDER_COLOR = 'border-[#2d3a82]'; // Bouvet blue as a hex color

  return (
    <div 
      className={`absolute inset-0 w-full h-full ${BORDER_COLOR} bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl border-[10px] flex items-center justify-center transition-all duration-700 backdrop-filter backdrop-blur-sm`}
      style={{ 
        zIndex: 1,
        boxShadow: `
          0 25px 50px -12px rgba(0, 0, 0, 0.25),
          inset 0 0 30px rgba(${BOUVET_BLUE}, 0.05)
        `,
        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(${BOUVET_BLUE}, 0.06) 15%, transparent 60%),
          repeating-linear-gradient(45deg, rgba(${BOUVET_BLUE}, 0.03) 0%, rgba(${BOUVET_BLUE}, 0.03) 2px, transparent 2px, transparent 10px)
        `
      }}
    >
      {/* Decorative corner elements */}
      <div className="absolute inset-8 border-2 rounded-lg opacity-10 transition-all duration-700"
        style={{
          borderImage: `linear-gradient(45deg, rgba(${BOUVET_BLUE}, 0.3), transparent) 1`,
        }}
      />
      
      {/* Logo container with enhanced effects */}
      <div 
        className="relative w-[200px] h-[100px] transition-all duration-700"
        style={{ 
          opacity: 0.9,
          filter: `drop-shadow(0 0 10px rgba(${BOUVET_BLUE}, 0.15))`
        }}
      >
        <Image
          src="/images/logos/bouvet-optimized.webp"
          alt="Bouvet Logo"
          width={200}
          height={100}
          className="w-full h-full object-contain transition-all duration-700"
          style={{ 
            filter: `brightness(0) contrast(0.9)`,
            transform: 'scale(0.9)',
          }}
          priority
        />
      </div>

      {/* Enhanced decorative layers */}
      <div className="absolute inset-0 w-full h-full overflow-hidden rounded pointer-events-none">
        <div className="absolute inset-6 border border-gray-200 rounded-lg opacity-20" />
        <div 
          className="absolute inset-0" 
          style={{ 
            backgroundImage: `
              radial-gradient(circle at 0% 0%, rgba(${BOUVET_BLUE}, 0.04) 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, rgba(${BOUVET_BLUE}, 0.04) 0%, transparent 50%)
            `,
            transform: 'scale(1.5)',
            opacity: 0.6
          }} 
        />
        
        {/* Subtle corner accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 rounded-tl-lg opacity-20" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 rounded-tr-lg opacity-20" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 rounded-bl-lg opacity-20" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 rounded-br-lg opacity-20" />
      </div>
    </div>
  );
}
