import { Request, Response, NextFunction } from 'express';

// Simple validation helpers (replacing zod)
const trimmedString = (value: string, min = 1, max = 255): boolean => {
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max;
};

const isEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
};

const isStrongPassword = (value: string): boolean => {
  return value.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value);
};

// Validation middleware factory
export const validateRequest = (validationRules: Record<string, (value: any) => string | null>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('=== VALIDATION DEBUG ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('Validation rules:', Object.keys(validationRules));
      
      const trimmedBody = trimRequestBody(req.body);
      const errors: { field: string; message: string }[] = [];
      
      for (const [field, validator] of Object.entries(validationRules)) {
        // Handle nested field paths like 'adminData.email'
        const value = getNestedValue(trimmedBody, field);
        console.log(`Validating field '${field}':`, value);
        const error = validator(value);
        if (error) {
          console.log(`Validation failed for '${field}':`, error);
          errors.push({ field, message: error });
        } else {
          console.log(`Validation passed for '${field}'`);
        }
      }
      
      if (errors.length > 0) {
        console.log('Validation errors:', errors);
        const response = {
          error: 'Validation failed',
          details: errors,
          message: `Validation failed for: ${errors.map(e => e.field).join(', ')}`
        };
        console.log('Sending error response:', response);
        return res.status(400).json(response);
      }
      
      console.log('All validations passed');
      req.body = trimmedBody;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error during validation'
      });
    }
  };
};

// Helper function to get nested values from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

// Helper function to trim all string values recursively
const trimRequestBody = (obj: any): any => {
  if (typeof obj === 'string') {
    return obj.trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(trimRequestBody);
  }
  
  if (obj && typeof obj === 'object') {
    const trimmed: any = {};
    for (const [key, value] of Object.entries(obj)) {
      trimmed[key] = trimRequestBody(value);
    }
    return trimmed;
  }
  
  return obj;
};

// Common validation rules
export const authValidation = {
  email: (value: any) => {
    if (!value) return 'Email is required';
    if (!isEmail(value)) return 'Invalid email format';
    return null;
  },
  password: (value: any) => {
    if (!value) return 'Password is required';
    if (typeof value !== 'string' || value.length < 1) return 'Password is required';
    return null;
  },
  strongPassword: (value: any) => {
    if (!value) return 'Password is required';
    if (!isStrongPassword(value)) return 'Password must contain uppercase, lowercase, and number';
    return null;
  }
};
