import { API_ENDPOINTS, HTTP_METHODS, DEFAULT_CONFIG } from '../../../shared/constants'

const BASE_URL = DEFAULT_CONFIG.API_BASE_URL

class WalletService {
  /**
   * Generic API request handler
   */
  async request(endpoint, method = HTTP_METHODS.GET, body = null) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Fetch all wallets
   * @returns {Promise<Array>} Array of wallet objects
   */
  async getAllWallets() {
    return this.request(API_ENDPOINTS.WALLETS)
  }

  /**
   * Create a new wallet
   * @param {string} address - Bitcoin address
   * @returns {Promise<Array>} Updated array of wallets
   */
  async createWallet(address) {
    return this.request(API_ENDPOINTS.CREATE_WALLET, HTTP_METHODS.POST, { address })
  }

  /**
   * Delete a wallet
   * @param {string} walletId - Wallet ID
   * @returns {Promise<Object>} Success message
   */
  async deleteWallet(walletId) {
    return this.request(API_ENDPOINTS.DELETE_WALLET(walletId), HTTP_METHODS.DELETE)
  }

  /**
   * Sync wallet transactions
   * @param {string} walletId - Wallet ID
   * @returns {Promise<Array>} New transactions
   */
  async syncWallet(walletId) {
    return this.request(API_ENDPOINTS.SYNC_WALLET(walletId), HTTP_METHODS.POST)
  }

  /**
   * Get wallet transactions
   * @param {string} walletId - Wallet ID
   * @returns {Promise<Array>} Array of transactions
   */
  async getWalletTransactions(walletId) {
    return this.request(API_ENDPOINTS.WALLET_TRANSACTIONS(walletId))
  }
}

// Export singleton instance
export const walletService = new WalletService()
export default walletService
