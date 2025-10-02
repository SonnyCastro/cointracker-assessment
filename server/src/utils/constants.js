const { DEFAULT_CONFIG, WALLET_PROVIDERS } = require('../../../shared/constants.cjs');

module.exports = {
  PORT: process.env.PORT || DEFAULT_CONFIG.SERVER_PORT,

  // Database configuration
  WALLETS_FILE: 'data/wallets.json',
  TRANSACTIONS_FILE: 'data/transactions.json',

  // Sample data configuration
  SAMPLE_WALLETS: [
    {
      address: '3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd',
      name: WALLET_PROVIDERS.COINBASE,
      iconURL: 'https://coin-tracker-public.s3.us-west-1.amazonaws.com/crypto-icons/icons/coinbase-wallet.svg'
    },
    {
      address: 'bc1q0sg9rdst255gtldsmcf8rk0764avqy2h2ksqs5',
      name: WALLET_PROVIDERS.KRAKEN,
      iconURL: 'https://coin-tracker-public.s3.us-west-1.amazonaws.com/crypto-icons/icons/kraken.svg'
    },
    {
      address: 'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h',
      name: WALLET_PROVIDERS.PHANTOM,
      iconURL: 'https://coin-tracker-public.s3.us-west-1.amazonaws.com/crypto-icons/icons/phantom_new.svg'
    }
  ],

  // Transaction generation settings
  TRANSACTION_BATCH_SIZE: 1000,
  WALLET_1_TRANSACTIONS: 10,
  WALLET_2_TRANSACTIONS: 20,
  WALLET_3_TRANSACTIONS: 156000,

  // Balance ranges for each wallet
  BALANCE_RANGES: {
    WALLET_1: { min: -1000, max: 1000 },
    WALLET_2: { min: -2000, max: 2000 },
    WALLET_3: { min: -5000, max: 5000 }
  },

  // Date range for transactions
  DATE_RANGE: {
    from: '2023-01-01',
    to: '2024-12-31'
  },

  // Error simulation settings
  ENABLE_ERROR_SIMULATION: true,
  ERROR_FAILURE_RATE: 0.1, // 10% failure rate for testing

  // Server state
  IS_SHUTTING_DOWN: false
};
