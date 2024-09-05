// Pinata Configuration
export const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
export const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

// Wagmi and Chain Configuration
import { createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';
import { metaMask } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask()
  ],
  transports: {
    [sepolia.id]: http(),
  },
});

// making buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || require('buffer').Buffer;
}
