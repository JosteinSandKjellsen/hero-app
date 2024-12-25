import { Flame, Sun, Leaf, Brain } from 'lucide-react';

export function getPersonalityIcon(color: 'red' | 'yellow' | 'green' | 'blue'): React.ReactElement | null {
  switch (color) {
    case 'red':
      return <Flame className="w-6 h-6 text-white" />;
    case 'yellow':
      return <Sun className="w-6 h-6 text-white" />;
    case 'green':
      return <Leaf className="w-6 h-6 text-white" />;
    case 'blue':
      return <Brain className="w-6 h-6 text-white" />;
    default:
      return null;
  }
}
