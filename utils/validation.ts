// Custom validation helpers (replacing zod)
interface ValidationResult {
  success: boolean;
  errors: { field: string; message: string }[];
  data?: any;
}

// Helper functions
const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isStrongPassword = (password: string): boolean => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
};

const trimString = (str: string): string => str.trim();

// Validation functions
export const validateLogin = (data: any): ValidationResult => {
  console.log('validateLogin called with:', data); // DEBUG
  const errors: { field: string; message: string }[] = [];
  
  if (!data.email || !trimString(data.email)) {
    console.log('Email validation failed:', data.email); // DEBUG
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isEmail(trimString(data.email))) {
    console.log('Email format validation failed:', data.email); // DEBUG
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (!data.password || !trimString(data.password)) {
    console.log('Password validation failed:', data.password); // DEBUG
    errors.push({ field: 'password', message: 'Password is required' });
  }
  
  const result = {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      email: trimString(data.email).toLowerCase(),
      password: data.password
    } : undefined
  };
  
  console.log('validateLogin result:', result); // DEBUG
  return result;
};

export const validateRegister = (data: any): ValidationResult => {
  const errors: { field: string; message: string }[] = [];
  
  if (!data.firstName || trimString(data.firstName).length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  }
  
  if (!data.lastName || trimString(data.lastName).length < 2) {
    errors.push({ field: 'lastName', message: 'Last name must be at least 2 characters' });
  }
  
  if (!data.email || !isEmail(trimString(data.email))) {
    errors.push({ field: 'email', message: 'Valid email is required' });
  }
  
  if (!data.password || data.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  } else if (!isStrongPassword(data.password)) {
    errors.push({ field: 'password', message: 'Password must contain uppercase, lowercase, and number' });
  }
  
  if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: "Passwords don't match" });
  }
  
  if (!data.organizationName || trimString(data.organizationName).length < 2) {
    errors.push({ field: 'organizationName', message: 'Organization name must be at least 2 characters' });
  }
  
  return {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      firstName: trimString(data.firstName),
      lastName: trimString(data.lastName),
      email: trimString(data.email).toLowerCase(),
      password: data.password,
      organizationName: trimString(data.organizationName),
      planId: data.planId
    } : undefined
  };
};

export const validateChangePassword = (data: any): ValidationResult => {
  const errors: { field: string; message: string }[] = [];
  
  if (!data.currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  
  if (!data.newPassword || data.newPassword.length < 8) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 8 characters' });
  } else if (!isStrongPassword(data.newPassword)) {
    errors.push({ field: 'newPassword', message: 'Password must contain uppercase, lowercase, and number' });
  }
  
  if (data.newPassword !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: "Passwords don't match" });
  }
  
  return {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    } : undefined
  };
};

// Type definitions
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  planId: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OrganizationData {
  name: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

export interface PartnerData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed Won' | 'Closed Lost';
  source?: string;
  notes?: string;
}

export interface KnowledgeFileData {
  title: string;
  description?: string;
  tags?: string[];
}
