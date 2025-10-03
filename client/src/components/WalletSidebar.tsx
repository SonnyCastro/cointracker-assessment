import {
  useState,
  useMemo,
  memo,
  useCallback,
  FormEvent,
  MouseEvent,
} from "react"
import { PlusIcon, ArrowsClockwiseIcon, TrashIcon } from "@phosphor-icons/react"
import {
  formatWalletAddress,
  getWalletProvider,
  getWalletIcon,
  getWalletProviderAlt,
  isValidBitcoinAddress,
} from "../utils/walletUtils"
import { useAppContext } from "../contexts/AppContext"
import addWalletIcon from "../assets/addWallet.png"
import type { WalletId } from "../types"
import "./WalletSidebar.css"

interface TransformedWallet {
  id: string
  name: string
  address: string
  fullAddress: string
  iconURL: string
  alt: string
  isActive: boolean
}

const WalletSidebar = (): React.JSX.Element => {
  const {
    selectedWallet,
    setSelectedWallet,
    isEditMode,
    setEditMode,
    wallets,
    walletsLoading,
    walletsError,
    walletsRetryCount,
    walletsIsRetrying,
    refetchWallets,
    createWallet,
    deleteWallet,
    syncWallet,
    refetchTransactions,
    newlyAddedWallets,
    addNewlyAddedWallet,
    setPendingWalletSelection,
  } = useAppContext()

  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [newWalletAddress, setNewWalletAddress] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [syncingWallets, setSyncingWallets] = useState<Set<string>>(new Set())

  const handleSubmitWallet = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()

      if (
        !newWalletAddress.trim() ||
        !isValidBitcoinAddress(newWalletAddress.trim())
      ) {
        setFormError("Please enter a valid Bitcoin address")
        return
      }

      setIsSubmitting(true)
      setFormError(null)

      try {
        const newWalletId = await createWallet(newWalletAddress.trim())
        setNewWalletAddress("")
        setShowAddForm(false)
        setFormError(null)

        if (newWalletId) {
          // Track this as a newly added wallet
          addNewlyAddedWallet(newWalletId)
          setPendingWalletSelection(newWalletId)
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        if (errorMessage.includes("already exists")) {
          setFormError("This wallet address already exists")
        } else if (errorMessage.includes("Invalid")) {
          setFormError("Please enter a valid Bitcoin address")
        } else {
          setFormError("Failed to add wallet. Please try again.")
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [
      newWalletAddress,
      createWallet,
      addNewlyAddedWallet,
      setPendingWalletSelection,
    ]
  )

  const handleCancel = useCallback((): void => {
    setNewWalletAddress("")
    setShowAddForm(false)
    setFormError(null)
  }, [])

  const handleDeleteWallet = useCallback(
    async (walletId: WalletId): Promise<void> => {
      if (
        window.confirm(
          "Are you sure you want to delete this wallet? This action cannot be undone."
        )
      ) {
        try {
          await deleteWallet(walletId)

          setEditMode(false)

          if (selectedWallet === walletId) {
            const remainingWallets = wallets.filter((w) => w.id !== walletId)
            if (remainingWallets.length > 0) {
              setSelectedWallet(remainingWallets[0].id)
            }
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred"
          alert(`Failed to delete wallet: ${errorMessage}`)
        }
      }
    },
    [deleteWallet, setEditMode, selectedWallet, wallets, setSelectedWallet]
  )

  const handleAddWalletClick = useCallback((): void => {
    setShowAddForm(true)
    setFormError(null)
  }, [])

  const handleSyncWallet = useCallback(
    async (walletId: WalletId): Promise<void> => {
      try {
        setSyncingWallets((prev) => new Set(prev).add(walletId))

        // Add minimum loading duration for better UX
        const minLoadingTime = 1000 // 1 second minimum
        const startTime = Date.now()

        // Sync wallet - this now returns updated wallet data and handles the refetch internally
        await syncWallet(walletId)

        // Only refetch transactions if this is the currently selected wallet
        // No need to refetch wallets as syncWallet already updates them
        if (refetchTransactions && selectedWallet === walletId) {
          await refetchTransactions()
        }

        // Ensure minimum loading time for smooth animation
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime)

        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime))
        }
      } catch {
        // Error handling is done in the useWallets hook
      } finally {
        setSyncingWallets((prev) => {
          const newSet = new Set(prev)
          newSet.delete(walletId)
          return newSet
        })
      }
    },
    [syncWallet, refetchTransactions, selectedWallet]
  )

  // Memoize wallet transformation - only recalculate when wallets or selection changes
  // Use stable references for wallet data to prevent unnecessary re-renders
  const transformedWallets = useMemo((): TransformedWallet[] => {
    return wallets.map((wallet) => {
      const provider = getWalletProvider(wallet.name, wallet.address)
      const iconURL = getWalletIcon(wallet.iconURL, provider)

      return {
        id: wallet.id,
        name: provider,
        address: formatWalletAddress(wallet.address),
        fullAddress: wallet.address,
        iconURL,
        alt: getWalletProviderAlt(provider),
        isActive: selectedWallet === wallet.id,
      }
    })
  }, [wallets, selectedWallet])

  if (walletsLoading) {
    return (
      <div className='wallet-sidebar-card'>
        <div className='loading-state'>
          <div className='loading-spinner'></div>
          <p>Loading wallets...</p>
        </div>
      </div>
    )
  }

  if (walletsError) {
    const retryDelay = Math.min(1000 * Math.pow(2, walletsRetryCount), 5000)
    const retryInSeconds = Math.ceil(retryDelay / 1000)

    return (
      <div className='wallet-sidebar-card error-state'>
        <div className='error-content'>
          <div className='error-icon'>⚠️</div>
          <h3>Error loading wallets</h3>
          <p>{walletsError}</p>
          {walletsIsRetrying && (
            <div className='retry-info'>
              Retrying in {retryInSeconds} seconds... (Attempt{" "}
              {walletsRetryCount + 1}/5)
            </div>
          )}
          {walletsRetryCount >= 5 && (
            <div className='retry-info'>
              Max retry attempts reached. Please check your connection.
            </div>
          )}
          {!walletsIsRetrying && walletsRetryCount < 5 && (
            <button onClick={refetchWallets} className='retry-button'>
              Try Again Now
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='wallet-sidebar-card'>
      <div className='wallet-list'>
        {transformedWallets.map((wallet) => {
          // Show sync icon for user-added wallets (tracked in newlyAddedWallets Set)
          // OR for wallets without iconURL (newly created before any sync)
          const originalWallet = wallets.find((w) => w.id === wallet.id)
          const isNewlyAdded = newlyAddedWallets.has(wallet.id)
          const hasEmptyIcon =
            originalWallet &&
            (!originalWallet.iconURL || originalWallet.iconURL === "")
          const showSyncIcon = isNewlyAdded || hasEmptyIcon

          return (
            <div
              key={wallet.id}
              className={`wallet-item ${wallet.isActive ? "active" : ""}`}
              onClick={() => setSelectedWallet(wallet.id)}
            >
              <div className='wallet-icon'>
                <img src={wallet.iconURL} alt={wallet.alt} />
              </div>
              <div className='wallet-info'>
                <div className='wallet-name'>{wallet.name}</div>
                <div className='wallet-address'>{wallet.address}</div>
              </div>
              <div className='wallet-actions'>
                {showSyncIcon && (
                  <div
                    className={`wallet-sync-icon ${
                      syncingWallets.has(wallet.id) ? "syncing" : ""
                    }`}
                    onClick={(e: MouseEvent<HTMLDivElement>) => {
                      e.stopPropagation()
                      if (!syncingWallets.has(wallet.id)) {
                        handleSyncWallet(wallet.id)
                      }
                    }}
                    title={
                      syncingWallets.has(wallet.id)
                        ? "Syncing..."
                        : "Sync wallet"
                    }
                  >
                    <ArrowsClockwiseIcon size={16} />
                  </div>
                )}
                {isEditMode && wallet.isActive && (
                  <div
                    className='wallet-delete-icon'
                    onClick={(e: MouseEvent<HTMLDivElement>) => {
                      e.stopPropagation()
                      handleDeleteWallet(wallet.id)
                    }}
                    title='Delete wallet'
                  >
                    <TrashIcon size={16} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showAddForm ? (
        <div className='add-wallet-form'>
          <form onSubmit={handleSubmitWallet}>
            <div className='wallet-input-container'>
              <div className='wallet-input-icon'>
                <img src={addWalletIcon} alt='Add wallet' />
              </div>
              <div className='wallet-address-wrapper'>
                {newWalletAddress && (
                  <span className='address-ellipses'>...</span>
                )}
                <input
                  type='text'
                  value={newWalletAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewWalletAddress(e.target.value)
                  }
                  placeholder='Paste an address here...'
                  className='wallet-address-input'
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {formError && (
              <div className='form-error'>
                <div className='form-error-icon'>⚠️</div>
                <div className='form-error-message'>{formError}</div>
              </div>
            )}

            <div className='form-actions'>
              <button
                type='button'
                className='cancel-button'
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='save-wallet-button'
                disabled={isSubmitting || !newWalletAddress.trim()}
              >
                {isSubmitting ? "Saving..." : "Save new wallet"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button className='add-wallet-button' onClick={handleAddWalletClick}>
          <PlusIcon size={16} />
          {wallets.length === 0 ? "Add wallet" : "Add another wallet"}
        </button>
      )}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
const WalletSidebarMemo = memo(WalletSidebar)

export default WalletSidebarMemo
