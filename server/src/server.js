// Load environment variables from .env file
require('dotenv').config();

const app = require('./app');
const databaseService = require('./services/databaseService');
const constants = require('./utils/constants');

async function startServer() {
  try {
    // Initialize database
    await databaseService.initializeDataFiles();

    // Start server
    const server = app.listen(constants.PORT, () => {
      console.log(`Server is running on port ${constants.PORT}`);
      console.log(`API endpoints:`);
      console.log(`  GET  /wallets - List all wallets`);
      console.log(`  GET  /wallets/:walletId - Get wallet transactions`);
      console.log(`  POST /wallets - Create new wallet`);
      console.log(`  GET  /wallets/sync - Sync endpoint`);
      console.log(`  DELETE /wallets/:walletId - Delete wallet`);
      console.log(`  GET  /health - Health check`);
    });

    // Simple shutdown function
    function shutDown() {
      console.log('\nShutting down server...');
      constants.IS_SHUTTING_DOWN = true;

      // Try to close the server
      server.close((err) => {
        if (err) {
          console.log('Error during shutdown:', err);
        } else {
          console.log('Closed out remaining connections');
        }
        process.exit(err ? 1 : 0);
      });

      // Force exit after 500ms if graceful shutdown fails
      setTimeout(() => {
        console.log('Forcing shutdown...');
        process.exit(1);
      }, 500);
    }

    // Listen for termination signals
    process.on('SIGTERM', shutDown);
    process.on('SIGINT', shutDown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
