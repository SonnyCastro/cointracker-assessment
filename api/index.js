// Vercel serverless function entry point
// Note: Vercel automatically provides environment variables from dashboard settings
// No need for dotenv here - env vars are injected by Vercel

const app = require('../server/src/app');
const databaseService = require('../server/src/services/databaseService');

let isInitialized = false;

module.exports = async (req, res) => {
  try {
    // Initialize database on first request (cold start)
    if (!isInitialized) {
      await databaseService.initializeDataFiles();
      isInitialized = true;
    }

    // Pass request to Express app
    return app(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
