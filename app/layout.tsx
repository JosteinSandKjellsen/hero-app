import type { Metadata } from 'next';
import { Inter, Bangers } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'Superhelt Quiz',
  description: 'Oppdag din indre superhelt!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="nb" className={`${inter.variable} ${bangers.variable}`}>
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}