const constants = require('../utils/constants');

/**
 * Middleware that simulates random server errors
 * Fails requests with a configurable probability to test error handling
 */
function errorSimulationMiddleware(req, res, next) {
  // Skip error simulation if disabled, server is shutting down, or health check
  if (!constants.ENABLE_ERROR_SIMULATION || constants.IS_SHUTTING_DOWN || req.path === '/health') {
    return next();
  }

  // Generate random number between 0 and 1
  const random = Math.random();

  // If random number is less than failure rate, simulate error
  if (random < constants.ERROR_FAILURE_RATE) {
    console.log(`🚨 Simulated error for ${req.method} ${req.path} (random: ${random.toFixed(3)})`);
    return res.status(500).json({
      error: 'Internal server error (simulated)',
      message: 'This is a simulated error to test error handling',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
  }

  // Continue to next middleware/route handler
  next();
}

module.exports = errorSimulationMiddleware;
