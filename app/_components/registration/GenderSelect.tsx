'use client';

import { useTranslations } from 'next-intl';

interface GenderSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function GenderSelect({ value, onChange, error }: GenderSelectProps): JSX.Element {
  const t = useTranslations();

  const genderOptions = [
    { value: 'male', label: t('registration.gender.male') },
    { value: 'female', label: t('registration.gender.female') },
    { value: 'robot', label: t('registration.gender.robot') },
  ];

  return (
    <div>
      <label className="flex items-center text-lg text-dark mb-2 uppercase min-h-[2rem] font-wild-words">
        {t('registration.gender.label')}
      </label>
      <div className="comic-radio-group">
        {genderOptions.map((option) => (
          <label key={option.value} className="comic-radio-label">
            <input
              type="radio"
              name="gender"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="comic-radio-input"
            />
            <span className="text-dark">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm font-bold text-red-600">{error}</p>
      )}
    </div>
  );
}
