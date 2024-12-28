import { Flame, Sun, Leaf, Brain } from 'lucide-react';

export function getHeroCardIcon(color: 'red' | 'yellow' | 'green' | 'blue'): React.ReactElement | null {
  switch (color) {
    case 'red':
      return <Flame className="w-full h-full text-white" />;
    case 'yellow':
      return <Sun className="w-full h-full text-white" />;
    case 'green':
      return <Leaf className="w-full h-full text-white" />;
    case 'blue':
      return <Brain className="w-full h-full text-white" />;
    default:
      return null;
  }
}
