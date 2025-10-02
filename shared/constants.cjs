// Shared constants between client and server (CommonJS version for server)
const API_ENDPOINTS = {
  HEALTH: '/health',
  WALLETS: '/wallets',
  WALLET_TRANSACTIONS: (walletId) => `/wallets/${walletId}`,
  SYNC_WALLET: (walletId) => `/wallets/${walletId}/sync`,
  CREATE_WALLET: '/wallets',
  DELETE_WALLET: (walletId) => `/wallets/${walletId}`
};

const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

const TRANSACTION_TYPES = {
  RECEIVED: 'received',
  SENT: 'sent'
};

const TRANSACTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed'
};

const WALLET_PROVIDERS = {
  COINBASE: 'Coinbase',
  KRAKEN: 'Kraken',
  PHANTOM: 'Phantom'
};

const DEFAULT_CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  CLIENT_PORT: 5173,
  SERVER_PORT: 3000
};

module.exports = {
  API_ENDPOINTS,
  HTTP_METHODS,
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  WALLET_PROVIDERS,
  DEFAULT_CONFIG
};
