'use client';

import { useTranslations } from 'next-intl';

interface GenderSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function GenderSelect({ value, onChange, error }: GenderSelectProps): JSX.Element {
  const t = useTranslations('registration.gender');

  const genderOptions = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
    { value: 'robot', label: t('robot') },
  ];

  return (
    <div>
      <label htmlFor="gender-group" className="block text-sm font-medium text-white mb-1">
        {t('label')}
      </label>
      <div id="gender-group" className="flex gap-4">
        {genderOptions.map((option) => (
          <label key={option.value} htmlFor={`gender-${option.value}`} className="flex items-center">
            <input
              id={`gender-${option.value}`}
              type="radio"
              name="gender"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500 bg-white/10 border-white/20"
            />
            <span className="ml-2 text-white">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-300">{error}</p>
      )}
    </div>
  );
}
