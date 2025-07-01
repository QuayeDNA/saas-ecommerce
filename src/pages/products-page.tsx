// src/pages/products-page.tsx
import React, { useState } from 'react';
import { ProductProvider } from '../contexts/ProductContext';
import { ProductList } from '../components/products/ProductList';
import { Container, Section, SectionHeader } from '../design-system';
import { FaBox, FaChartLine, FaExclamationTriangle, FaCog } from 'react-icons/fa';

// Define the tabs for product management
const PRODUCT_TABS = [
  { id: 'products', label: 'Products', icon: <FaBox className="mr-2" /> },
  { id: 'analytics', label: 'Analytics', icon: <FaChartLine className="mr-2" /> },
  { id: 'alerts', label: 'Alerts', icon: <FaExclamationTriangle className="mr-2" /> },
  { id: 'settings', label: 'Settings', icon: <FaCog className="mr-2" /> }
];

export const ProductManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <ProductProvider>
      <Container className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <Section className="py-6">
          <SectionHeader 
            title="Product Management" 
            subtitle="Manage your product catalog, track analytics, and handle inventory" 
          />
          
          <div className="mt-6 bg-white rounded-lg shadow overflow-x-auto">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {PRODUCT_TABS.map(tab => (
                  <button
                    key={tab.id}
                    className={`flex items-center py-4 px-6 font-medium text-sm border-b-2 
                      ${activeTab === tab.id 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => handleTabChange(tab.id)}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 md:p-6">
              {activeTab === 'products' && <ProductList />}
              
              {activeTab === 'analytics' && (
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-lg font-medium">Product Analytics</h3>
                  <p className="text-gray-500">Analytics dashboard for product performance tracking.</p>
                  <div className="mt-4 p-6 bg-gray-50 rounded text-center">
                    Product analytics coming soon
                  </div>
                </div>
              )}
              
              {activeTab === 'alerts' && (
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-lg font-medium">Inventory Alerts</h3>
                  <p className="text-gray-500">Low stock notifications and inventory alerts.</p>
                  <div className="mt-4 p-6 bg-gray-50 rounded text-center">
                    Inventory alerts coming soon
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div className="bg-white p-6 rounded-lg">
                  <h3 className="text-lg font-medium">Product Settings</h3>
                  <p className="text-gray-500">Configure product management preferences.</p>
                  <div className="mt-4 p-6 bg-gray-50 rounded text-center">
                    Product settings coming soon
                  </div>
                </div>
              )}
            </div>
          </div>
        </Section>
      </Container>
    </ProductProvider>
  );
};
