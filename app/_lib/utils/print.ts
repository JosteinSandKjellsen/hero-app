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

export function getPrintUrl(data: PrintCardData): string {
  // Extract generation ID from Leonardo AI URL
  // URL format: https://cdn.leonardo.ai/users/{userId}/generations/{generationId}/[filename]
  const imageId = data.photoUrl.split('/generations/')[1]?.split('/')[0] || '';

  // Convert scores to the format "red:8,blue:5,green:3,yellow:4"
  const scores = data.scores.map(score => ({
    color: score.color,
    score: Math.round(score.percentage / 10)
  }));

  const params = new URLSearchParams({
    imageId,
    name: data.name,
    gender: data.gender,
    heroName: data.heroName,
    personalityName: data.personalityName,
    color: data.color,
    scores: scores.map(s => `${s.color}:${s.score}`).join(',')
  });

  return `/print?${params.toString()}`;
}

export function openPrintWindow(data: PrintCardData): void {
  // Use the same URL generation as getPrintUrl for consistency
  const url = getPrintUrl(data);
  const printWindow = window.open(url, '_blank');
  
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
