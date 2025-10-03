import { useWallets } from './useWallets';
import { useWalletTransactions } from './useWalletTransactions';
import { useAppContext } from '../contexts/AppContext';
import { useMemo } from 'react';
import type { Wallet, Transaction, BitcoinAddress, WalletId } from '../types';

/**
 * Unified hook that combines wallet and transaction data
 * Eliminates the need to manage separate hooks in components
 */
interface UseWalletDataReturn {
  // Wallet data
  wallets: Wallet[];
  walletsLoading: boolean;
  walletsError: string | null;
  walletsRetryCount: number;
  walletsIsRetrying: boolean;

  // Transaction data
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  transactionsRetryCount: number;
  transactionsIsRetrying: boolean;

  // Combined loading state
  isLoading: boolean;

  // Combined error state
  hasError: boolean;

  // Actions
  createWallet: (address: BitcoinAddress) => Promise<string | null>;
  deleteWallet: (walletId: WalletId) => Promise<boolean>;
  syncWallet: (walletId: WalletId) => Promise<{ transactions: Transaction[], updatedWallets?: Wallet[] }>;
  refetchWallets: () => Promise<void>;
  refetchTransactions: () => Promise<void>;
}

export const useWalletData = (): UseWalletDataReturn => {
  const { selectedWallet } = useAppContext();
  const wallets = useWallets();
  const transactions = useWalletTransactions(selectedWallet);

  // Memoize combined state to prevent unnecessary re-renders
  const combinedState = useMemo((): UseWalletDataReturn => ({
    // Wallet data
    wallets: wallets.wallets,
    walletsLoading: wallets.loading,
    walletsError: wallets.error,
    walletsRetryCount: wallets.retryCount,
    walletsIsRetrying: wallets.isRetrying,

    // Transaction data
    transactions: transactions.transactions,
    transactionsLoading: transactions.loading,
    transactionsError: transactions.error,
    transactionsRetryCount: transactions.retryCount,
    transactionsIsRetrying: transactions.isRetrying,

    // Combined loading state
    isLoading: wallets.loading || transactions.loading,

    // Combined error state
    hasError: !!(wallets.error || transactions.error),

    // Actions
    createWallet: wallets.createWallet,
    deleteWallet: wallets.deleteWallet,
    syncWallet: wallets.syncWallet,
    refetchWallets: wallets.refetch,
    refetchTransactions: transactions.refetch
  }), [
    wallets.wallets,
    wallets.loading,
    wallets.error,
    wallets.retryCount,
    wallets.isRetrying,
    wallets.createWallet,
    wallets.deleteWallet,
    wallets.syncWallet,
    wallets.refetch,
    transactions.transactions,
    transactions.loading,
    transactions.error,
    transactions.retryCount,
    transactions.isRetrying,
    transactions.refetch
  ]);

  return combinedState;
};
