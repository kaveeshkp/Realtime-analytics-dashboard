import { logApiError, logNetworkError } from '../errorLogger';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const API_TIMEOUT = 30000; // 30 seconds

interface ApiErrorResponse {
  error?: string;
  message?: string;
  code?: string;
}

/**
 * Enhanced API fetch with error handling, timeout, and logging
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const fullUrl = `${API_BASE}${path}`;

    const res = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as ApiErrorResponse;
      const errorMessage = body.error || body.message || `HTTP ${res.status}`;

      // Log the API error
      logApiError(`API request failed: ${path}`, path, new Error(errorMessage), {
        status: res.status,
        response: body,
      });

      // Create a user-friendly error message
      const userFriendlyMessage =
        res.status === 429
          ? 'Too many requests. Please wait a moment and try again.'
          : res.status === 503
            ? 'Service is temporarily unavailable. Please try again later.'
            : res.status >= 500
              ? 'Server error. Please try again later.'
              : res.status >= 400
                ? `Failed to load data: ${errorMessage}`
                : 'An error occurred';

      const error = new Error(userFriendlyMessage);
      (error as any).status = res.status;
      (error as any).originalMessage = errorMessage;
      throw error;
    }

    return (await res.json()) as Promise<T>;
  } catch (error) {
    if (error instanceof Error) {
      // Already logged by the error handler above
      if ((error as any).status) {
        throw error;
      }

      // Network error or timeout
      if (error.name === 'AbortError') {
        logNetworkError(`Request timeout (${API_TIMEOUT}ms): ${path}`, error);
        throw new Error('Request timeout. Please try again later.');
      }

      logNetworkError(`Network error: ${path}`, error);
      throw error;
    }

    // Unknown error type
    logNetworkError(`Unknown error: ${path}`, error);
    throw new Error('An unknown error occurred');
  } finally {
    clearTimeout(timeoutId);
  }
}

