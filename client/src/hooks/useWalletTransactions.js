import { useState, useEffect, useCallback } from 'react'
import { walletService } from '../services/walletService'

/**
 * Custom hook for managing wallet transaction data
 * Provides transactions list, loading states, error handling, and refetch functionality
 */
export const useWalletTransactions = (walletId) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  /**
   * Fetch transactions for a specific wallet
   */
  const fetchTransactions = useCallback(async () => {
    if (!walletId) {
      setTransactions([])
      setError(null)
      setRetryCount(0)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const transactionsData = await walletService.getWalletTransactions(walletId)
      // Handle case where wallet has no transactions (empty array or null)
      setTransactions(transactionsData || [])
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      // If it's a 404 or "no transactions" error, treat as empty transactions
      if (err.message.includes('404') || err.message.includes('not found') || err.message.includes('no transactions')) {
        setTransactions([])
        setError(null)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [walletId])

  /**
   * Automatic retry with exponential backoff
   */
  const retryWithBackoff = useCallback(async () => {
    if (retryCount >= 5) return // Max 5 retries

    setIsRetrying(true)
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000) // Max 5 seconds

    setTimeout(async () => {
      setRetryCount(prev => prev + 1)
      await fetchTransactions()
      setIsRetrying(false)
    }, delay)
  }, [retryCount, fetchTransactions])

  // Fetch transactions when walletId changes
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Auto-retry on error (but not for "no transactions" scenarios)
  useEffect(() => {
    if (error && retryCount < 5 && !error.includes('404') && !error.includes('not found') && !error.includes('no transactions')) {
      retryWithBackoff()
    }
  }, [error, retryCount, retryWithBackoff])

  return {
    transactions,
    loading,
    error,
    retryCount,
    isRetrying,
    refetch: fetchTransactions
  }
}