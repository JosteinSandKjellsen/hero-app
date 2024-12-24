import { LayoutVariant } from '@/types/layout';

interface BackgroundProps {
  variant: LayoutVariant;
}

export function Background({ variant }: BackgroundProps) {
  switch (variant) {
    case 'quiz':
      return (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600" />
      );
    case 'camera':
      return (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-800 via-indigo-900 to-blue-900" />
      );
    case 'results':
      return (
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-purple-100 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-transparent to-blue-100/50" />
        </div>
      );
    default:
      return null;
  }
}