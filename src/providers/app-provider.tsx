// src/providers/app-provider.tsx
import React from "react";
import { AuthProvider } from "../contexts/AuthContext";
import { UserProvider } from "../contexts/UserContext";
import { OrderProvider } from "../contexts/OrderContext";
import { StorefrontProvider } from "../contexts/StorefrontContext";
import { PackageProvider } from "../contexts/package-context-value.tsx";
import { ProviderProvider } from "../contexts/provider-provider";
import { WalletProvider } from "../contexts/wallet-provider";
import {
  SiteStatusProvider,
  SiteStatusWebSocketConnector,
} from "../contexts/site-status-context";
import { NotificationProvider } from "../contexts/NotificationContext";

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <SiteStatusProvider>
      <AuthProvider>
        <SiteStatusWebSocketConnector />
        <UserProvider>
          <WalletProvider>
            <NotificationProvider>
              <ProviderProvider>
                <PackageProvider>
                  <StorefrontProvider>
                    <OrderProvider>{children}</OrderProvider>
                  </StorefrontProvider>
                </PackageProvider>
              </ProviderProvider>
            </NotificationProvider>
          </WalletProvider>
        </UserProvider>
      </AuthProvider>
    </SiteStatusProvider>
  );
};
