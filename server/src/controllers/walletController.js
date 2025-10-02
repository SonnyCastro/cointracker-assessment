const crypto = require('crypto');
const { faker } = require('@faker-js/faker');
const databaseService = require('../services/databaseService');

class WalletController {
  // GET /wallets - returns a list of available wallets
  async getAllWallets(req, res) {
    try {
      const wallets = await databaseService.readWallets();
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch wallets' });
    }
  }

  // GET /wallets/:walletId - returns a list of wallet transactions
  async getWalletTransactions(req, res) {
    try {
      const { walletId } = req.params;
      const wallets = await databaseService.readWallets();
      const transactions = await databaseService.readTransactions();

      // Check if wallet exists
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      // Filter transactions for this wallet
      const walletTransactions = transactions.filter(t => t.walletId === walletId);
      res.json(walletTransactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch wallet transactions' });
    }
  }

  // POST /wallets - adds a new wallet to the list and returns the entire list
  async createWallet(req, res) {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ error: 'Address is required' });
      }

      const wallets = await databaseService.readWallets();

      // Check if address already exists
      const existingWallet = wallets.find(w => w.address === address);
      if (existingWallet) {
        return res.status(400).json({ error: 'Wallet with this address already exists' });
      }

      // Generate random wallet provider name (consistent with client)
      const providers = ['Coinbase', 'Kraken', 'Phantom'];
      const randomProvider = providers[Math.floor(Math.random() * providers.length)];

      // Create new wallet with auto-generated ID, random provider name, and empty iconURL
      const newWallet = {
        id: crypto.randomUUID(),
        address: address,
        name: randomProvider,
        iconURL: ""
      };

      wallets.push(newWallet);
      await databaseService.writeWallets(wallets);

      res.status(201).json(wallets);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create wallet' });
    }
  }

  // POST /wallets/:walletId/sync - appends 1-3 new transactions to the wallet
  async syncWallet(req, res) {
    try {
      const { walletId } = req.params;
      const wallets = await databaseService.readWallets();
      const transactions = await databaseService.readTransactions();

      // Check if wallet exists
      const wallet = wallets.find(w => w.id === walletId);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      // Generate 1-3 new transactions
      const numNewTx = Math.floor(Math.random() * 3) + 1;
      const now = new Date();

      // Get existing transactions for this wallet to calculate current balance
      const existingTransactions = transactions.filter(t => t.walletId === walletId);
      const currentBalance = existingTransactions.reduce((total, tx) => total + tx.balance, 0);

      const newTransactions = Array.from({ length: numNewTx }).map((_, index) => {
        // Generate transaction date (spread over the last few days)
        const transactionDate = new Date(now.getTime() - (index * 24 * 60 * 60 * 1000) - Math.random() * 24 * 60 * 60 * 1000);

        // Generate more realistic transaction amounts
        // 70% chance of receiving money, 30% chance of sending
        const isReceive = Math.random() < 0.7;
        const amount = parseFloat(faker.finance.amount({
          min: isReceive ? 0.01 : 0.01,
          max: isReceive ? 2.5 : Math.min(1.0, Math.max(0.01, currentBalance)),
          dec: 8
        }));

        return {
          id: faker.string.uuid(),
          walletId: walletId,
          date: transactionDate.toISOString(),
          balance: isReceive ? amount : -amount,
          confirmations: Math.floor(Math.random() * 6) + 1 // 1-6 confirmations
        };
      });

      // Save new transactions
      const updatedTransactions = [...transactions, ...newTransactions];
      await databaseService.writeTransactions(updatedTransactions);

      res.status(201).json(newTransactions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to sync wallet' });
    }
  }

  // DELETE /wallets/:walletId - removes a wallet from the list
  async deleteWallet(req, res) {
    try {
      const { walletId } = req.params;
      const wallets = await databaseService.readWallets();
      const transactions = await databaseService.readTransactions();

      // Check if wallet exists
      const walletIndex = wallets.findIndex(w => w.id === walletId);
      if (walletIndex === -1) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      // Remove wallet
      wallets.splice(walletIndex, 1);
      await databaseService.writeWallets(wallets);

      // Remove associated transactions
      const filteredTransactions = transactions.filter(t => t.walletId !== walletId);
      await databaseService.writeTransactions(filteredTransactions);

      res.json({ message: 'Wallet deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete wallet' });
    }
  }
}

module.exports = new WalletController();
