# CoinTracker Mock API

A NodeJS API service for managing cryptocurrency wallets and transactions.

## Features

- Wallet management (create, read, delete)
- Transaction tracking per wallet
- Simple JSON file-based storage
- RESTful API design
- Organized MVC-like architecture

## Prerequisites

This project requires **Node.js v22**. The recommended way is to use `mise` for version management:

### Install Node.js v22 with mise

**Option 1: Using mise (Recommended)**
```bash
# Install mise (if you don't have it)
curl https://mise.run | sh

# Install and use Node.js v22
mise install node@22
mise use node@22

# Verify installation
node --version
```

**Option 2: Using Node Version Manager (nvm)**
```bash
# Install nvm (if you don't have it)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal or run:
source ~/.bashrc

# Install Node.js v22
nvm install 22
nvm use 22

# Verify installation
node --version
```

**Option 3: Direct download**
- Visit [nodejs.org](https://nodejs.org/)
- Download and install Node.js v22 LTS

**Option 4: Using Homebrew (macOS)**
```bash
brew install node@22
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Reset database (clears all data and re-initializes with sample data)
npm run reset-db
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## Pre-populated Data

When the server starts for the first time, it automatically initializes the database with sample data:

### Wallets
- **Coinbase** (`3E8ociqZa9mZUSwGdSmAEMAoAxBK3FNDcd`) - 10 transactions
- **Kraken** (`bc1q0sg9rdst255gtldsmcf8rk0764avqy2h2ksqs5`) - 20 transactions
- **Phantom** (`bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h`) - 156,000 transactions

### Transactions
All transactions are randomly generated with:
- Random dates between 2023-2024
- Random balance amounts (positive and negative)
- Unique transaction IDs
- Proper wallet associations

## API Endpoints

### Wallets

#### GET /wallets
Returns a list of all available wallets.

**Response:**
```json
[
  {
    "id": "uuid-string",
    "address": "wallet-address",
    "name": "wallet-name",
    "iconURL": "https://example.com/icon.svg"
  }
]
```

#### GET /wallets/:walletId
Returns all transactions for a specific wallet.

**Response:**
```json
[
  {
    "id": "transaction-id",
    "walletId": "wallet-id",
    "date": "2024-01-01T00:00:00.000Z",
    "balance": 100.50,
    "confirmations": 5
  }
]
```

#### POST /wallets
Creates a new wallet and returns the complete list of wallets. The wallet name is auto-generated and iconURL is set to empty.

**Request Body:**
```json
{
  "address": "new-wallet-address"
}
```

**Response:**
```json
[
  {
    "id": "auto-generated-uuid",
    "address": "new-wallet-address",
    "name": "Wallet 1234",
    "iconURL": ""
  }
]
```

#### POST /wallets/:walletId/sync
Appends 1-3 new transactions to the specified wallet, using the current timestamp and random data for the other fields.

**Response:**
```json
[
  {
    "id": "transaction-id",
    "walletId": "wallet-id",
    "date": "2024-07-17T18:00:00.000Z",
    "balance": 123.45,
    "confirmations": 7
  },
  // ... 1-3 new transactions
]
```

#### DELETE /wallets/:walletId
Removes a wallet and all its associated transactions.

**Response:**
```json
{
  "message": "Wallet deleted successfully"
}
```

#### GET /health
Health check endpoint to verify the API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Data Models

### Wallet
```json
{
  "id": "string (UUID, auto-generated)",
  "address": "string (wallet address)",
  "name": "string (wallet name)",
  "iconURL": "string (wallet icon URL)"
}
```

### Transaction
```json
{
  "id": "string (transaction ID)",
  "walletId": "string (reference to wallet)",
  "date": "string (ISO date)",
  "balance": "number (positive or negative)",
  "confirmations": "number (1-10)"
}
```

## Project Structure

```
src/
├── controllers/     # Business logic and request handling
│   └── walletController.js
├── routes/          # API route definitions
│   └── walletRoutes.js
├── services/        # Data access and business services
│   └── databaseService.js
├── utils/           # Utilities and constants
│   └── constants.js
├── app.js           # Express app configuration
└── server.js        # Server entry point
```

## Data Storage

The API uses JSON files for data storage:
- `data/wallets.json` - Stores wallet information
- `data/transactions.json` - Stores transaction information

These files are automatically created when the server starts.

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing required fields, duplicate address)
- `404` - Not Found (wallet doesn't exist)
- `500` - Internal Server Error

Error responses include a message:
```json
{
  "error": "Error description"
}
```

### Error Simulation

The API includes a feature to simulate random server errors for testing error handling:

- **10% failure rate**: Random requests will fail with HTTP 500 errors
- **Configurable**: Can be disabled by setting `ENABLE_ERROR_SIMULATION: false` in `src/utils/constants.js`
- **Informative errors**: Simulated errors include details about the request

**Simulated error response:**
```json
{
  "error": "Internal server error (simulated)",
  "message": "This is a simulated error to test error handling",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/wallets",
  "method": "GET"
}
```

**To disable error simulation:**
```javascript
// In src/utils/constants.js
ENABLE_ERROR_SIMULATION: false
```

## Example Usage

### Create a wallet
```bash
curl -X POST http://localhost:3000/wallets \
  -H "Content-Type: application/json" \
  -d '{"address": "0x1234567890abcdef"}'
```

### Get all wallets
```bash
curl http://localhost:3000/wallets
```

### Get wallet transactions
```bash
curl http://localhost:3000/wallets/wallet-id-here
```

### Delete a wallet
```bash
curl -X DELETE http://localhost:3000/wallets/wallet-id-here
```

### Sync endpoint
```bash
curl http://localhost:3000/wallets/sync
```
