'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname, type Locale } from '../../i18n/request';
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export function LanguageSwitcher(): React.JSX.Element {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isChanging, setIsChanging] = useState(false);

  const switchLocale = async (newLocale: Locale): Promise<void> => {
    setIsChanging(true);
    await router.replace(pathname, { locale: newLocale });
    setIsChanging(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLocale('no')}
        disabled={isChanging || locale === 'no'}
        className={`relative h-7 px-2 bg-white border-2 border-black text-sm uppercase font-wild-words transition-all ${
          locale === 'no'
            ? 'text-white transform translate-y-[1px] shadow-[1px_1px_0_rgba(0,0,0,0.8)]'
            : 'text-black hover:translate-y-[-1px] shadow-[2px_2px_0_rgba(0,0,0,0.8)]'
        } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          background: locale === 'no' ? 'linear-gradient(135deg, #ffd700 0%, #ff4500 100%)' : 'white',
        }}
      >
        NO
      </button>
      <button
        onClick={() => switchLocale('en')}
        disabled={isChanging || locale === 'en'}
        className={`relative h-7 px-2 bg-white border-2 border-black text-sm uppercase font-wild-words transition-all ${
          locale === 'en'
            ? 'text-white transform translate-y-[1px] shadow-[1px_1px_0_rgba(0,0,0,0.8)]'
            : 'text-black hover:translate-y-[-1px] shadow-[2px_2px_0_rgba(0,0,0,0.8)]'
        } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{
          background: locale === 'en' ? 'linear-gradient(135deg, #ffd700 0%, #ff4500 100%)' : 'white',
        }}
      >
        EN
      </button>
    </div>
  );
}
