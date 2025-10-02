import { useEffect, useState } from 'react'
import { useWallets } from './hooks/useWallets'
import { useWalletTransactions } from './hooks/useWalletTransactions'
import WalletSidebar from './components/WalletSidebar'
import WalletOverview from './components/WalletOverview'
import './App.css'

function App() {
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const { wallets, loading, error, retryCount, isRetrying, refetch, createWallet, deleteWallet, syncWallet } = useWallets()
  const { refetch: refetchTransactions } = useWalletTransactions(selectedWallet)


  useEffect(() => {
    if (!loading && wallets && wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0].id)
    }
  }, [wallets, loading, selectedWallet])

  // Reset selected wallet if it's no longer in the wallets list
  useEffect(() => {
    if (selectedWallet && wallets && wallets.length > 0) {
      const walletExists = wallets.some(w => w.id === selectedWallet)
      if (!walletExists) {
        setSelectedWallet(wallets[0].id)
      }
    }
  }, [wallets]) // Removed selectedWallet from dependencies to prevent infinite loop

  const handleWalletSelect = (walletId) => {
    setSelectedWallet(walletId)
  }

  const handleEditModeChange = (editMode) => {
    setIsEditMode(editMode)
  }


  return (
    <div className="app-container">
      {/* Wallet Sidebar */}
      <WalletSidebar 
        selectedWallet={selectedWallet}
        onWalletSelect={handleWalletSelect}
        isEditMode={isEditMode}
        onEditModeChange={handleEditModeChange}
        wallets={wallets}
        loading={loading}
        error={error}
        retryCount={retryCount}
        isRetrying={isRetrying}
        refetch={refetch}
        createWallet={createWallet}
        deleteWallet={deleteWallet}
        syncWallet={syncWallet}
        refetchTransactions={refetchTransactions}
      />

      {/* Main Content */}
      <div className="main-content">
        <WalletOverview 
          selectedWallet={selectedWallet}
          wallets={wallets}
          onEditModeChange={handleEditModeChange}
          isEditMode={isEditMode}
          syncWallet={syncWallet}
        />
      </div>
    </div>
  )
}

export default App
