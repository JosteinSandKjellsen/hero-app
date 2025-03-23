'use client';

import Image from 'next/image';

export function CardBackside(): JSX.Element {
  const BORDER_COLOR = 'border-[#2d3a82]'; // Bouvet blue as a hex color

  return (
    <div 
      className={`absolute inset-0 w-full h-full ${BORDER_COLOR} bg-white/10 rounded-xl border-[10px] flex items-center justify-center`}
    >
      <div className="relative w-[200px] h-[100px]">
        <Image
          src="/images/logos/bouvet.svg"
          alt="Bouvet Logo"
          width={200}
          height={100}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
