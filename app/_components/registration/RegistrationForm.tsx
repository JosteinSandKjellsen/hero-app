'use client';

import { useTranslations } from 'next-intl';
import { useForm } from '../../_hooks/useForm';
import { FormField } from './FormField';
import { GenderSelect } from './GenderSelect';
import { SubmitButton } from './SubmitButton';
import type { UserData } from '../../_lib/types';

interface RegistrationFormProps {
  onSubmit: (data: UserData) => void;
}

export function RegistrationForm({ onSubmit }: RegistrationFormProps): JSX.Element {
  const t = useTranslations();
  
  const { values, errors, handleChange, handleSubmit } = useForm<UserData>({
    initialValues: {
      name: '',
      gender: 'male',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof UserData, string>> = {};
      if (!values.name.trim()) {
        errors.name = t('registration.name.required');
      }
      return errors;
    },
    onSubmit,
  });

  return (
    <div className="comic-form-container animate-fadeIn relative">
      <div className="comic-3d-text">
        <div className="text-layer" data-text={t('hero.title.3d')}>{t('hero.title.3d')}</div>
      </div>
      <div className="mb-8 text-center flex flex-col items-center justify-center gap-2">
        <div className="text-5xl mb-4" style={{ visibility: 'hidden' }}>Placeholder</div>
        <p className="text-[22px] text-dark/90 uppercase font-wild-words">
          {t('header.subtitle')}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="name"
          name="name"
          label={t('registration.name.label')}
          value={values.name}
          onChange={handleChange}
          placeholder={t('registration.name.placeholder')}
          error={errors.name}
        />

        <GenderSelect
          value={values.gender}
          onChange={handleChange}
          error={errors.gender}
        />

        <SubmitButton>{t('registration.start')}</SubmitButton>
      </form>
    </div>
  );
}
