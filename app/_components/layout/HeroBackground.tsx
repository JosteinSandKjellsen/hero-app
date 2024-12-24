'use client';

import Image from 'next/image';

export function HeroBackground(): JSX.Element {
  const images = [
    '/images/superheroes/red-man.jpeg',
    '/images/superheroes/blue-woman.jpeg',
    '/images/superheroes/green-man.jpeg',
    '/images/superheroes/yellow-woman.jpeg',
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 to-blue-900/90 mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0.3)_100%)]" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 h-full gap-1 opacity-50">
        {images.map((image, index) => (
          <div key={index} className="relative overflow-hidden group">
            <Image
              src={image}
              alt="Superhero"
              fill
              className="object-cover scale-105 transition-transform duration-5000 group-hover:scale-110"
            />
          </div>
        ))}
      </div>
    </div>
  );
}