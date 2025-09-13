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
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
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
