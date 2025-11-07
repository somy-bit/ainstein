/**
 * Production-Ready Logging Configuration
 * 
 * This configuration ensures secure logging practices for production environments.
 * It prevents sensitive data from being logged and provides structured logging.
 */

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug'
};

// Sensitive fields that should never be logged
export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'apiKey',
  'api_key',
  'authorization',
  'auth',
  'jwt',
  'bearer',
  'credentials',
  'privateKey',
  'private_key',
  'secretKey',
  'secret_key',
  'stripeSecretKey',
  'webhookSecret',
  'geminiApiKey'
];

/**
 * Sanitizes an object by removing or masking sensitive fields
 */
export function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    // Check if this field contains sensitive data
    const isSensitive = SENSITIVE_FIELDS.some(field => 
      lowerKey.includes(field.toLowerCase())
    );
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Safe logger that automatically sanitizes sensitive data
 */
export class SecureLogger {
  private isProduction = process.env.NODE_ENV === 'production';
  private logLevel = process.env.LOG_LEVEL || (this.isProduction ? 'info' : 'debug');

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    
    return requestedLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const sanitizedData = data ? sanitizeLogData(data) : undefined;
    
    if (sanitizedData) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${JSON.stringify(sanitizedData)}`;
    }
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  // Special method for authentication events
  auth(message: string, userId?: string): void {
    if (this.shouldLog('info')) {
      const safeData = userId ? { userId } : undefined;
      console.info(this.formatMessage('auth', message, safeData));
    }
  }
}

// Export singleton instance
export const logger = new SecureLogger();

// Export convenience functions
export const logError = (message: string, data?: any) => logger.error(message, data);
export const logWarn = (message: string, data?: any) => logger.warn(message, data);
export const logInfo = (message: string, data?: any) => logger.info(message, data);
export const logDebug = (message: string, data?: any) => logger.debug(message, data);
export const logAuth = (message: string, userId?: string) => logger.auth(message, userId);
