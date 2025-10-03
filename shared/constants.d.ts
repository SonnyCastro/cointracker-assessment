export declare const API_ENDPOINTS: {
  HEALTH: string;
  WALLETS: string;
  WALLET_TRANSACTIONS: (walletId: string) => string;
  SYNC_WALLET: (walletId: string) => string;
  CREATE_WALLET: string;
  DELETE_WALLET: (walletId: string) => string;
};

export declare const HTTP_METHODS: {
  GET: string;
  POST: string;
  PUT: string;
  DELETE: string;
};

export declare const TRANSACTION_TYPES: {
  RECEIVED: string;
  SENT: string;
};

export declare const TRANSACTION_STATUS: {
  PENDING: string;
  CONFIRMED: string;
  FAILED: string;
};

export declare const WALLET_PROVIDERS: {
  COINBASE: string;
  KRAKEN: string;
  PHANTOM: string;
};

export declare const DEFAULT_CONFIG: {
  API_BASE_URL: string;
  CLIENT_PORT: number;
  SERVER_PORT: number;
};
