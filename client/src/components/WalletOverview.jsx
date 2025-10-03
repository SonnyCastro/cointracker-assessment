import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { CopyIcon, PencilSimpleIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react'
import { formatWalletAddress, getWalletProvider, getWalletIcon, getWalletProviderAlt } from '../utils/walletUtils'
import { useAppContext } from '../contexts/AppContext'
import './WalletOverview.css'

const WalletOverview = () => {
  const {
    selectedWallet,
    wallets,
    setEditMode,
    isEditMode,
    syncWallet,
    transactions,
    transactionsLoading,
    transactionsError,
    transactionsRetryCount,
    transactionsIsRetrying,
    refetchTransactions
  } = useAppContext()
  
  const [wallet, setWallet] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)



  useEffect(() => {
    if (selectedWallet && wallets && wallets.length > 0) {
      const foundWallet = wallets.find(w => w.id === selectedWallet)
      if (foundWallet) {
        const provider = getWalletProvider(foundWallet.name, foundWallet.address)
        const walletData = {
          id: foundWallet.id,
          name: provider,
          address: foundWallet.address,
          iconURL: getWalletIcon(foundWallet.iconURL, provider),
          alt: getWalletProviderAlt(provider)
        }
        setWallet(walletData)
      }
    } else {
      setWallet(null)
    }
  }, [selectedWallet, wallets])

  // Memoize balance calculation to prevent unnecessary recalculations
  const balanceData = useMemo(() => {
    if (!transactions || transactions.length === 0) return { balance: 0, isNormalized: false }
    
    const netPosition = transactions.reduce((total, tx) => total + tx.balance, 0)
    
    const isNegative = netPosition < 0
    const normalizedBalance = Math.abs(netPosition)
    
    const displayBalance = Math.max(normalizedBalance, 0.01)
    
    return { 
      balance: displayBalance, 
      isNormalized: isNegative,
      originalBalance: netPosition
    }
  }, [transactions])

  // Memoize utility functions
  const formatTransactionAmount = useCallback((balance) => {
    const amount = Math.abs(balance)
    const sign = balance >= 0 ? '+' : '-'
    return `${sign}${amount.toFixed(2)} BTC`
  }, [])

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toISOString().split('T')[0]
  }, [])

  const handleCopyAddress = useCallback(async () => {
    if (wallet?.address) {
      try {
        await navigator.clipboard.writeText(wallet.address)
        setIsCopied(true)
        
        // Add haptic feedback if supported
        if (navigator.vibrate) {
          navigator.vibrate(50) // Short vibration
        }
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false)
        }, 2000)
      } catch (error) {
        console.error('Failed to copy address:', error)
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = wallet.address
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        setIsCopied(true)
        
        // Add haptic feedback if supported
        if (navigator.vibrate) {
          navigator.vibrate(50) // Short vibration
        }
        
        setTimeout(() => {
          setIsCopied(false)
        }, 2000)
      }
    }
  }, [wallet?.address])

  const handleSync = useCallback(async () => {
    if (!selectedWallet || !syncWallet || isSyncing) return
    
    try {
      setIsSyncing(true)
      
      // Add minimum loading duration for better UX
      const minLoadingTime = 1000 // 1 second minimum
      const startTime = Date.now()
      
      await syncWallet(selectedWallet)
      refetchTransactions()
      
      // Ensure minimum loading time for smooth animation
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime))
      }
    } catch (error) {
      // Error handling is done in the useWallets hook
    } finally {
      setIsSyncing(false)
    }
  }, [selectedWallet, syncWallet, isSyncing, refetchTransactions])

  const handleEditToggle = useCallback(() => {
    setEditMode(!isEditMode)
  }, [isEditMode, setEditMode])


  if (!wallet) {
    return (
      <div className="wallet-overview">
        <div className="no-wallet-selected">
          <h2>No wallet selected</h2>
          <p>Select a wallet from the sidebar to view details and transactions.</p>
        </div>
      </div>
    )
  }


  return (
    <div className="wallet-overview">
      {/* Wallet Header */}
      <div className="wallet-header">
        <div className="wallet-title-section">
          <h1 className="wallet-title">
            {wallet.name} <span className="wallet-title-address">{formatWalletAddress(wallet.address)}</span>
            <div className="copy-container">
              <CopyIcon 
                size={20} 
                className={`copy-icon ${isCopied ? 'copied' : ''}`} 
                onClick={handleCopyAddress}
                title={isCopied ? 'Copied!' : 'Copy address'}
              />
              {isCopied && (
                <div className="copy-tooltip">
                  Copied!
                </div>
              )}
            </div>
          </h1>
        </div>
        
        <div className="wallet-actions">
          <button className={`btn btn-primary ${isSyncing ? 'syncing' : ''}`} onClick={handleSync} disabled={isSyncing}>
            <ArrowsClockwiseIcon size={16} />
            {isSyncing ? 'Syncing...' : 'Sync'}
          </button>
          <button className={`btn ${isEditMode ? 'btn-primary' : 'btn-secondary'}`} onClick={handleEditToggle}>
            <PencilSimpleIcon size={16} />
            {isEditMode ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="wallet-balance">
        ${balanceData.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        {balanceData.isNormalized && (
          <span className="balance-indicator" title={`Original balance: ${balanceData.originalBalance.toFixed(2)} BTC`}>
            *
          </span>
        )}
      </div>

      {/* Transactions Section */}
      <div className="transactions-section">
        <h2 className="transactions-title">Transactions</h2>
        
        {transactionsLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : transactionsError ? (
          <div className="error-state">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <h3>Error loading transactions</h3>
              <p>{transactionsError}</p>
              {transactionsIsRetrying && (
                <div className="retry-info">
                  Retrying in {Math.ceil(Math.min(1000 * Math.pow(2, transactionsRetryCount), 5000) / 1000)} seconds... (Attempt {transactionsRetryCount + 1}/5)
                </div>
              )}
              {transactionsRetryCount >= 5 && (
                <div className="retry-info">
                  Max retry attempts reached. Please check your connection.
                </div>
              )}
              {!transactionsIsRetrying && transactionsRetryCount < 5 && (
                <button onClick={refetchTransactions} className="retry-button">
                  Try Again Now
                </button>
              )}
            </div>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="transaction-list">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-id">{formatWalletAddress(wallet.address)}</div>
                <div className="transaction-center-group">
                  <div className={`transaction-status ${transaction.balance >= 0 ? 'received' : 'sent'}`}>
                    {transaction.balance >= 0 ? 'Received' : 'Sent'}
                  </div>
                  <div className="transaction-date">{formatDate(transaction.date)}</div>
                  <div className="transaction-confirmations">{transaction.confirmations} confirmations</div>
                </div>
                <div className={`transaction-amount ${transaction.balance >= 0 ? 'positive' : 'negative'}`}>
                  {formatTransactionAmount(transaction.balance)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-transactions">
            <p>No transactions found for this wallet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
const WalletOverviewMemo = memo(WalletOverview)

export default WalletOverviewMemo

