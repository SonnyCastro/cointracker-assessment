import { useState, useEffect } from 'react'
import { CopyIcon, PencilSimpleIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react'
import { useWalletTransactions } from '../hooks/useWalletTransactions'
import { formatWalletAddress, getWalletProvider, getWalletIcon, getWalletProviderAlt } from '../utils/walletUtils'
import './WalletOverview.css'

const WalletOverview = ({ selectedWallet, wallets, onEditModeChange, isEditMode, syncWallet }) => {
  const [wallet, setWallet] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const { transactions, loading: transactionsLoading, error: transactionsError, retryCount, isRetrying, refetch: refetchTransactions } = useWalletTransactions(selectedWallet)


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

  const calculateBalance = () => {
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
  }

  const formatTransactionAmount = (balance) => {
    const amount = Math.abs(balance)
    const sign = balance >= 0 ? '+' : '-'
    return `${sign}${amount.toFixed(2)} BTC`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0]
  }

  const handleCopyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address)
    }
  }

  const handleSync = async () => {
    if (!selectedWallet || !syncWallet || isSyncing) return
    
    try {
      setIsSyncing(true)
      await syncWallet(selectedWallet)
      refetchTransactions()
    } catch (error) {
      // Error handling is done in the useWallets hook
    } finally {
      setIsSyncing(false)
    }
  }

  const handleEditToggle = () => {
    const newEditMode = !isEditMode
    if (onEditModeChange) {
      onEditModeChange(newEditMode)
    }
  }


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

  const balanceData = calculateBalance()

  return (
    <div className="wallet-overview">
      {/* Wallet Header */}
      <div className="wallet-header">
        <div className="wallet-title-section">
          <h1 className="wallet-title">
            {wallet.name} <span className="wallet-title-address">{formatWalletAddress(wallet.address)}</span>
            <CopyIcon size={16} className="copy-icon" onClick={handleCopyAddress} />
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
              {isRetrying && (
                <div className="retry-info">
                  Retrying in {Math.ceil(Math.min(1000 * Math.pow(2, retryCount), 5000) / 1000)} seconds... (Attempt {retryCount + 1}/5)
                </div>
              )}
              {retryCount >= 5 && (
                <div className="retry-info">
                  Max retry attempts reached. Please check your connection.
                </div>
              )}
              {!isRetrying && retryCount < 5 && (
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

export default WalletOverview

