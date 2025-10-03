import { useState, useEffect, useCallback } from 'react';
import { walletService } from '../services/walletService';
import { useRetry } from './useRetry';
import type { UseWalletTransactionsReturn, Transaction, WalletId } from '../types';

/**
 * Custom hook for managing wallet transaction data
 * Provides transactions list, loading states, error handling, and refetch functionality
 */
export const useWalletTransactions = (walletId: WalletId | null): UseWalletTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { retryCount, isRetrying, retryWithBackoff, resetRetryCount, cleanup } = useRetry();

  /**
   * Fetch transactions for a specific wallet
   */
  const fetchTransactions = useCallback(async (): Promise<void> => {
    if (!walletId) {
      setTransactions([]);
      setError(null);
      resetRetryCount();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const transactionsData = await walletService.getWalletTransactions(walletId);

      // Handle case where wallet has no transactions (empty array or null)
      const newTransactions = transactionsData || [];

      // Use functional update to ensure React detects the change
      setTransactions(() => {
        return newTransactions;
      });

      resetRetryCount(); // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      // If it's a 404 or "no transactions" error, treat as empty transactions
      if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('no transactions')) {
        setTransactions([]);
        setError(null);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [walletId, resetRetryCount]);

  /**
   * Automatic retry with exponential backoff
   */
  const handleRetry = useCallback(async (): Promise<void> => {
    await retryWithBackoff(fetchTransactions);
  }, [retryWithBackoff, fetchTransactions]);

  // Fetch transactions when walletId changes
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Auto-retry on error (but not for "no transactions" scenarios)
  useEffect(() => {
    if (error && retryCount < 5 && !error.includes('404') && !error.includes('not found') && !error.includes('no transactions')) {
      handleRetry();
    }
  }, [error, retryCount, handleRetry]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    transactions,
    loading,
    error,
    retryCount,
    isRetrying,
    refetch: fetchTransactions
  };
};