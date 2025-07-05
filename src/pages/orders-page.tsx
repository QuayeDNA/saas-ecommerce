// src/pages/OrderManagementPage.tsx
import React from 'react';
import { OrderProvider } from '../contexts/OrderContext';
import { PackageProvider } from '../contexts/package-context-value';
import { OrderList } from '../components/orders/OrderList';

export const OrderManagementPage: React.FC = () => {
  return (
    <OrderProvider>
      <PackageProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <OrderList />
          </div>
        </div>
      </PackageProvider>
    </OrderProvider>
  );
};
