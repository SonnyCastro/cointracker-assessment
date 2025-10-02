import { useState, useEffect, useCallback } from 'react'
import { walletService } from '../services/walletService'

/**
 * Custom hook for managing wallet data
 * Provides wallets list, loading states, error handling, and CRUD operations
 */
export const useWallets = () => {
  const [wallets, setWallets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  /**
   * Fetch all wallets from the server
   */
  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const walletsData = await walletService.getAllWallets()
      setWallets(walletsData)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Automatic retry with exponential backoff
   */
  const retryWithBackoff = useCallback(async () => {
    if (retryCount >= 5) return // Max 5 retries

    setIsRetrying(true)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000) // Max 5 seconds

    setTimeout(async () => {
      setRetryCount(prev => prev + 1)
      await fetchWallets()
      setIsRetrying(false)
    }, delay)
  }, [retryCount, fetchWallets])

  /**
   * Create a new wallet
   */
  const createWallet = useCallback(async (address) => {
    try {
      setError(null)
      const updatedWallets = await walletService.createWallet(address)
      setWallets(updatedWallets)
      // Return the ID of the newly created wallet (last in the array)
      const newWallet = updatedWallets[updatedWallets.length - 1]
      return newWallet ? newWallet.id : null
    } catch (err) {
      // Don't set the global error state for form submission errors
      // Let the component handle form-specific errors
      throw err // Re-throw so component can handle it
    }
  }, [])

  /**
   * Delete a wallet
   */
  const deleteWallet = useCallback(async (walletId) => {
    try {
      setError(null)
      await walletService.deleteWallet(walletId)
      setWallets(prevWallets => prevWallets.filter(wallet => wallet.id !== walletId))
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [])

  /**
   * Sync wallet transactions
   */
  const syncWallet = useCallback(async (walletId) => {
    try {
      setError(null)
      const newTransactions = await walletService.syncWallet(walletId)
      return newTransactions
    } catch (err) {
      setError(err.message)
      return []
    }
  }, [])

  // Fetch wallets on mount
  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  // Auto-retry on error
  useEffect(() => {
    if (error && retryCount < 5) {
      retryWithBackoff()
    }
  }, [error, retryCount, retryWithBackoff])

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
  }
}
