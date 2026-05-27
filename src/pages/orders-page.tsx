// src/pages/OrderManagementPage.tsx
import React from "react";
import { useAuth } from "../hooks/use-auth";
import { OrderProvider } from "../contexts/OrderContext";
import { PackageProvider } from "../contexts/package-context-value";
import { UnifiedOrderList } from "../components/orders/UnifiedOrderList";
import {
  isAdminUser,
  canAccessBusinessFeatures,
} from "../utils/userTypeHelpers";

export const OrderManagementPage: React.FC = () => {
  const { authState } = useAuth();
  const isAdmin = isAdminUser(authState.user?.userType || "");
  const isAgent = canAccessBusinessFeatures(authState.user?.userType || "");

  return (
    <OrderProvider>
      <PackageProvider>
        <div className="min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <UnifiedOrderList
              isAdmin={isAdmin}
              isAgent={isAgent}
              userType={authState.user?.userType}
            />
          </div>
        </div>
      </PackageProvider>
    </OrderProvider>
  );
};
