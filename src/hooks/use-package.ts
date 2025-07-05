import { useContext } from 'react';
import { PackageContext, type PackageContextType } from '../contexts/package-context';

export const usePackage = (): PackageContextType => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackage must be used within a PackageProvider');
  }
  return context;
};