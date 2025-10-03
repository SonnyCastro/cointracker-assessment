import type { BitcoinAddress } from '../types';

/**
 * Utility functions for wallet operations
 */

// Import wallet icons
import coinbaseIcon from '../assets/coinbase.png';
import krakenIcon from '../assets/kraken.png';
import phantomIcon from '../assets/phantom.png';

interface ProviderInfo {
  name: string;
  icon: string;
  alt: string;
}

type ProviderName = 'Coinbase' | 'Kraken' | 'Phantom';

// Provider mapping with consistent data
const PROVIDER_MAP: Record<ProviderName, ProviderInfo> = {
  'Coinbase': {
    name: 'Coinbase',
    icon: coinbaseIcon,
    alt: 'Coinbase'
  },
  'Kraken': {
    name: 'Kraken',
    icon: krakenIcon,
    alt: 'Kraken'
  },
  'Phantom': {
    name: 'Phantom',
    icon: phantomIcon,
    alt: 'Phantom'
  }
};

/**
 * Format wallet address for display (truncate middle)
 */
export const formatWalletAddress = (address: string, startChars: number = 4, endChars: number = 4): string => {
  if (!address || address.length <= startChars + endChars) {
    return address;
  }

  const start = address.substring(0, startChars);
  const end = address.substring(address.length - endChars);
  return `${start}...${end}`;
};

/**
 * Get wallet provider name from address or name
 */
export const getWalletProvider = (name: string | undefined, address: string): string => {
  // If name is already a provider name, return it
  if (name && PROVIDER_MAP[name as ProviderName]) {
    return name;
  }

  // If it's a generic wallet name (like "Wallet 1377"), assign a random provider
  if (name && name.startsWith('Wallet ')) {
    const providers = Object.keys(PROVIDER_MAP) as ProviderName[];
    // Use address as seed for consistent provider assignment
    const hash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const providerIndex = Math.abs(hash) % providers.length;
    return providers[providerIndex];
  }

  // Default to generic wallet name
  return name || 'Wallet';
};

/**
 * Get wallet icon URL or fallback
 */
export const getWalletIcon = (iconURL: string | undefined, provider: string): string => {
  if (iconURL) {
    return iconURL;
  }

  return PROVIDER_MAP[provider as ProviderName]?.icon || coinbaseIcon;
};

/**
 * Get wallet provider alt text
 */
export const getWalletProviderAlt = (provider: string): string => {
  return PROVIDER_MAP[provider as ProviderName]?.alt || provider || 'Wallet';
};

/**
 * Get random wallet provider for new wallets
 */
export const getRandomWalletProvider = (): ProviderName => {
  const providers = Object.keys(PROVIDER_MAP) as ProviderName[];
  return providers[Math.floor(Math.random() * providers.length)];
};

/**
 * Validate Bitcoin address format (basic validation)
 */
export const isValidBitcoinAddress = (address: BitcoinAddress | string | null | undefined): boolean => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Basic Bitcoin address patterns
  const patterns = [
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy addresses
    /^bc1[a-z0-9]{39,59}$/, // Bech32 addresses
    /^bc1p[a-z0-9]{58}$/ // Bech32m addresses (Taproot)
  ];

  return patterns.some(pattern => pattern.test(address));
};
