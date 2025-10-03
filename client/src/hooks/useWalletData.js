import { useWallets } from './useWallets'
import { useWalletTransactions } from './useWalletTransactions'
import { useAppContext } from '../contexts/AppContext'
import { useMemo } from 'react'

/**
 * Unified hook that combines wallet and transaction data
 * Eliminates the need to manage separate hooks in components
 */
export const useWalletData = () => {
  const { selectedWallet } = useAppContext()
  const wallets = useWallets()
  const transactions = useWalletTransactions(selectedWallet)

  // Memoize combined state to prevent unnecessary re-renders
  const combinedState = useMemo(() => ({
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
  ])

  return combinedState
}
