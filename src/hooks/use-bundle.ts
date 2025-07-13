// src/hooks/use-bundle.ts
import { useContext } from 'react';
import { BundleContext } from '../contexts/bundle-context';

export const useBundle = () => {
  const context = useContext(BundleContext);
  
  if (!context) {
    throw new Error('useBundle must be used within a BundleProvider');
  }
  
  return context;
}; 