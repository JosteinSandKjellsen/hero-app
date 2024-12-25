'use client';

import { useForm } from '../../_hooks/useForm';
import { FormField } from './FormField';
import { GenderSelect } from './GenderSelect';
import { SubmitButton } from './SubmitButton';
import type { UserData } from '../../_lib/types';

interface RegistrationFormProps {
  onSubmit: (data: UserData) => void;
}

export function RegistrationForm({ onSubmit }: RegistrationFormProps): JSX.Element {
  const { values, errors, handleChange, handleSubmit } = useForm<UserData>({
    initialValues: {
      name: '',
      gender: 'male',
    },
    validate: (values) => {
      const errors: Partial<Record<keyof UserData, string>> = {};
      if (!values.name.trim()) {
        errors.name = 'Navn er påkrevd';
      }
      return errors;
    },
    onSubmit,
  });

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 md:p-8 animate-fadeIn border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">
        Finn din superhelt-identitet
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          id="name"
          name="name"
          label="Navn"
          value={values.name}
          onChange={handleChange}
          placeholder="Skriv inn ditt navn"
          error={errors.name}
        />

        <GenderSelect
          value={values.gender}
          onChange={handleChange}
          error={errors.gender}
        />

        <SubmitButton>Start</SubmitButton>
      </form>
    </div>
  );
}
