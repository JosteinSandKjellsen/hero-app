import { FC } from 'react';
import Image from 'next/image';

export const Footer: FC = (): JSX.Element => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 p-4">
      <div className="max-w-3xl mx-auto flex items-center justify-center">
        <Image
          src="https://bouvet.fotoware.cloud/fotoweb/resources/logos/main.png"
          alt="Bouvet Logo"
          width={120}
          height={24}
          className="h-6 object-contain opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>
    </footer>
  );
}
