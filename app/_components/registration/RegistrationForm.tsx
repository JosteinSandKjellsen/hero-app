'use client';

import { useTranslations } from 'next-intl';
import { useForm } from '../../_hooks/useForm';
import { FormField } from './FormField';
import { GenderSelect } from './GenderSelect';
import { SubmitButton } from './SubmitButton';
import type { UserData } from '../../_lib/types';
import { useEffect, useState } from 'react';

interface RegistrationFormProps {
  onSubmit: (data: UserData) => void;
}

export function RegistrationForm({ onSubmit }: RegistrationFormProps): JSX.Element {
  const t = useTranslations('registration');
  const [isVisible, setIsVisible] = useState(false);
  
  // Use effect to control when the form becomes visible with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); // Small delay to ensure layout is ready before showing
    
    return () => clearTimeout(timer);
  }, []);
  
  const { values, errors, handleChange, handleSubmit } = useForm<UserData>({
    initialValues: {
      name: '',
      gender: 'male',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof UserData, string>> = {};
      if (!values.name.trim()) {
        errors.name = t('name.required');
      } else if (values.name.trim().length > 21) {
        errors.name = t('name.maxLength');
      }
      return errors;
    },
    onSubmit,
  });

  return (
    <div 
      className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 md:p-8 border border-white/20 transition-all duration-500 w-full"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
        maxWidth: '48rem', /* Further increased width */
        margin: '0 auto'
      }}
    >
      <h2 className="mb-6 text-center">
        <span className="text-[1.2rem] text-white font-sans">
          {t('title')}
        </span>
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
