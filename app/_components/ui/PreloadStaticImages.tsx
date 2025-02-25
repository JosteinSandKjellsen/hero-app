'use client';

import { useEffect } from 'react';
import { heroImages } from '@/app/_lib/constants/images';

/**
 * Component that dynamically injects prefetch link tags for static hero images
 * when the component mounts. Prefetch is used instead of preload because these
 * images aren't needed immediately on page load but will be used later in the
 * application flow (typically in the HeroImageCarousel during loading states).
 */
export function PreloadStaticImages(): JSX.Element {
  useEffect(() => {
    // Only prefetch first few images to avoid excessive network requests
    const imagesToPrefetch = heroImages.slice(0, 4);

    // Create link elements for each image to prefetch
    imagesToPrefetch.forEach((imageSrc) => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'prefetch';
      linkElement.href = imageSrc;
      // 'as' attribute isn't required for prefetch, but helps with resource prioritization
      linkElement.as = 'image';
      linkElement.setAttribute('fetchpriority', 'low');
      document.head.appendChild(linkElement);
    });

    // Cleanup function to remove prefetch tags when component unmounts
    return () => {
      const prefetchLinks = document.querySelectorAll('link[rel="prefetch"][as="image"]');
      prefetchLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, []);

  return <></>; // Return empty fragment as this component doesn't render visible UI
}
