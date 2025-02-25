'use client';

import { useEffect } from 'react';
import { heroImages } from '@/app/_lib/constants/images';

/**
 * Component that dynamically injects preload link tags for static hero images
 * when the component mounts
 */
export function PreloadStaticImages(): JSX.Element {
  useEffect(() => {
    // Only preload first few images to avoid excessive network requests
    const imagesToPreload = heroImages.slice(0, 4);

    // Create link elements for each image to preload
    imagesToPreload.forEach((imageSrc) => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'preload';
      linkElement.href = imageSrc;
      linkElement.as = 'image';
      linkElement.setAttribute('fetchpriority', 'low');
      document.head.appendChild(linkElement);
    });

    // Cleanup function to remove preload tags when component unmounts
    return () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
      preloadLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, []);

  return <></>; // Return empty fragment as this component doesn't render visible UI
}
