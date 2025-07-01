// src/contexts/AppProvider.tsx
import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { ProductProvider } from "../contexts/ProductContext";
import { OrderProvider } from "../contexts/OrderContext";
import { StorefrontProvider } from "../contexts/StorefrontContext";

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <StorefrontProvider>
        <ProductProvider>
          <OrderProvider>{children}</OrderProvider>
        </ProductProvider>
      </StorefrontProvider>
    </AuthProvider>
  );
};
