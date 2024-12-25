'use client';

import { Download, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ResultsActionsProps {
  cardRef: React.RefObject<HTMLDivElement>;
  heroName: string;
  onReset: () => void;
}

export function ResultsActions({ cardRef, heroName, onReset }: ResultsActionsProps): JSX.Element {
  const handleDownload = async (): Promise<void> => {
    if (!cardRef.current) return;

    try {
      // Wait for fonts to load
      await document.fonts.ready;

      // Create canvas with fixed dimensions
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 600,
        height: 800,
        onclone: (doc) => {
          // Ensure the cloned element has the correct dimensions
          const clonedCard = doc.querySelector('[data-card-clone]');
          if (clonedCard instanceof HTMLElement) {
            clonedCard.style.width = '600px';
            clonedCard.style.height = '800px';
          }
        }
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${heroName.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-md mx-auto">
      <button
        onClick={handleDownload}
        className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        <span>Last ned superhelt-kort</span>
      </button>

      <button
        onClick={onReset}
        className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg 
                  hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-5 h-5" />
        <span>Ny superhelt!</span>
      </button>
    </div>
  );
}
