export type LayoutVariant = 'registration' | 'quiz' | 'camera' | 'results' | 'stats';

export interface LayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  variant?: LayoutVariant;
}
