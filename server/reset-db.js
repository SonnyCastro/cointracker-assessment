const databaseService = require('./src/services/databaseService');

async function resetDatabase() {
  console.log('🔄 Resetting database...');

  try {
    await databaseService.resetDatabase();
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  }
}



// Run the reset
resetDatabase();
