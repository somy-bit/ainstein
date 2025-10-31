export const ErrorMessages = {
  // Authentication errors
  AUTH_REQUIRED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid username or password',
  ACCOUNT_BLOCKED: 'Account has been blocked. Please contact your administrator',
  PASSWORD_CHANGE_REQUIRED: 'Password change required',
  CURRENT_PASSWORD_INCORRECT: 'Current password is incorrect',
  PASSWORD_CHANGE_FAILED: 'Failed to change password',
  LOGIN_FAILED: 'Login failed. Please try again',
  REGISTRATION_FAILED: 'Registration failed. Please try again',
  PAYMENT_METHOD_REQUIRED: 'Payment method is required for trial registration',
  INVALID_PLAN_SELECTED: 'Invalid plan selected',

  // User management errors
  USER_NOT_FOUND: 'User not found',
  USER_CREATION_FAILED: 'Failed to create user',
  USER_UPDATE_FAILED: 'Failed to update user',
  USER_DELETE_FAILED: 'Failed to delete user',
  SUBSCRIPTION_LIMIT_REACHED: 'Subscription limit reached',
  ORGANIZATION_NOT_FOUND: 'Organization not found',
  ACCESS_DENIED: 'Access denied',

  // Partner management errors
  PARTNER_NOT_FOUND: 'Partner not found',
  PARTNER_CREATION_FAILED: 'Failed to create partner',
  PARTNER_UPDATE_FAILED: 'Failed to update partner',
  PARTNER_DELETE_FAILED: 'Failed to delete partner',
  PARTNER_LIMIT_REACHED: 'Partner limit reached for your subscription plan',

  // Lead management errors
  LEAD_NOT_FOUND: 'Lead not found',
  LEAD_CREATION_FAILED: 'Failed to create lead',
  LEAD_UPDATE_FAILED: 'Failed to update lead',
  LEAD_DELETE_FAILED: 'Failed to delete lead',

  // Organization errors
  ORGANIZATION_CREATION_FAILED: 'Failed to create organization',
  ORGANIZATION_UPDATE_FAILED: 'Failed to update organization',
  ORGANIZATION_DELETE_FAILED: 'Failed to delete organization',

  // Subscription errors
  SUBSCRIPTION_NOT_FOUND: 'Subscription not found',
  SUBSCRIPTION_UPDATE_FAILED: 'Failed to update subscription',
  SUBSCRIPTION_CANCEL_FAILED: 'Failed to cancel subscription',
  PAYMENT_FAILED: 'Payment processing failed',
  STRIPE_ERROR: 'Payment service error',

  // File/Knowledge errors
  FILE_UPLOAD_FAILED: 'File upload failed',
  FILE_NOT_FOUND: 'File not found',
  FILE_DELETE_FAILED: 'Failed to delete file',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size exceeds limit',

  // AI/Chat errors
  AI_SERVICE_UNAVAILABLE: 'AI service is currently unavailable',
  CHAT_FAILED: 'Failed to process chat message',
  TEXT_GENERATION_FAILED: 'Failed to generate text',

  // General errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_REQUEST: 'Invalid request',
  DATABASE_ERROR: 'Database operation failed',
  NETWORK_ERROR: 'Network error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later',
};


export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const createErrorResponse = (message: string, details?: Record<string, unknown>) => {
  return {
    error: message,
    ...(details && { details })
  };
};
