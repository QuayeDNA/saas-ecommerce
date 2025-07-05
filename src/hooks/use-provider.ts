// src/hooks/use-provider.ts
import { useContext } from 'react';
import { ProviderContext, type ProviderContextType } from '../contexts/provider-context';

export const useProvider = (): ProviderContextType => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
};
