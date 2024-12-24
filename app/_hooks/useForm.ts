'use client';

import { useState, useCallback } from 'react';

interface UseFormProps<T> {
  initialValues: T;
  validate: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void;
}

export function useForm<T>({ initialValues, validate, onSubmit }: UseFormProps<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof T]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(values);
    
    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    } else {
      setErrors(newErrors);
    }
  }, [values, validate, onSubmit]);

  return {
    values,
    errors,
    handleChange,
    handleSubmit,
  };
}