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
      // Ensure fonts are loaded
      await document.fonts.ready;

      // Temporarily make the hidden card visible for capture
      const originalStyles = {
        position: cardRef.current.style.position,
        left: cardRef.current.style.left,
        opacity: cardRef.current.style.opacity,
        pointerEvents: cardRef.current.style.pointerEvents,
      };

      // Position element for capture
      Object.assign(cardRef.current.style, {
        position: 'fixed',
        left: '0',
        opacity: '1',
        pointerEvents: 'none',
        zIndex: '-9999',
      });

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 600,
        height: 800,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-card-clone]');
          if (clonedElement instanceof HTMLElement) {
            clonedElement.style.transform = 'none';
          }
        },
      });

      // Restore original styles
      Object.assign(cardRef.current.style, originalStyles);

      // Create download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${heroName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = url;
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
