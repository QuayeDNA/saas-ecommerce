import { createContext } from 'react';
import type { WalletTransaction } from '../types/wallet';

export interface WalletContextType {
  walletBalance: number;
  recentTransactions: WalletTransaction[];
  isLoading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);
