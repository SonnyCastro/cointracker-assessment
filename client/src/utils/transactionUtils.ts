import type { Transaction } from '../types';

/**
 * Utility functions for transaction-related operations
 */

interface BalanceData {
  balance: number;
  isNormalized: boolean;
  originalBalance?: number;
}

/**
 * Calculate wallet balance from transactions
 */
export const calculateBalance = (transactions: Transaction[]): BalanceData => {
  if (!transactions || transactions.length === 0) {
    return { balance: 0, isNormalized: false };
  }

  // Calculate net position (sum of all transaction amounts)
  const netPosition = transactions.reduce((total, tx) => total + tx.balance, 0);

  // If net position is negative, normalize it to show a positive balance
  const isNegative = netPosition < 0;
  const normalizedBalance = Math.abs(netPosition);

  // Show minimum balance of 0.01 BTC for display purposes
  const displayBalance = Math.max(normalizedBalance, 0.01);

  return {
    balance: displayBalance,
    isNormalized: isNegative,
    originalBalance: netPosition
  };
};

/**
 * Format transaction amount for display
 */
export const formatTransactionAmount = (balance: number): string => {
  const amount = Math.abs(balance);
  const sign = balance >= 0 ? '+' : '-';
  return `${sign}${amount.toFixed(2)} BTC`;
};

/**
 * Format date string for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toISOString().split('T')[0];
};

/**
 * Get transaction status based on balance
 */
export const getTransactionStatus = (balance: number): 'received' | 'sent' => {
  return balance >= 0 ? 'received' : 'sent';
};

/**
 * Get transaction amount class for styling
 */
export const getTransactionAmountClass = (balance: number): 'positive' | 'negative' => {
  return balance >= 0 ? 'positive' : 'negative';
};
