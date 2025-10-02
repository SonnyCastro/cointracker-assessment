/**
 * Utility functions for transaction-related operations
 */

/**
 * Calculate wallet balance from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Balance data with normalization info
 */
export const calculateBalance = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return { balance: 0, isNormalized: false }
  }

  // Calculate net position (sum of all transaction amounts)
  const netPosition = transactions.reduce((total, tx) => total + tx.balance, 0)

  // If net position is negative, normalize it to show a positive balance
  const isNegative = netPosition < 0
  const normalizedBalance = Math.abs(netPosition)

  // Show minimum balance of 0.01 BTC for display purposes
  const displayBalance = Math.max(normalizedBalance, 0.01)

  return {
    balance: displayBalance,
    isNormalized: isNegative,
    originalBalance: netPosition
  }
}

/**
 * Format transaction amount for display
 * @param {number} balance - Transaction balance amount
 * @returns {string} Formatted amount string
 */
export const formatTransactionAmount = (balance) => {
  const amount = Math.abs(balance)
  const sign = balance >= 0 ? '+' : '-'
  return `${sign}${amount.toFixed(2)} BTC`
}

/**
 * Format date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toISOString().split('T')[0]
}

/**
 * Get transaction status based on balance
 * @param {number} balance - Transaction balance
 * @returns {string} Status ('received' or 'sent')
 */
export const getTransactionStatus = (balance) => {
  return balance >= 0 ? 'received' : 'sent'
}

/**
 * Get transaction amount class for styling
 * @param {number} balance - Transaction balance
 * @returns {string} CSS class name
 */
export const getTransactionAmountClass = (balance) => {
  return balance >= 0 ? 'positive' : 'negative'
}
