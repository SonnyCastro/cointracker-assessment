import { useState, useCallback, useRef } from 'react'

/**
 * Custom hook for handling retry logic with exponential backoff
 * Eliminates code duplication between useWallets and useWalletTransactions
 */
export const useRetry = (maxRetries = 5, maxDelay = 5000) => {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const timeoutRef = useRef(null)

  const calculateDelay = useCallback((attemptCount) => {
    return Math.min(1000 * Math.pow(2, attemptCount), maxDelay)
  }, [maxDelay])

  const retryWithBackoff = useCallback(async (retryFunction) => {
    if (retryCount >= maxRetries) {
      return false
    }

    setIsRetrying(true)
    const delay = calculateDelay(retryCount)

    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          setRetryCount(prev => prev + 1)
          await retryFunction()
          resolve(true)
        } catch (error) {
          resolve(false)
        } finally {
          setIsRetrying(false)
        }
      }, delay)
    })
  }, [retryCount, maxRetries, calculateDelay])

  const resetRetryCount = useCallback(() => {
    setRetryCount(0)
  }, [])

  const clearRetryTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    clearRetryTimeout()
  }, [clearRetryTimeout])

  return {
    retryCount,
    isRetrying,
    retryWithBackoff,
    resetRetryCount,
    clearRetryTimeout,
    cleanup
  }
}
