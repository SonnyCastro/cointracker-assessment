import { AppProvider } from './contexts/AppContext'
import WalletSidebar from './components/WalletSidebar'
import WalletOverview from './components/WalletOverview'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="app-container">
          {/* Wallet Sidebar */}
          <WalletSidebar />

          {/* Main Content */}
          <div className="main-content">
            <WalletOverview />
          </div>
        </div>
      </AppProvider>
    </ErrorBoundary>
  )
}

export default App
