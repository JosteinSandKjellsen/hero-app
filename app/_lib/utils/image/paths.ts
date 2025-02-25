import { IMAGES_CONFIG } from '../../constants/images';
import type { HeroColor } from '../../constants/colors';

interface SuperheroImagePaths {
  male: string;
  female: string;
}

export function getSuperheroImagePaths(color: HeroColor): SuperheroImagePaths {
  const basePath = IMAGES_CONFIG.superheroes.basePath;
  
  return {
    male: `${basePath}/${color}-man.webp`,
    female: `${basePath}/${color}-woman.webp`
  };
}

export function validateImageUrl(url: string): boolean {
  return Boolean(url && (url.startsWith('http') || url.startsWith('/')));
}
