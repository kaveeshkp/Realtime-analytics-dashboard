/**
 * Error logging service for tracking and reporting errors
 */

export interface ErrorLog {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp: number;
  userAgent: string;
  url: string;
}

const ERROR_LOGS: ErrorLog[] = [];
const MAX_LOGS = 50; // Keep last 50 errors in memory

/**
 * Log an error to the error tracking system
 */
export function logError(
  message: string,
  options: {
    error?: Error | unknown;
    context?: Record<string, unknown>;
    type?: 'error' | 'warning' | 'info';
  } = {}
): ErrorLog {
  const { error, context = {}, type = 'error' } = options;

  const errorLog: ErrorLog = {
    id: `${Date.now()}-${Math.random()}`,
    type,
    message,
    stack: error instanceof Error ? error.stack : undefined,
    context: {
      ...context,
      ...(error instanceof Error && { errorMessage: error.message }),
    },
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    url: typeof window !== 'undefined' ? window.location.href : '',
  };

  // Store in memory
  ERROR_LOGS.push(errorLog);
  if (ERROR_LOGS.length > MAX_LOGS) {
    ERROR_LOGS.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const consoleMethod = type === 'error' ? console.error : type === 'warning' ? console.warn : console.log;
    consoleMethod(`[${type.toUpperCase()}] ${message}`, errorLog);
  }

  // Could send to external error tracking service here (e.g., Sentry)
  // sendToErrorTrackingService(errorLog);

  return errorLog;
}

/**
 * Get all logged errors
 */
export function getErrorLogs(): ErrorLog[] {
  return [...ERROR_LOGS];
}

/**
 * Clear all logged errors
 */
export function clearErrorLogs(): void {
  ERROR_LOGS.length = 0;
}

/**
 * Send errors to a backend endpoint for monitoring
 */
export async function sendErrorsToBackend(logs: ErrorLog[] = ERROR_LOGS): Promise<void> {
  if (logs.length === 0) return;

  try {
    await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors: logs }),
    });
  } catch (error) {
    console.error('Failed to send error logs to backend:', error);
  }
}

/**
 * Wrapper for API error logging with retry information
 */
export function logApiError(
  message: string,
  endpoint: string,
  error: unknown,
  context?: Record<string, unknown>
): ErrorLog {
  return logError(message, {
    error,
    context: {
      endpoint,
      type: 'api_error',
      ...context,
    },
    type: 'error',
  });
}

/**
 * Wrapper for network error logging
 */
export function logNetworkError(message: string, error: unknown): ErrorLog {
  return logError(message, {
    error,
    context: { type: 'network_error' },
    type: 'error',
  });
}
