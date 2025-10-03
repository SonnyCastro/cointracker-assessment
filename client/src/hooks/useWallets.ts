import { useState, useEffect, useCallback } from 'react';
import { walletService } from '../services/walletService';
import { useRetry } from './useRetry';
import type { UseWalletsReturn, Wallet, Transaction, BitcoinAddress, WalletId } from '../types';

/**
 * Custom hook for managing wallet data
 * Provides wallets list, loading states, error handling, and CRUD operations
 */
export const useWallets = (): UseWalletsReturn => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { retryCount, isRetrying, retryWithBackoff, resetRetryCount, cleanup } = useRetry();

  /**
   * Fetch all wallets from the server
   */
  const fetchWallets = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const walletsData = await walletService.getAllWallets();
      setWallets(walletsData);
      resetRetryCount(); // Reset retry count on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [resetRetryCount]);

  /**
   * Automatic retry with exponential backoff
   */
  const handleRetry = useCallback(async (): Promise<void> => {
    await retryWithBackoff(fetchWallets);
  }, [retryWithBackoff, fetchWallets]);

  /**
   * Create a new wallet
   */
  const createWallet = useCallback(async (address: BitcoinAddress): Promise<string | null> => {
    // Don't set the global error state for form submission errors
    // Let the component handle form-specific errors
    setError(null);
    const updatedWallets = await walletService.createWallet(address);
    setWallets(updatedWallets);
    // Return the ID of the newly created wallet (last in the array)
    const newWallet = updatedWallets[updatedWallets.length - 1];
    return newWallet ? newWallet.id : null;
  }, []);

  /**
   * Delete a wallet
   */
  const deleteWallet = useCallback(async (walletId: WalletId): Promise<boolean> => {
    try {
      setError(null);
      await walletService.deleteWallet(walletId);
      setWallets(prevWallets => prevWallets.filter(wallet => wallet.id !== walletId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, []);

  /**
   * Sync wallet transactions
   * Returns the updated wallet data to avoid unnecessary refetch
   */
  const syncWallet = useCallback(async (walletId: WalletId): Promise<{ transactions: Transaction[], updatedWallets?: Wallet[] }> => {
    try {
      setError(null);
      const newTransactions = await walletService.syncWallet(walletId);

      // Fetch updated wallets to get the new iconURL and data
      const updatedWallets = await walletService.getAllWallets();

      // Update local state immediately to prevent refetch
      setWallets(updatedWallets);

      return { transactions: newTransactions, updatedWallets };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return { transactions: [] };
    }
  }, []);

  // Fetch wallets on mount
  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  // Auto-retry on error
  useEffect(() => {
    if (error && retryCount < 5) {
      handleRetry();
    }
  }, [error, retryCount, handleRetry]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    wallets,
    loading,
    error,
    retryCount,
    isRetrying,
    createWallet,
    deleteWallet,
    syncWallet,
    refetch: fetchWallets
  };
};
