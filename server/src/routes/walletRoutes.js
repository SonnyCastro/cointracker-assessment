const express = require('express');
const walletController = require('../controllers/walletController');

const router = express.Router();

// GET /wallets - returns a list of available wallets
router.get('/', walletController.getAllWallets);

// POST /wallets - adds a new wallet to the list and returns the entire list
router.post('/', walletController.createWallet);

// POST /wallets/:walletId/sync - appends 1-3 new transactions to the wallet
router.post('/:walletId/sync', walletController.syncWallet);

// GET /wallets/:walletId - returns a list of wallet transactions
router.get('/:walletId', walletController.getWalletTransactions);

// DELETE /wallets/:walletId - removes a wallet from the list
router.delete('/:walletId', walletController.deleteWallet);

module.exports = router;
