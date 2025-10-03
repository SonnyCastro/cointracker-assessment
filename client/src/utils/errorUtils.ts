import type { ApiError } from '../types';

/**
 * Utility functions for error handling and user feedback
 */

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyErrorMessage = (error: Error | ApiError | null, operation: string = 'operation'): string => {
  if (!error || !error.message) {
    return `Failed to ${operation}. Please try again.`;
  }

  const message = error.message.toLowerCase();

  if (message.includes('already exists')) {
    return 'This wallet address already exists.';
  } else if (message.includes('simulated') || message.includes('server error')) {
    return 'Server error occurred. Please try again.';
  } else if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  } else if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  } else if (message.includes('404') || message.includes('not found')) {
    return 'Resource not found. Please refresh and try again.';
  } else if (message.includes('500') || message.includes('internal server')) {
    return 'Server error. Please try again later.';
  }

  return `Failed to ${operation}. Please try again.`;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: Error | ApiError | null): boolean => {
  if (!error || !error.message) return false;

  const message = error.message.toLowerCase();
  const retryableErrors = [
    'network',
    'fetch',
    'timeout',
    '500',
    'internal server',
    'connection'
  ];

  return retryableErrors.some(errorType => message.includes(errorType));
};

/**
 * Get retry delay based on attempt count
 */
export const getRetryDelay = (attemptCount: number, maxDelay: number = 5000): number => {
  return Math.min(1000 * Math.pow(2, attemptCount), maxDelay);
};
