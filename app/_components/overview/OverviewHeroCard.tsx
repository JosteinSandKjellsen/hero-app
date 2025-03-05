'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { getHeroCardIcon } from '@/app/_lib/utils/heroCardIcons';
import { heroColors } from '@/app/_lib/constants/colors';
import { HeroImage } from '@/app/_components/ui/HeroImage';
import type { HeroColor } from '@/app/_lib/types/api';

interface OverviewHeroCardProps {
  hero: {
    name: string;
    userName: string;
    color: HeroColor;
    imageId: string;
  };
  isNew?: boolean;
}

export function OverviewHeroCard({ hero, isNew }: OverviewHeroCardProps): JSX.Element {
  const backgroundColor = heroColors[hero.color]?.bg || 'bg-slate-500';

  return (
    <motion.div 
      initial={{ scale: isNew ? 1.05 : 1, opacity: isNew ? 0 : 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`w-full h-full relative ${backgroundColor} rounded-2xl shadow-2xl overflow-hidden group`}
    >
      <div className="absolute inset-0">
        <div className="relative w-full h-full overflow-hidden">
          <HeroImage
            imageId={hero.imageId}
            alt={hero.name}
            className="object-top"
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 text-white">
            {getHeroCardIcon(hero.color)}
          </div>
          <div>
            <p className="text-sm font-bold text-white truncate">
              {hero.name}
            </p>
            <p className="text-xs text-white/80 truncate">
              {hero.userName}
            </p>
          </div>
        </div>
      </div>

      {/* New Badge */}
      <AnimatePresence>
        {isNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold shadow-lg"
          >
            New!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
