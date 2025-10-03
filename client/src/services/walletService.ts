import { API_ENDPOINTS, HTTP_METHODS, DEFAULT_CONFIG } from '@shared/constants';
import type { Wallet, Transaction, ApiResponse, HttpMethod, BitcoinAddress, WalletId } from '../types';

const BASE_URL: string = DEFAULT_CONFIG.API_BASE_URL;

class WalletService {
  /**
   * Generic API request handler
   */
  async request<T>(endpoint: string, method: HttpMethod = HTTP_METHODS.GET, body: any = null): Promise<T> {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch all wallets
   */
  async getAllWallets(): Promise<Wallet[]> {
    return this.request<Wallet[]>(API_ENDPOINTS.WALLETS);
  }

  /**
   * Create a new wallet
   */
  async createWallet(address: BitcoinAddress): Promise<Wallet[]> {
    return this.request<Wallet[]>(API_ENDPOINTS.CREATE_WALLET, HTTP_METHODS.POST, { address });
  }

  /**
   * Delete a wallet
   */
  async deleteWallet(walletId: WalletId): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(API_ENDPOINTS.DELETE_WALLET(walletId), HTTP_METHODS.DELETE);
  }

  /**
   * Sync wallet transactions
   */
  async syncWallet(walletId: WalletId): Promise<Transaction[]> {
    return this.request<Transaction[]>(API_ENDPOINTS.SYNC_WALLET(walletId), HTTP_METHODS.POST);
  }

  /**
   * Get wallet transactions
   */
  async getWalletTransactions(walletId: WalletId): Promise<Transaction[]> {
    return this.request<Transaction[]>(API_ENDPOINTS.WALLET_TRANSACTIONS(walletId));
  }
}

// Export singleton instance
export const walletService = new WalletService();
export default walletService;
