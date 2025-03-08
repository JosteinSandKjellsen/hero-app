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
    <div className="flex items-center gap-[0.4rem]">
      <span className={`text-xs font-medium text-white ${locale === 'no' ? 'opacity-100' : 'opacity-50'}`}>no</span>
      <button
        onClick={() => switchLocale(locale === 'en' ? 'no' : 'en')}
        disabled={isChanging}
        className={`relative w-[2.3rem] h-[1.5rem] rounded-full transition-colors duration-200 flex items-center bg-white/10 border border-white/20 overflow-hidden ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={`Switch to ${locale === 'en' ? 'Norwegian' : 'English'}`}
        aria-pressed={locale === (locale === 'en' ? 'no' : 'en')}
      >
        {isChanging ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <div
            className="absolute inset-[2px] rounded-full overflow-hidden"
            style={{
              backgroundImage: `url('/images/flags/${locale === 'en' ? 'uk' : 'no'}.svg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
        <span
          className={`absolute block w-[calc(1.5rem-6px)] h-[calc(1.5rem-6px)] bg-white rounded-full shadow transform transition-transform duration-200 ${
            locale === 'en' ? 'translate-x-[calc(2.3rem-1.5rem+2px)]' : 'translate-x-[2px]'
          }`}
        />
      </button>
      <span className={`text-xs font-medium text-white ${locale === 'en' ? 'opacity-100' : 'opacity-50'}`}>en</span>
    </div>
  );
}
