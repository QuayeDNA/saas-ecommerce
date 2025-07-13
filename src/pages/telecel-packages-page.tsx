import { useState } from 'react';
import { ProviderPackageDisplay } from '../components/products/ProviderPackageDisplay';
import { CreateOrderModal } from '../components/orders/CreateOrderModal';

export const TelecelPackagesPage = () => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderType, setOrderType] = useState<'single' | 'bulk'>('single');

  return (
    <div className="space-y-6">
      <div className="flex gap-3 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => { setOrderType('single'); setShowOrderModal(true); }}
        >
          Single Order
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => { setOrderType('bulk'); setShowOrderModal(true); }}
        >
          Bulk Order
        </button>
      </div>
      <ProviderPackageDisplay provider="TELECEL" />
      {showOrderModal && (
        <CreateOrderModal
          type={orderType}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => setShowOrderModal(false)}
          providerPreset="TELECEL"
        />
      )}
    </div>
  );
}; 