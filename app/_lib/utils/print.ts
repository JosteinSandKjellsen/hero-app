import { HeroColor } from '../types/api';

export interface PrintCardData {
  photoUrl: string;
  name: string;
  gender: 'male' | 'female' | 'robot';
  heroName: string;
  personalityName: string;
  color: HeroColor;
  scores: Array<{ color: string; percentage: number }>;
}

interface ResourceLoadingState {
  heroImage: boolean;
  bouvetLogo: boolean;
  personalityIcon: boolean;
  heroCardIcons: boolean;
}

export class ResourceTracker {
  private state: ResourceLoadingState = {
    heroImage: false,
    bouvetLogo: false,
    personalityIcon: false,
    heroCardIcons: false
  };

  private listeners: Array<() => void> = [];

  markLoaded(resource: keyof ResourceLoadingState): void {
    this.state[resource] = true;
    if (this.allLoaded()) {
      this.listeners.forEach(listener => listener());
    }
  }

  allLoaded(): boolean {
    return Object.values(this.state).every(loaded => loaded);
  }

  onAllLoaded(callback: () => void): void {
    if (this.allLoaded()) {
      callback();
    } else {
      this.listeners.push(callback);
    }
  }

  reset(): void {
    Object.keys(this.state).forEach(key => {
      this.state[key as keyof ResourceLoadingState] = false;
    });
    this.listeners = [];
  }
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export async function preloadRequiredImages(photoUrl: string): Promise<void> {
  await Promise.all([
    preloadImage(photoUrl),
    preloadImage('/images/logos/bouvet.svg')
  ]);
}

export function getPrintUrl(data: PrintCardData, shouldPrint: boolean = true): string {
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
    scores: scores.map(s => `${s.color}:${s.score}`).join(','),
    print: shouldPrint ? 'true' : 'false' // Control print parameter
  });

  return `/print?${params.toString()}`;
}

export function openPrintWindow(data: PrintCardData): void {
  // Use the same URL generation as getPrintUrl for consistency
  const url = getPrintUrl(data);
  const printWindow = window.open(url, '_blank');
  
  if (printWindow) {
    // The print page now handles its own resource loading and print triggering
    // We don't need to add additional handlers here
    console.log('Print window opened');
  }
}

// Add print styles to the document
export function addPrintStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    @page {
      size: 100mm 148mm;
      margin: 0;
      transform-origin: top left;
      -webkit-transform-origin: top left;
    }
    @media print {
      @viewport {
        width: 100mm;
        height: 148mm;
      }
      body {
        width: 100mm !important;
        height: 148mm !important;
        margin: 0 !important;
        padding: 0 !important;
        transform-origin: top left !important;
        -webkit-transform-origin: top left !important;
        transform: scale(1) !important;
        -webkit-transform: scale(1) !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize print process with timeout
export function initializePrint(resourceTracker: ResourceTracker): void {
  let printed = false;

  // Set up success handler
  resourceTracker.onAllLoaded(() => {
    if (!printed) {
      printed = true;
      addPrintStyles();
      // Give extra time for styles to be applied and final render
      setTimeout(() => {
        window.print();
      }, 500);
    }
  });

  // Set up fallback timeout
  setTimeout(() => {
    if (!printed) {
      console.warn('Not all resources loaded, printing anyway');
      printed = true;
      addPrintStyles();
      window.print();
    }
  }, 5000); // 5 second timeout
}
