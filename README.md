# CoinTracker Assessment

A full-stack cryptocurrency wallet tracking application built with React and Node.js/Express. This application allows users to manage multiple Bitcoin wallets, view transaction history, and synchronize wallet data.

<img src="https://res.cloudinary.com/dlgdqwrhd/image/upload/v1759439346/Screenshot_2025-10-02_at_5.04.18_PM_yqplux.png" alt="CoinTracker Wallet Interface" width="600" height="auto" />

_Clean, modern cryptocurrency wallet management interface with sidebar navigation and detailed transaction overview_

## Project Structure

This project consists of two main components:

- **Client** (`/client`): React frontend application built with Vite
- **Server** (`/server`): Node.js/Express backend API with mock data

## Features

- **Wallet Management**: Add, remove, and manage multiple Bitcoin wallets
- **Sync**: Synchronize wallet data and generate new transactions
- **Transaction History**: View detailed transaction history with status indicators
- **Balance Tracking**: Balance calculations with transaction data
- **Responsive Design**: Mobile-first responsive interface
- **Error Handling**: Robust error handling with automatic retry mechanisms
- **Modern UI**: Clean, professional interface matching design specifications

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation & Setup

1. **Clone the repository:**

```bash
git clone https://github.com/SonnyCastro/cointracker-assessment.git
cd cointracker-assessment
```

2. **Install all dependencies:**

Install server dependencies:

```bash
cd server
npm install
```

Install client dependencies:

```bash
cd ../client
npm install
```

### Running the Application

**Start both servers:**

1. **Start the backend server** (Terminal 1):

```bash
cd server
npm run dev
```

The API will be available at `http://localhost:3000`

2. **Start the frontend development server** (Terminal 2):

```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

**That's it!** Open your browser to `http://localhost:5173` to start using the application.

## API Endpoints

- `GET /wallets` - List all wallets
- `GET /wallets/:walletId/transactions` - Get wallet transactions
- `POST /wallets` - Create new wallet with Bitcoin address
- `POST /wallets/:walletId/sync` - Sync wallet and generate new transactions
- `DELETE /wallets/:walletId` - Delete wallet
- `GET /health` - Health check

## Sample Bitcoin Addresses

The application works with these sample Bitcoin addresses:

- `3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd`
- `bc1q0sg9rdst255gtldsmcf8rk0764avqy2h2ksqs5`
- `bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h` (156,000+ transactions)

## Technologies Used

### Frontend

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Phosphor Icons** - Beautiful icon library
- **CSS Variables** - Consistent design system
- **Custom Hooks** - Reusable state management logic

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Faker.js** - Mock data generation
- **Nodemon** - Development auto-restart

## Key Features Implemented

- ✅ **Wallet Management**: Add/remove Bitcoin wallets with validation
- ✅ **Transaction Sync**: Generate realistic transaction data
- ✅ **Real-time Updates**: Automatic data refresh and state synchronization
- ✅ **Error Handling**: Comprehensive error states with retry mechanisms
- ✅ **Responsive Design**: Mobile-first responsive interface
- ✅ **Modern UI**: Pixel-perfect implementation matching design specs
- ✅ **State Management**: Centralized state with custom React hooks

## Notion

📝 **Detailed Implementation Process**: [CoinTracker Engineering Assignment - Implementation Process](https://www.notion.so/CoinTracker-Engineering-Assignment-Implementation-Process-280d2882689a8012b422f281469aa289?source=copy_link)
