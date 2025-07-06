// src/providers/app-provider.tsx
import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { UserProvider } from "../contexts/UserContext";
import { OrderProvider } from "../contexts/OrderContext";
import { StorefrontProvider } from "../contexts/StorefrontContext";
import { PackageProvider } from "../contexts/package-context-value.tsx";
import { ProviderProvider } from "../contexts/provider-provider";
import { WalletProvider } from "../contexts/wallet-provider";

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <WalletProvider>
          <ProviderProvider>
            <PackageProvider>
              <StorefrontProvider>
                <OrderProvider>{children}</OrderProvider>
              </StorefrontProvider>
            </PackageProvider>
          </ProviderProvider>
        </WalletProvider>
      </UserProvider>
    </AuthProvider>
  );
};
