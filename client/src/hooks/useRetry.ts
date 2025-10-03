import { useState, useCallback, useRef } from 'react';
import type { UseRetryReturn } from '../types';

/**
 * Custom hook for handling retry logic with exponential backoff
 * Eliminates code duplication between useWallets and useWalletTransactions
 */
export const useRetry = (maxRetries: number = 5, maxDelay: number = 5000): UseRetryReturn => {
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDelay = useCallback((attemptCount: number): number => {
    return Math.min(1000 * Math.pow(2, attemptCount), maxDelay);
  }, [maxDelay]);

  const retryWithBackoff = useCallback(async <T>(retryFunction: () => Promise<T>): Promise<boolean> => {
    if (retryCount >= maxRetries) {
      return false;
    }

    setIsRetrying(true);
    const delay = calculateDelay(retryCount);

    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          setRetryCount(prev => prev + 1);
          await retryFunction();
          resolve(true);
        } catch {
          resolve(false);
        } finally {
          setIsRetrying(false);
        }
      }, delay);
    });
  }, [retryCount, maxRetries, calculateDelay]);

  const resetRetryCount = useCallback((): void => {
    setRetryCount(0);
  }, []);

  const clearRetryTimeout = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup timeout on unmount
  const cleanup = useCallback((): void => {
    clearRetryTimeout();
  }, [clearRetryTimeout]);

  return {
    retryCount,
    isRetrying,
    retryWithBackoff,
    resetRetryCount,
    clearRetryTimeout,
    cleanup
  };
};
