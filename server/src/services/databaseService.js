const fs = require('fs').promises;
const path = require('path');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const constants = require('../utils/constants');

const WALLETS_FILE = path.join(__dirname, '..', '..', 'data', 'wallets.json');
const TRANSACTIONS_FILE = path.join(__dirname, '..', '..', 'data', 'transactions.json');

class DatabaseService {
  constructor() {
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    const dataDir = path.dirname(WALLETS_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async initializeDataFiles() {
    let walletsExist = false;
    let transactionsExist = false;

    try {
      await fs.access(WALLETS_FILE);
      walletsExist = true;
    } catch {
      await fs.writeFile(WALLETS_FILE, JSON.stringify([], null, 2));
    }

    try {
      await fs.access(TRANSACTIONS_FILE);
      transactionsExist = true;
    } catch {
      await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify([], null, 2));
    }

    // If both files are empty (new initialization), populate with sample data
    if (!walletsExist && !transactionsExist) {
      await this.populateSampleData();
    }
  }

    async populateSampleData() {
    console.log('📊 Initializing database with sample data...');

    // Create wallets with name and iconURL
    const wallets = constants.SAMPLE_WALLETS.map(wallet => ({
      id: crypto.randomUUID(),
      address: wallet.address,
      name: wallet.name,
      iconURL: wallet.iconURL
    }));

    // Generate transactions for each wallet
    const allTransactions = [];

    // Wallet 1: 10 transactions
    for (let i = 0; i < 10; i++) {
      allTransactions.push({
        id: faker.string.uuid(),
        walletId: wallets[0].id,
        date: faker.date.between({ from: '2023-01-01', to: '2024-12-31' }).toISOString(),
        balance: parseFloat(faker.finance.amount({ min: -1000, max: 1000, dec: 2 })),
        confirmations: Math.floor(Math.random() * 10) + 1
      });
    }

    // Wallet 2: 20 transactions
    for (let i = 0; i < 20; i++) {
      allTransactions.push({
        id: faker.string.uuid(),
        walletId: wallets[1].id,
        date: faker.date.between({ from: '2023-01-01', to: '2024-12-31' }).toISOString(),
        balance: parseFloat(faker.finance.amount({ min: -2000, max: 2000, dec: 2 })),
        confirmations: Math.floor(Math.random() * 10) + 1
      });
    }

    // Wallet 3: 156K transactions (using a more efficient approach)
    console.log('   Generating 156,000 transactions for wallet 3...');
    const batchSize = 1000;
    const totalTransactions = 156000;

    for (let batch = 0; batch < totalTransactions; batch += batchSize) {
      const batchTransactions = [];
      const currentBatchSize = Math.min(batchSize, totalTransactions - batch);

      for (let i = 0; i < currentBatchSize; i++) {
        batchTransactions.push({
          id: faker.string.uuid(),
          walletId: wallets[2].id,
          date: faker.date.between({ from: '2023-01-01', to: '2024-12-31' }).toISOString(),
          balance: parseFloat(faker.finance.amount({ min: -5000, max: 5000, dec: 2 })),
          confirmations: Math.floor(Math.random() * 10) + 1
        });
      }

      allTransactions.push(...batchTransactions);

      // Progress indicator for large dataset
      if (batch % 10000 === 0) {
        console.log(`   Generated ${batch + currentBatchSize} transactions...`);
      }
    }

    // Write data to files
    await this.writeWallets(wallets);
    await this.writeTransactions(allTransactions);

    console.log(`✅ Database initialized with ${wallets.length} wallets and ${allTransactions.length} transactions`);
    console.log(`   Wallet 1: ${wallets[0].address} (10 transactions)`);
    console.log(`   Wallet 2: ${wallets[1].address} (20 transactions)`);
    console.log(`   Wallet 3: ${wallets[2].address} (156,000 transactions)`);
  }

  async readWallets() {
    try {
      const data = await fs.readFile(WALLETS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async readTransactions() {
    try {
      const data = await fs.readFile(TRANSACTIONS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async writeWallets(wallets) {
    await fs.writeFile(WALLETS_FILE, JSON.stringify(wallets, null, 2));
  }

  async writeTransactions(transactions) {
    await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
  }

  async resetDatabase() {
    console.log('🔄 Resetting database...');

    try {
      // Remove existing data files
      try {
        await fs.unlink(WALLETS_FILE);
        console.log('   Removed existing wallets.json');
      } catch (error) {
        // File doesn't exist, that's fine
      }

      try {
        await fs.unlink(TRANSACTIONS_FILE);
        console.log('   Removed existing transactions.json');
      } catch (error) {
        // File doesn't exist, that's fine
      }

      // Re-initialize with sample data
      await this.populateSampleData();

      console.log('✅ Database reset complete!');
      console.log('   You can now restart the server to use the fresh data.');

    } catch (error) {
      console.error('❌ Error resetting database:', error.message);
    }
  }
}

module.exports = new DatabaseService();
