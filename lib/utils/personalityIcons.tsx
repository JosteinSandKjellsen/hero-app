import { Flame, Sun, Leaf, Brain } from 'lucide-react';
import { HeroColor } from '../../app/_lib/types';

export function getPersonalityIcon(color: HeroColor): JSX.Element | null {
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
