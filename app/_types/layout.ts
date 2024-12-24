export type LayoutVariant = 'registration' | 'quiz' | 'camera' | 'results';

export interface LayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  variant?: LayoutVariant;
}