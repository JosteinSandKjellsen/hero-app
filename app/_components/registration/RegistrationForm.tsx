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
  const t = useTranslations('registration');
  
  const { values, errors, handleChange, handleSubmit } = useForm<UserData>({
    initialValues: {
      name: '',
      gender: 'male',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof UserData, string>> = {};
      if (!values.name.trim()) {
        errors.name = t('name.required');
      }
      return errors;
    },
    onSubmit,
  });

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 md:p-8 animate-fadeIn border border-white/20">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        {t('title')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="name"
          name="name"
          label={t('name.label')}
          value={values.name}
          onChange={handleChange}
          placeholder={t('name.placeholder')}
          error={errors.name}
        />

        <GenderSelect
          value={values.gender}
          onChange={handleChange}
          error={errors.gender}
        />

        <SubmitButton>{t('start')}</SubmitButton>
      </form>
    </div>
  );
}
