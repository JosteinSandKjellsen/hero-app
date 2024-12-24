export type HeroColor = 'red' | 'yellow' | 'green' | 'blue';

export interface HeroNameRequest {
  personality: string;
  gender: 'male' | 'female';
  color: HeroColor;
}

export interface HeroNameResponse {
  name: string;
  error?: string;
}

export interface HeroImageRequest {
  personality: string;
  gender: 'male' | 'female';
  color: HeroColor;
  originalPhoto?: string;
}

export interface HeroImageResponse {
  imageUrl: string;
  error?: string;
}