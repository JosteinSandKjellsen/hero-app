'use client';

import Image from 'next/image';

interface CombinedLogoProps {
  alt: string;
}

export function CombinedLogo({ alt }: CombinedLogoProps): JSX.Element {
  return (
    <div className="w-12 h-12 relative animate-float-subtle mt-1">
      <Image
        src="/images/superheroes/heroapp-icon.png"
        alt={alt}
        fill
        sizes="48px"
        className="object-contain"
        priority
      />
    </div>
  );
}
