'use client';

import Image from 'next/image';

interface CombinedLogoProps {
  alt: string;
}

export function CombinedLogo({ alt }: CombinedLogoProps): JSX.Element {
  return (
    <div className="w-16 h-16 relative animate-float-subtle">
      <Image
        src="/images/superheroes/heroapp-icon-optimized.webp"
        alt={alt}
        width={64}
        height={64}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
