// src/pages/superadmin/orders.tsx
import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import { OrderProvider } from '../../contexts/OrderContext';
import { PackageProvider } from '../../contexts/package-context-value';
import { UnifiedOrderList } from '../../components/orders/UnifiedOrderList';

export default function SuperAdminOrdersPage() {
  const { authState } = useAuth();
  const isAdmin = true; // Super admin is always an admin
  const isAgent = false; // Super admin is not an agent

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
} 