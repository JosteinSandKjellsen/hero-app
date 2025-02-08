'use client';

import Image from 'next/image';

interface CombinedLogoProps {
  alt: string;
}

export function CombinedLogo({ alt }: CombinedLogoProps): JSX.Element {
  return (
    <div className="w-16 h-16 relative animate-float-subtle">
      <Image
        src="/images/superheroes/heroapp-icon.png"
        alt={alt}
        fill
        sizes="64px"
        className="object-contain"
        priority
      />
    </div>
  );
}
