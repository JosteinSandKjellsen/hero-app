import { IMAGES_CONFIG } from '../../constants/images';
import type { HeroColor } from '../../constants/colors';

interface SuperheroImagePaths {
  male: string;
  female: string;
}

export function getSuperheroImagePaths(color: HeroColor): SuperheroImagePaths {
  const basePath = IMAGES_CONFIG.superheroes.basePath;
  
  return {
    male: `${basePath}/${color}-man.jpeg`,
    female: `${basePath}/${color}-woman.jpeg`
  };
}

export function validateImageUrl(url: string): boolean {
  return Boolean(url && (url.startsWith('http') || url.startsWith('/')));
}
