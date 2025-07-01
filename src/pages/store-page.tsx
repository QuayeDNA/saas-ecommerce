// src/pages/StorefrontManagementPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  FaStore, 
  FaEdit, 
  FaToggleOn, 
  FaToggleOff,
  FaPlus,
  FaExternalLinkAlt,
  FaChartLine,
  FaCopy
} from 'react-icons/fa';
import { useStorefront } from '../contexts/StorefrontContext';
import { StorefrontModal } from '../components/store/StorefrontModal';
import { StorefrontAnalytics } from '../components/store/StorefrontAnalytics';

export const StorefrontManagementPage: React.FC = () => {
  const {
    storefront,
    loading,
    error,
    fetchStorefront,
    toggleStatus,
    clearError
  } = useStorefront();

  const [showModal, setShowModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchStorefront();
  }, [fetchStorefront]);

  const handleCopyUrl = async () => {
    if (storefront?.url) {
      await navigator.clipboard.writeText(storefront.url);
      // You can add a toast notification here
    }
  };

  const handleViewStorefront = () => {
    if (storefront?.url) {
      window.open(storefront.url, '_blank');
    }
  };

  if (loading && !storefront) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading storefront...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Storefront Management</h1>
            <p className="text-gray-600 mt-1">
              Create and manage your public storefront
            </p>
          </div>
          
          {storefront ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowAnalytics(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FaChartLine size={16} />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              
              <button
                onClick={handleViewStorefront}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaExternalLinkAlt size={16} />
                <span className="hidden sm:inline">View Store</span>
              </button>
              
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaEdit size={16} />
                <span className="hidden sm:inline">Edit</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus size={16} />
              Create Storefront
            </button>
          )}
        </div>

        {storefront ? (
          <div className="space-y-6">
            {/* Storefront Overview */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaStore className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {storefront.name}
                        </h2>
                        <p className="text-gray-600">{storefront.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                          {storefront.analytics.totalViews}
                        </div>
                        <div className="text-sm text-gray-600">Total Views</div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {storefront.analytics.totalOrders}
                        </div>
                        <div className="text-sm text-gray-600">Total Orders</div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {storefront.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <div className="text-sm text-gray-600">Status</div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {storefront.isPublic ? 'Public' : 'Private'}
                        </div>
                        <div className="text-sm text-gray-600">Visibility</div>
                      </div>
                    </div>
                    
                    {/* Storefront URL */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h3 className="font-medium text-blue-900 mb-1">Storefront URL</h3>
                          <p className="text-blue-700 font-mono text-sm break-all">
                            {storefront.url}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopyUrl}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FaCopy size={14} />
                            Copy
                          </button>
                          
                          <button
                            onClick={handleViewStorefront}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <FaExternalLinkAlt size={14} />
                            Visit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={toggleStatus}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        storefront.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {storefront.isActive ? (
                        <>
                          <FaToggleOn size={20} />
                          Active
                        </>
                      ) : (
                        <>
                          <FaToggleOff size={20} />
                          Inactive
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
              >
                <FaEdit className="mx-auto text-2xl text-blue-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Edit Storefront</h3>
                <p className="text-sm text-gray-600">Update design and settings</p>
              </button>
              
              <button
                onClick={() => setShowAnalytics(true)}
                className="p-6 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
              >
                <FaChartLine className="mx-auto text-2xl text-purple-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">View Analytics</h3>
                <p className="text-sm text-gray-600">Track performance metrics</p>
              </button>
              
              <button
                onClick={handleViewStorefront}
                className="p-6 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
              >
                <FaExternalLinkAlt className="mx-auto text-2xl text-green-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Preview Store</h3>
                <p className="text-sm text-gray-600">See how customers view it</p>
              </button>
              
              <button
                onClick={handleCopyUrl}
                className="p-6 bg-white border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
              >
                <FaCopy className="mx-auto text-2xl text-orange-600 mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">Share URL</h3>
                <p className="text-sm text-gray-600">Copy storefront link</p>
              </button>
            </div>
          </div>
        ) : (
          /* No Storefront State */
          <div className="text-center py-12">
            <div className="mx-auto bg-gray-100 rounded-full p-6 w-24 h-24 flex items-center justify-center mb-6">
              <FaStore className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Storefront Created
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your public storefront to start selling your products online. 
              Customers can browse and order directly from your store.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus size={16} />
              Create Your Storefront
            </button>
          </div>
        )}

        {/* Modals */}
        {showModal && (
          <StorefrontModal
            storefront={storefront}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              fetchStorefront();
            }}
          />
        )}

        {showAnalytics && (
          <StorefrontAnalytics
            isOpen={showAnalytics}
            onClose={() => setShowAnalytics(false)}
          />
        )}
      </div>
    </div>
  );
};
