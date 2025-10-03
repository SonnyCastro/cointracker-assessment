import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react"
import { useWallets } from "../hooks/useWallets"
import { useWalletTransactions } from "../hooks/useWalletTransactions"
import type { AppState, AppActions, AppContextValue, WalletId } from "../types"

// Initial state
const initialState: AppState = {
  selectedWallet: null,
  isEditMode: false,
  // UI state
  showAddForm: false,
  isSyncing: false,
  syncingWallets: new Set(),
  newlyAddedWallets: new Set(),
  pendingWalletSelection: null,
}

// Action types
const ACTIONS = {
  SET_SELECTED_WALLET: "SET_SELECTED_WALLET",
  TOGGLE_EDIT_MODE: "TOGGLE_EDIT_MODE",
  SET_EDIT_MODE: "SET_EDIT_MODE",
  SET_SHOW_ADD_FORM: "SET_SHOW_ADD_FORM",
  SET_IS_SYNCING: "SET_IS_SYNCING",
  ADD_SYNCING_WALLET: "ADD_SYNCING_WALLET",
  REMOVE_SYNCING_WALLET: "REMOVE_SYNCING_WALLET",
  ADD_NEWLY_ADDED_WALLET: "ADD_NEWLY_ADDED_WALLET",
  REMOVE_NEWLY_ADDED_WALLET: "REMOVE_NEWLY_ADDED_WALLET",
  SET_PENDING_WALLET_SELECTION: "SET_PENDING_WALLET_SELECTION",
  CLEAR_PENDING_WALLET_SELECTION: "CLEAR_PENDING_WALLET_SELECTION",
} as const

type ActionType = (typeof ACTIONS)[keyof typeof ACTIONS]

interface Action {
  type: ActionType
  payload?: any
}

// Reducer function
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case ACTIONS.SET_SELECTED_WALLET:
      return {
        ...state,
        selectedWallet: action.payload,
      }

    case ACTIONS.TOGGLE_EDIT_MODE:
      return {
        ...state,
        isEditMode: !state.isEditMode,
      }

    case ACTIONS.SET_EDIT_MODE:
      return {
        ...state,
        isEditMode: action.payload,
      }

    case ACTIONS.SET_SHOW_ADD_FORM:
      return {
        ...state,
        showAddForm: action.payload,
      }

    case ACTIONS.SET_IS_SYNCING:
      return {
        ...state,
        isSyncing: action.payload,
      }

    case ACTIONS.ADD_SYNCING_WALLET:
      return {
        ...state,
        syncingWallets: new Set([...state.syncingWallets, action.payload]),
      }

    case ACTIONS.REMOVE_SYNCING_WALLET:
      return {
        ...state,
        syncingWallets: new Set(
          [...state.syncingWallets].filter((id) => id !== action.payload)
        ),
      }

    case ACTIONS.ADD_NEWLY_ADDED_WALLET:
      return {
        ...state,
        newlyAddedWallets: new Set([
          ...state.newlyAddedWallets,
          action.payload,
        ]),
      }

    case ACTIONS.REMOVE_NEWLY_ADDED_WALLET:
      return {
        ...state,
        newlyAddedWallets: new Set(
          [...state.newlyAddedWallets].filter((id) => id !== action.payload)
        ),
      }

    case ACTIONS.SET_PENDING_WALLET_SELECTION:
      return {
        ...state,
        pendingWalletSelection: action.payload,
      }

    case ACTIONS.CLEAR_PENDING_WALLET_SELECTION:
      return {
        ...state,
        pendingWalletSelection: null,
      }

    default:
      return state
  }
}

// Create context
const AppContext = createContext<AppContextValue | undefined>(undefined)

// Provider component
interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Move data fetching to context level
  const {
    wallets,
    loading: walletsLoading,
    error: walletsError,
    retryCount: walletsRetryCount,
    isRetrying: walletsIsRetrying,
    refetch: refetchWallets,
    createWallet,
    deleteWallet,
    syncWallet,
  } = useWallets()

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    retryCount: transactionsRetryCount,
    isRetrying: transactionsIsRetrying,
    refetch: refetchTransactions,
  } = useWalletTransactions(state.selectedWallet)

  // Handle pending wallet selection
  useEffect(() => {
    if (state.pendingWalletSelection && wallets && wallets.length > 0) {
      const walletExists = wallets.some(
        (w) => w.id === state.pendingWalletSelection
      )
      if (walletExists) {
        dispatch({
          type: ACTIONS.SET_SELECTED_WALLET,
          payload: state.pendingWalletSelection,
        })
        dispatch({ type: ACTIONS.CLEAR_PENDING_WALLET_SELECTION })
      }
    }
  }, [wallets, state.pendingWalletSelection])

  // Auto-select first wallet when wallets load (only if no pending selection)
  useEffect(() => {
    if (
      !walletsLoading &&
      wallets &&
      wallets.length > 0 &&
      !state.selectedWallet &&
      !state.pendingWalletSelection
    ) {
      dispatch({ type: ACTIONS.SET_SELECTED_WALLET, payload: wallets[0].id })
    }
  }, [
    wallets,
    walletsLoading,
    state.selectedWallet,
    state.pendingWalletSelection,
  ])

  // Reset selected wallet if it's no longer in the wallets list
  useEffect(() => {
    if (state.selectedWallet && wallets && wallets.length > 0) {
      const walletExists = wallets.some((w) => w.id === state.selectedWallet)
      if (!walletExists) {
        dispatch({ type: ACTIONS.SET_SELECTED_WALLET, payload: wallets[0].id })
      }
    }
  }, [wallets, state.selectedWallet])

  // Memoized action creators
  const actions: AppActions = {
    setSelectedWallet: useCallback((walletId: WalletId) => {
      dispatch({ type: ACTIONS.SET_SELECTED_WALLET, payload: walletId })
    }, []),

    toggleEditMode: useCallback(() => {
      dispatch({ type: ACTIONS.TOGGLE_EDIT_MODE })
    }, []),

    setEditMode: useCallback((isEditMode: boolean) => {
      dispatch({ type: ACTIONS.SET_EDIT_MODE, payload: isEditMode })
    }, []),

    setShowAddForm: useCallback((show: boolean) => {
      dispatch({ type: ACTIONS.SET_SHOW_ADD_FORM, payload: show })
    }, []),

    setIsSyncing: useCallback((isSyncing: boolean) => {
      dispatch({ type: ACTIONS.SET_IS_SYNCING, payload: isSyncing })
    }, []),

    addSyncingWallet: useCallback((walletId: WalletId) => {
      dispatch({ type: ACTIONS.ADD_SYNCING_WALLET, payload: walletId })
    }, []),

    removeSyncingWallet: useCallback((walletId: WalletId) => {
      dispatch({ type: ACTIONS.REMOVE_SYNCING_WALLET, payload: walletId })
    }, []),

    addNewlyAddedWallet: useCallback((walletId: WalletId) => {
      dispatch({ type: ACTIONS.ADD_NEWLY_ADDED_WALLET, payload: walletId })
    }, []),

    removeNewlyAddedWallet: useCallback((walletId: WalletId) => {
      dispatch({ type: ACTIONS.REMOVE_NEWLY_ADDED_WALLET, payload: walletId })
    }, []),

    setPendingWalletSelection: useCallback((walletId: WalletId) => {
      dispatch({
        type: ACTIONS.SET_PENDING_WALLET_SELECTION,
        payload: walletId,
      })
    }, []),

    clearPendingWalletSelection: useCallback(() => {
      dispatch({ type: ACTIONS.CLEAR_PENDING_WALLET_SELECTION })
    }, []),
  }

  const value: AppContextValue = {
    ...state,
    ...actions,
    // Wallet data
    wallets,
    walletsLoading,
    walletsError,
    walletsRetryCount,
    walletsIsRetrying,
    refetchWallets,
    createWallet,
    deleteWallet,
    syncWallet,
    // Transaction data
    transactions,
    transactionsLoading,
    transactionsError,
    transactionsRetryCount,
    transactionsIsRetrying,
    refetchTransactions,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Custom hook to use the context
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

export default AppContext
