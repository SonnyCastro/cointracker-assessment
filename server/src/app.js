const express = require('express');
const walletRoutes = require('./routes/walletRoutes');
const errorSimulationMiddleware = require('./middleware/errorSimulation');

const app = express();

// Custom CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173', // Vite default dev server
    'http://localhost:3000', // Alternative dev port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    // Production domains - from environment variable
    process.env.CLIENT_URL, // e.g., https://cointracker-client.vercel.app
  ].filter(Boolean); // Remove undefined values

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());

// Error simulation middleware (applies to all routes)
app.use(errorSimulationMiddleware);

// Routes
app.use('/wallets', walletRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
