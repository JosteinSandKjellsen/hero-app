export interface HeroNameResponse {
  name: string;
  error?: string;
}

export interface HeroNameRequest {
  personality: string;
  gender: 'male' | 'female';
  color: string;
}