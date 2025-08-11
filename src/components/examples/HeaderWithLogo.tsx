import React from 'react';
import { BryteLinksSvgLogoCompact } from '../common';

/**
 * Example of integrating the BryteLinks logo into the existing header component
 * This shows how to replace or add the logo to your current navigation
 */
export const HeaderWithLogo: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <BryteLinksSvgLogoCompact 
              width={160} 
              height={45} 
              className="hover:opacity-80 transition-opacity cursor-pointer" 
            />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="/dashboard" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </a>
            <a href="/orders" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Orders
            </a>
            <a href="/packages" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Packages
            </a>
            <a href="/analytics" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Analytics
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
