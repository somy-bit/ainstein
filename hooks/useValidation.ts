import { useState } from 'react';

interface ValidationResult {
  success: boolean;
  errors: { field: string; message: string }[];
  data?: any;
}

type ValidatorFunction = (data: any) => ValidationResult;

export const useValidation = (validator: ValidatorFunction) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: unknown): boolean => {
    const result = validator(data);
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      result.errors.forEach(err => {
        newErrors[err.field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const getError = (field: string) => errors[field];
  const hasError = (field: string) => !!errors[field];
  const clearErrors = () => setErrors({});

  return { validate, getError, hasError, clearErrors, errors };
};
