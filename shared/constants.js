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

export const DEFAULT_CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  CLIENT_PORT: 5173,
  SERVER_PORT: 3000
};
