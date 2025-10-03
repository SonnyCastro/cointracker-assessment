import { useState, useMemo, useEffect, useRef, memo, useCallback } from 'react'
import { PlusIcon, ArrowsClockwiseIcon, TrashIcon } from '@phosphor-icons/react'
import { formatWalletAddress, getWalletProvider, getWalletIcon, getWalletProviderAlt, isValidBitcoinAddress } from '../utils/walletUtils'
import { useAppContext } from '../contexts/AppContext'
import addWalletIcon from '../assets/addWallet.png'
import './WalletSidebar.css'

const WalletSidebar = () => {
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
    refetchTransactions
  } = useAppContext()
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newWalletAddress, setNewWalletAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [syncingWallets, setSyncingWallets] = useState(new Set())
  const [pendingWalletSelection, setPendingWalletSelection] = useState(null)

  // Watch for wallets array updates and select pending wallet
  useEffect(() => {
    if (pendingWalletSelection && wallets && wallets.length > 0) {
      const walletExists = wallets.some(w => w.id === pendingWalletSelection)
      if (walletExists) {
        setSelectedWallet(pendingWalletSelection)
        setPendingWalletSelection(null)
      }
    }
  }, [wallets, pendingWalletSelection, setSelectedWallet])

  const handleSubmitWallet = useCallback(async (e) => {
    e.preventDefault()
    
    if (!newWalletAddress.trim() || !isValidBitcoinAddress(newWalletAddress.trim())) {
      setFormError('Please enter a valid Bitcoin address')
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    
    try {
      const newWalletId = await createWallet(newWalletAddress.trim())
      setNewWalletAddress('')
      setShowAddForm(false)
      setFormError(null)
      
      if (newWalletId) {
        setPendingWalletSelection(newWalletId)
      }
    } catch (error) {
      if (error.message.includes('already exists')) {
        setFormError('This wallet address already exists')
      } else if (error.message.includes('Invalid')) {
        setFormError('Please enter a valid Bitcoin address')
      } else {
        setFormError('Failed to add wallet. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [newWalletAddress, createWallet])

  const handleCancel = useCallback(() => {
    setNewWalletAddress('')
    setShowAddForm(false)
    setFormError(null)
  }, [])

  const handleDeleteWallet = useCallback(async (walletId) => {
    if (window.confirm('Are you sure you want to delete this wallet? This action cannot be undone.')) {
      try {
        await deleteWallet(walletId)
        
        setEditMode(false)
        
        if (selectedWallet === walletId) {
          const remainingWallets = wallets.filter(w => w.id !== walletId)
          if (remainingWallets.length > 0) {
            setSelectedWallet(remainingWallets[0].id)
          }
        }
      } catch (error) {
        alert(`Failed to delete wallet: ${error.message || 'Unknown error occurred'}`)
      }
    }
  }, [deleteWallet, setEditMode, selectedWallet, wallets, setSelectedWallet])

  const handleAddWalletClick = useCallback(() => {
    setShowAddForm(true)
    setFormError(null)
  }, [])


  const handleSyncWallet = useCallback(async (walletId) => {
    try {
      setSyncingWallets(prev => new Set(prev).add(walletId))
      
      // Add minimum loading duration for better UX
      const minLoadingTime = 1000 // 1 second minimum
      const startTime = Date.now()
      
      await syncWallet(walletId)
      
      // Refetch wallets to get updated data, which will trigger re-renders
      if (refetchWallets) {
        await refetchWallets()
      }
      
      // If this is the currently selected wallet, also refetch its transactions
      if (refetchTransactions && selectedWallet === walletId) {
        await refetchTransactions()
      }
      
      // Ensure minimum loading time for smooth animation
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }
    } catch (error) {
      // Error handling is done in the useWallets hook
    } finally {
      setSyncingWallets(prev => {
        const newSet = new Set(prev)
        newSet.delete(walletId)
        return newSet
      })
    }
  }, [syncWallet, refetchWallets, refetchTransactions, selectedWallet])

  const isAddedWallet = (wallet) => {
    // Check if this is a newly added wallet (not from original server data)
    // Newly added wallets have empty iconURL from the server
    return !wallet.iconURL || wallet.iconURL === ""
  }

  // Memoize wallet transformation - only recalculate when wallets change
  const transformedWallets = useMemo(() => {
    return wallets.map(wallet => {
      const provider = getWalletProvider(wallet.name, wallet.address)
      return {
        id: wallet.id,
        name: provider,
        address: formatWalletAddress(wallet.address),
        fullAddress: wallet.address,
        iconURL: getWalletIcon(wallet.iconURL, provider),
        alt: getWalletProviderAlt(provider),
        isActive: selectedWallet === wallet.id
      }
    })
  }, [wallets, selectedWallet])

  if (walletsLoading) {
    return (
      <div className="wallet-sidebar-card">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading wallets...</p>
        </div>
      </div>
    )
  }

  if (walletsError) {
    const retryDelay = Math.min(1000 * Math.pow(2, walletsRetryCount), 5000)
    const retryInSeconds = Math.ceil(retryDelay / 1000)
    
    return (
      <div className="wallet-sidebar-card error-state">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Error loading wallets</h3>
          <p>{walletsError}</p>
          {walletsIsRetrying && (
            <div className="retry-info">
              Retrying in {retryInSeconds} seconds... (Attempt {walletsRetryCount + 1}/5)
            </div>
          )}
          {walletsRetryCount >= 5 && (
            <div className="retry-info">
              Max retry attempts reached. Please check your connection.
            </div>
          )}
          {!walletsIsRetrying && walletsRetryCount < 5 && (
            <button onClick={refetchWallets} className="retry-button">
              Try Again Now
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="wallet-sidebar-card">
      <div className="wallet-list">
        {transformedWallets.map((wallet) => {
          const originalWallet = wallets.find(w => w.id === wallet.id)
          const showSyncIcon = isAddedWallet(originalWallet)

          return (
            <div
              key={wallet.id}
              className={`wallet-item ${wallet.isActive ? 'active' : ''}`}
              onClick={() => setSelectedWallet(wallet.id)}
            >
              <div className="wallet-icon">
                <img src={wallet.iconURL} alt={wallet.alt} />
              </div>
              <div className="wallet-info">
                <div className="wallet-name">{wallet.name}</div>
                <div className="wallet-address">{wallet.address}</div>
              </div>
              <div className="wallet-actions">
                {showSyncIcon && (
                  <div 
                    className={`wallet-sync-icon ${syncingWallets.has(wallet.id) ? 'syncing' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!syncingWallets.has(wallet.id)) {
                        handleSyncWallet(wallet.id)
                      }
                    }}
                    title={syncingWallets.has(wallet.id) ? 'Syncing...' : 'Sync wallet'}
                  >
                    <ArrowsClockwiseIcon size={16} />
                  </div>
                )}
                {isEditMode && wallet.isActive && (
                  <div 
                    className="wallet-delete-icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteWallet(wallet.id)
                    }}
                    title="Delete wallet"
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
        <div className="add-wallet-form">
          <form onSubmit={handleSubmitWallet}>
            <div className="wallet-input-container">
              <div className="wallet-input-icon">
                <img src={addWalletIcon} alt="Add wallet" />
              </div>
              <div className="wallet-address-wrapper">
                {newWalletAddress && (
                  <span className="address-ellipses">...</span>
                )}
                <input
                  type="text"
                  value={newWalletAddress}
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  placeholder="Paste an address here..."
                  className="wallet-address-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {formError && (
              <div className="form-error">
                <div className="form-error-icon">⚠️</div>
                <div className="form-error-message">{formError}</div>
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-wallet-button"
                disabled={isSubmitting || !newWalletAddress.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save new wallet'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button className="add-wallet-button" onClick={handleAddWalletClick}>
          <PlusIcon size={16} />
          {wallets.length === 0 ? 'Add wallet' : 'Add another wallet'}
        </button>
      )}
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
const WalletSidebarMemo = memo(WalletSidebar)

export default WalletSidebarMemo
