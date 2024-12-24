import { Flame, Sun, Leaf, Brain } from 'lucide-react';

export function getPersonalityIcon(color: string) {
  const iconProps = { className: 'w-6 h-6 text-white' };
  
  switch (color) {
    case 'red':
      return <Flame {...iconProps} />;
    case 'yellow':
      return <Sun {...iconProps} />;
    case 'green':
      return <Leaf {...iconProps} />;
    case 'blue':
      return <Brain {...iconProps} />;
    default:
      return null;
  }
}