import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';
 
export const locales = ['en', 'no'] as const;
export const defaultLocale = 'no' as const;

export type Locale = (typeof locales)[number];

// This is a required default export that gets used by next-intl
// to enable static rendering
export default getRequestConfig(async () => {
  const messages = await import(`../messages/${defaultLocale}.json`);
  return {
    defaultLocale,
    messages: messages.default,
    timeZone: 'Europe/Oslo',
    locale: defaultLocale
  };
});

export const {Link, redirect, usePathname, useRouter} = createSharedPathnamesNavigation({
  locales
});
