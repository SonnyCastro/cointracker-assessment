# CoinTracker Assessment

A full-stack cryptocurrency wallet tracking application built with React and Node.js/Express.

## Project Structure

This project consists of two main components:

- **Client** (`/client`): React frontend application built with Vite
- **Server** (`/server`): Node.js/Express backend API with mock data

## Features

- View cryptocurrency wallet balances and transactions
- Create and manage multiple wallets
- Real-time transaction history
- Responsive web interface
- Mock API with simulated data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/SonnyCastro/cointracker-assetment.git
cd cointracker-assetment
```

2. Install server dependencies:

```bash
cd server
npm install
```

3. Install client dependencies:

```bash
cd ../client
npm install
```

### Running the Application

1. Start the backend server:

```bash
cd server
npm run dev
```

The API will be available at `http://localhost:3000`

2. Start the frontend development server:

```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

- `GET /wallets` - List all wallets
- `GET /wallets/:walletId` - Get wallet transactions
- `POST /wallets` - Create new wallet
- `GET /wallets/sync` - Sync endpoint
- `DELETE /wallets/:walletId` - Delete wallet
- `GET /health` - Health check

## Technologies Used

### Frontend

- React 19
- Vite
- ESLint

### Backend

- Node.js
- Express.js
- Faker.js (for mock data)
- Nodemon (for development)

## Development

The project includes error simulation middleware for testing error handling scenarios. The server randomly simulates errors to test frontend resilience.

## License

ISC
