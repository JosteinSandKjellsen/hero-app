import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { getRequestConfig } from 'next-intl/server';
 
export const locales = ['en', 'no'] as const;
export const defaultLocale = 'no' as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale
});

// This is a required default export that gets used by next-intl
// to enable static rendering
export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;
 
  // Ensure a valid locale is used
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }
 
  const messages = await import(`../messages/${locale}.json`);
  return {
    locale,
    messages: messages.default,
    timeZone: 'Europe/Oslo'
  };
});

export const {Link, redirect, usePathname, useRouter} = createNavigation(routing);
