/**
 * Utility functions for wallet operations
 */

// Import wallet icons
import coinbaseIcon from '../assets/coinbase.png'
import krakenIcon from '../assets/kraken.png'
import phantomIcon from '../assets/phantom.png'

// Provider mapping with consistent data
const PROVIDER_MAP = {
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
}

/**
 * Format wallet address for display (truncate middle)
 */
export const formatWalletAddress = (address, startChars = 4, endChars = 4) => {
  if (!address || address.length <= startChars + endChars) {
    return address
  }

  const start = address.substring(0, startChars)
  const end = address.substring(address.length - endChars)
  return `${start}...${end}`
}

/**
 * Get wallet provider name from address or name
 */
export const getWalletProvider = (name, address) => {
  // If name is already a provider name, return it
  if (PROVIDER_MAP[name]) {
    return name
  }

  // If it's a generic wallet name (like "Wallet 1377"), assign a random provider
  if (name && name.startsWith('Wallet ')) {
    const providers = Object.keys(PROVIDER_MAP)
    // Use address as seed for consistent provider assignment
    const hash = address.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    const providerIndex = Math.abs(hash) % providers.length
    return providers[providerIndex]
  }

  // Default to generic wallet name
  return name || 'Wallet'
}

/**
 * Get wallet icon URL or fallback
 */
export const getWalletIcon = (iconURL, provider) => {
  if (iconURL) {
    return iconURL
  }

  return PROVIDER_MAP[provider]?.icon || coinbaseIcon
}

/**
 * Get wallet provider alt text
 */
export const getWalletProviderAlt = (provider) => {
  return PROVIDER_MAP[provider]?.alt || provider || 'Wallet'
}

/**
 * Get random wallet provider for new wallets
 */
export const getRandomWalletProvider = () => {
  const providers = Object.keys(PROVIDER_MAP)
  return providers[Math.floor(Math.random() * providers.length)]
}

/**
 * Validate Bitcoin address format (basic validation)
 */
export const isValidBitcoinAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false
  }

  // Basic Bitcoin address patterns
  const patterns = [
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy addresses
    /^bc1[a-z0-9]{39,59}$/, // Bech32 addresses
    /^bc1p[a-z0-9]{58}$/ // Bech32m addresses (Taproot)
  ]

  return patterns.some(pattern => pattern.test(address))
}
