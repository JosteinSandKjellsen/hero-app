import type { Metadata } from 'next';
import './globals.css';
import { PreloadStaticImages } from './_components/ui/PreloadStaticImages';

export const metadata: Metadata = {
  title: 'Bouvet - Superhelt Profilen',
  description: 'Oppdag superhelt-versjonen av deg selv!',
  icons: {
    icon: [
      { url: '/images/superheroes/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/superheroes/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/superheroes/favicon/favicon.ico', sizes: '48x48' },
    ],
    apple: [
      { url: '/images/superheroes/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/images/superheroes/favicon/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/images/superheroes/favicon/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/images/superheroes/favicon/site.webmanifest',
};

import { Inter, Bangers } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const bangers = Bangers({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bangers',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className={`${inter.variable} ${bangers.variable}`}>
      <head>
        <PreloadStaticImages />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-dark via-dark to-dark`}>
        {children}
      </body>
    </html>
  );
}
