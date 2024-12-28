import { HeroColor } from '../types/api';

export interface PrintCardData {
  photoUrl: string;
  name: string;
  gender: 'male' | 'female';
  heroName: string;
  personalityName: string;
  color: HeroColor;
  scores: Array<{ color: string; percentage: number }>;
}

export function openPrintWindow(data: PrintCardData): void {
  const params = new URLSearchParams({
    photoUrl: data.photoUrl,
    name: data.name,
    gender: data.gender,
    heroName: data.heroName,
    personalityName: data.personalityName,
    color: data.color,
    scores: data.scores.map(s => `${s.color}:${s.percentage}`).join(',')
  });

  const printWindow = window.open(`/print?${params.toString()}`, '_blank');
  
  if (printWindow) {
    // Wait for the page to load before triggering print
    printWindow.onload = () => {
      setTimeout(() => {
        // Set print settings to optimize for PDF
        const style = document.createElement('style');
        style.textContent = `
          @page {
            size: A4 portrait;
            margin: 0;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `;
        printWindow.document.head.appendChild(style);

        // Trigger print dialog (will show PDF option)
        printWindow.print();
      }, 1000); // Give a second for images to load
    };
  }
}
