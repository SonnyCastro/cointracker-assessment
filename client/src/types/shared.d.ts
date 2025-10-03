declare module '../../../shared/constants' {
  export const API_ENDPOINTS: {
    HEALTH: string;
    WALLETS: string;
    WALLET_TRANSACTIONS: (walletId: string) => string;
    SYNC_WALLET: (walletId: string) => string;
    CREATE_WALLET: string;
    DELETE_WALLET: (walletId: string) => string;
  };

  export const HTTP_METHODS: {
    GET: string;
    POST: string;
    PUT: string;
    DELETE: string;
  };

  export const TRANSACTION_TYPES: {
    RECEIVED: string;
    SENT: string;
  };

  export const TRANSACTION_STATUS: {
    PENDING: string;
    CONFIRMED: string;
    FAILED: string;
  };

  export const WALLET_PROVIDERS: {
    COINBASE: string;
    KRAKEN: string;
    PHANTOM: string;
  };

  export const DEFAULT_CONFIG: {
    API_BASE_URL: string;
    CLIENT_PORT: number;
    SERVER_PORT: number;
  };
}
