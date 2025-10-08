// Shared constants between client and server
export const API_ENDPOINTS = {
  HEALTH: '/health',
  WALLETS: '/wallets',
  WALLET_TRANSACTIONS: (walletId) => `/wallets/${walletId}`,
  SYNC_WALLET: (walletId) => `/wallets/${walletId}/sync`,
  CREATE_WALLET: '/wallets',
  DELETE_WALLET: (walletId) => `/wallets/${walletId}`
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

export const TRANSACTION_TYPES = {
  RECEIVED: 'received',
  SENT: 'sent'
};

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
};

export const WALLET_PROVIDERS = {
  COINBASE: 'Coinbase',
  KRAKEN: 'Kraken',
  PHANTOM: 'Phantom'
};

// API Base URL configuration
// In production, use environment variable; in development, use localhost
const getApiBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In production (not localhost), use environment variable
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // Vite injects import.meta.env at build time
      return import.meta.env?.VITE_API_URL || 'https://cointracker-mock-api.vercel.app';
    }
  }
  // Default to localhost for development
  return 'http://localhost:3000';
};

export const DEFAULT_CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
  CLIENT_PORT: 5173,
  SERVER_PORT: 3000
};
