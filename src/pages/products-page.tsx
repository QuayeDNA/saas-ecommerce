// src/pages/ProductManagementPage.tsx
import React from 'react';
import { ProductProvider } from '../contexts/ProductContext';
import { ProductList } from '../components/products/ProductList';

export const ProductManagementPage: React.FC = () => {
  return (
    <ProductProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductList />
        </div>
      </div>
    </ProductProvider>
  );
};
