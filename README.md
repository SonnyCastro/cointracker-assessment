# CoinTracker Assessment - Technical Documentation

A production-ready, TypeScript-based cryptocurrency wallet tracking application demonstrating modern React patterns, robust error handling, and performance optimization.

![CoinTracker Wallet Interface](https://res.cloudinary.com/dlgdqwrhd/image/upload/v1759439346/Screenshot_2025-10-02_at_5.04.18_PM_yqplux.png)

📄 **[View Implementation Process & Design Decisions on Notion](https://www.notion.so/CoinTracker-Engineering-Assignment-Implementation-Process-280d2882689a8012b422f281469aa289)**

---

## Overview

Full-stack Bitcoin wallet management system featuring:

- **Multiple wallet tracking** from providers (Coinbase, Kraken, Phantom)
- **Real-time transaction history** with balance calculations
- **Sync operations** to fetch latest transactions
- **Graceful error handling** with automatic retry (exponential backoff)
- **Smooth UX** with optimized re-renders and animations

**Tech Stack:** React 19 + TypeScript 5.9 + Vite 7 | Express 4 + Node.js 18+

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/SonnyCastro/cointracker-assessment.git
cd cointracker-assessment

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Start backend (Terminal 1)
cd server
npm run dev
# Server runs on http://localhost:3000

# Start frontend (Terminal 2)
cd client
npm run dev
# Client runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser to use the application.

---

## Project Structure

```
cointracker-assessment/
├── client/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # ErrorBoundary, WalletSidebar, WalletOverview
│   │   ├── contexts/       # AppContext (global state)
│   │   ├── hooks/          # useWallets, useWalletTransactions, useRetry
│   │   ├── services/       # walletService (API client)
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Formatting, validation helpers
│   └── tsconfig.json       # Strict mode enabled
│
├── server/              # Express Node.js backend
│   └── src/
│       ├── controllers/    # Request handlers
│       ├── services/       # Business logic
│       └── middleware/     # Error simulation (30% rate)
│
└── shared/              # Constants (ES6 + CommonJS + TypeScript)
```

---

## API Overview

RESTful API for wallet and transaction management:

- **GET /wallets** - List all wallets
- **GET /wallets/:walletId** - Get wallet transactions
- **POST /wallets** - Create new wallet
- **POST /wallets/:walletId/sync** - Sync wallet (generates 1-3 new transactions)
- **DELETE /wallets/:walletId** - Delete wallet
- **GET /health** - Health check

**Error Simulation:** 30% random failure rate for testing client-side error handling.

📚 **Detailed API docs:** [server/README.md](./server/README.md)

---

## Key Implementation Highlights

### 1. TypeScript Migration with Strict Mode

```json
// tsconfig.json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true
}
```

**Result:** 18 TypeScript files, zero `any` in business logic, full type safety.

### 2. Three-Layer Error Handling

```typescript
// Layer 1: ErrorBoundary - React rendering errors
;<ErrorBoundary>
  <AppProvider>...</AppProvider>
</ErrorBoundary>

// Layer 2: useWallets.ts - Network errors with auto-retry
// Exponential backoff: 1s → 2s → 4s → 5s → 5s (max 5 attempts)
useEffect(() => {
  if (error && retryCount < 5) handleRetry()
}, [error, retryCount])

// Layer 3: Components - Input validation
if (!isValidBitcoinAddress(address)) {
  setFormError("Please enter a valid Bitcoin address")
}
```

**Why:** Separates concerns - UI errors, network failures, and user input each handled appropriately.

### 3. Atomic Operations Prevent UI Flash

```typescript
// ❌ Problem: Two API calls cause visible flash
await syncWallet(walletId)
await refetchWallets() // Causes second render → flash

// ✅ Solution: Single atomic update (useWallets.ts)
const syncWallet = async (walletId) => {
  const [newTransactions, updatedWallets] = await Promise.all([
    walletService.syncWallet(walletId),
    walletService.getAllWallets(),
  ])
  setWallets(updatedWallets) // One update = smooth UI
  return { transactions: newTransactions, updatedWallets }
}
```

**Impact:** Eliminated layout shifts and visual flashing during sync.

### 4. Race Condition Prevention

```typescript
// Problem: Selecting wallet before it exists in list
// Solution: Pending selection queue (AppContext.tsx)

// Step 1: Queue the selection
setPendingWalletSelection(newWalletId)

// Step 2: Auto-select when wallet appears
useEffect(() => {
  if (
    pendingWalletSelection &&
    wallets.some((w) => w.id === pendingWalletSelection)
  ) {
    setSelectedWallet(pendingWalletSelection)
    clearPendingWalletSelection()
  }
}, [wallets, pendingWalletSelection])
```

**Result:** Guaranteed correct wallet selection timing.

### 5. Performance Optimization

```typescript
// Component memoization
export default memo(WalletSidebar)

// Expensive calculations memoized
const transformedWallets = useMemo(() => {
  return wallets.map((wallet) => ({
    name: getWalletProvider(wallet.name, wallet.address),
    address: formatWalletAddress(wallet.address),
    // ... recalculates only when wallets/selectedWallet change
  }))
}, [wallets, selectedWallet])

// Stable callback references
const handleSync = useCallback(
  async (walletId) => {
    await syncWallet(walletId)
  },
  [syncWallet]
)
```

**Result:** Prevents unnecessary re-renders, optimizes list transformations.

### 6. Context API with Reducer

```typescript
// Centralized state management (AppContext.tsx)
const appReducer = (state, action) => {
  switch (action.type) {
    case "SET_SELECTED_WALLET":
      return { ...state, selectedWallet: action.payload }
    case "ADD_NEWLY_ADDED_WALLET":
      return {
        ...state,
        newlyAddedWallets: new Set([
          ...state.newlyAddedWallets,
          action.payload,
        ]),
      }
  }
}

// Memoized actions prevent re-renders
const setSelectedWallet = useCallback(
  (walletId) => dispatch({ type: "SET_SELECTED_WALLET", payload: walletId }),
  []
)
```

**Benefits:** Predictable state, easy debugging, scalable.

---

## Code Examples

### Using Custom Hooks

```typescript
import { useAppContext } from "./contexts/AppContext"

function WalletManager() {
  const { wallets, createWallet, syncWallet, deleteWallet } = useAppContext()

  // Create wallet
  const handleCreate = async (address: string) => {
    const walletId = await createWallet(address)
  }

  // Sync wallet (updates internally, no refetch needed)
  const handleSync = async (walletId: string) => {
    const { transactions } = await syncWallet(walletId)
  }

  return <div>{/* Your UI */}</div>
}
```

### Error Boundary Setup

```typescript
import ErrorBoundary from "./components/ErrorBoundary"

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>{/* Your components */}</AppProvider>
    </ErrorBoundary>
  )
}
```

---

## Common Pitfalls Avoided

### 1. Race Conditions

**Problem:** Wallet selection before existence  
**Solution:** Pending selection queue waits for wallet to appear

### 2. UI Flash/Layout Shift

**Problem:** Separate sync + refetch causes visible flash  
**Solution:** Atomic state updates with single render cycle

### 3. Memory Leaks

**Problem:** Uncleaned timers/subscriptions  
**Solution:** Proper cleanup in useEffect return

### 4. Unnecessary Re-renders

**Problem:** Expensive calculations on every render  
**Solution:** useMemo, useCallback, memo() for optimization

### 5. Stale Closures

**Problem:** Callbacks capturing old values  
**Solution:** Complete dependency arrays in useCallback/useEffect

---

## Troubleshooting

**Issue:** "Cannot find module '@shared/constants'"  
**Fix:** Check path aliases in `tsconfig.json` and `vite.config.ts`

**Issue:** Wallets not loading  
**Fix:**

1. Verify server running: `curl http://localhost:3000/health`
2. Check browser console for errors
3. Verify `data/wallets.json` exists

**Issue:** TypeScript errors after migration  
**Fix:**

```bash
rm -rf node_modules package-lock.json
npm install
npm run type-check
```

---
