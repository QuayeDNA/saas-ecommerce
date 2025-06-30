// src/contexts/AppProvider.tsx
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ProductProvider } from '../contexts/ProductContext';
import { OrderProvider } from '../contexts/OrderContext';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          {children}
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
};
