// Wallet types
export interface Wallet {
  id: string;
  address: string;
  name?: string;
  iconURL?: string;
  balance?: number;
  label?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Transaction types
export interface Transaction {
  id: string;
  walletId: string;
  date: string;
  balance: number;
  confirmations: number;
  hash?: string;
  amount?: number;
  type?: 'sent' | 'received';
  timestamp?: string;
  fee?: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Context types
export interface AppState {
  selectedWallet: string | null;
  isEditMode: boolean;
  showAddForm: boolean;
  isSyncing: boolean;
  syncingWallets: Set<string>;
  newlyAddedWallets: Set<string>;
  pendingWalletSelection: string | null;
}

export interface AppActions {
  setSelectedWallet: (walletId: string) => void;
  toggleEditMode: () => void;
  setEditMode: (isEditMode: boolean) => void;
  setShowAddForm: (show: boolean) => void;
  setIsSyncing: (isSyncing: boolean) => void;
  addSyncingWallet: (walletId: string) => void;
  removeSyncingWallet: (walletId: string) => void;
  addNewlyAddedWallet: (walletId: string) => void;
  removeNewlyAddedWallet: (walletId: string) => void;
  setPendingWalletSelection: (walletId: string) => void;
  clearPendingWalletSelection: () => void;
}

export interface AppContextValue extends AppState, AppActions {
  // Wallet data
  wallets: Wallet[];
  walletsLoading: boolean;
  walletsError: string | null;
  walletsRetryCount: number;
  walletsIsRetrying: boolean;
  refetchWallets: () => Promise<void>;
  createWallet: (address: string) => Promise<string | null>;
  deleteWallet: (walletId: string) => Promise<boolean>;
  syncWallet: (walletId: string) => Promise<{ transactions: Transaction[], updatedWallets?: Wallet[] }>;

  // Transaction data
  transactions: Transaction[];
  transactionsLoading: boolean;
  transactionsError: string | null;
  transactionsRetryCount: number;
  transactionsIsRetrying: boolean;
  refetchTransactions: () => Promise<void>;
}

// Hook return types
export interface UseWalletsReturn {
  wallets: Wallet[];
  loading: boolean;
  error: string | null;
  retryCount: number;
  isRetrying: boolean;
  createWallet: (address: string) => Promise<string | null>;
  deleteWallet: (walletId: string) => Promise<boolean>;
  syncWallet: (walletId: string) => Promise<{ transactions: Transaction[], updatedWallets?: Wallet[] }>;
  refetch: () => Promise<void>;
}

export interface UseWalletTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  retryCount: number;
  isRetrying: boolean;
  refetch: () => Promise<void>;
}

export interface UseRetryReturn {
  retryCount: number;
  isRetrying: boolean;
  retryWithBackoff: <T>(fn: () => Promise<T>) => Promise<boolean>;
  resetRetryCount: () => void;
  clearRetryTimeout: () => void;
  cleanup: () => void;
}

// Component prop types
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

// Event handler types
export type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type InputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;

// Utility types
export type WalletId = string;
export type TransactionId = string;
export type BitcoinAddress = string;

// API endpoint types
export type HttpMethod = string;

// Error types
export interface ApiError extends Error {
  status?: number;
  code?: string;
}

// Form types
export interface CreateWalletFormData {
  address: string;
}

export interface EditWalletFormData {
  id: string;
  name?: string;
  label?: string;
}
