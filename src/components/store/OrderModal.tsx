// src/components/storefront/OrderModal.tsx
import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaPhone,
  FaShoppingCart,
  FaTrash,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';
import type { Storefront, StorefrontOrder } from '../../types/storefront';
import type { Product, ProductVariant } from '../../types/products';
import { storefrontService } from '../../services/storefront.service';

interface OrderModalProps {
  storefront: Storefront;
  selectedProducts: Array<{
    product: Product;
    variant: ProductVariant;
    quantity: number;
    customerPhone?: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  storefront,
  selectedProducts,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>('');

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    // This would typically update the parent component's state
    // For now, we'll just ensure minimum quantity of 1
    if (quantity < 1) return;
    selectedProducts[index].quantity = quantity;
  };

  const removeProduct = (index: number) => {
    selectedProducts.splice(index, 1);
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.variant.price * item.quantity);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: storefront.currency || 'USD'
    }).format(price);
  };

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      setError('Customer name is required');
      return false;
    }
    if (!customerInfo.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^\+?[\d\s-()]{10,}$/.test(customerInfo.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (customerInfo.email && !/\S+@\S+\.\S+/.test(customerInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (selectedProducts.length === 0) {
      setError('Please add at least one product to your order');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const orderData: StorefrontOrder = {
        orderNumber: '', // Placeholder, will be set by backend
        customerInfo,
        items: selectedProducts.map(item => ({
          productId: item.product._id!,
          variantId: item.variant._id!,
          quantity: item.quantity,
          customerPhone: item.customerPhone ?? customerInfo.phone,
          bundleSize: item.variant.bundleType ? {
            value: item.variant.dataVolume ?? 1,
            unit: 'GB' as const
          } : undefined
        }))
      };

      const response = await storefrontService.createStorefrontOrder(storefront.slug, orderData);
      
      setOrderNumber(response.orderNumber);
      setSuccess(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onSuccess();
      }, 3000);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message ?? 'Failed to create order');
      } else {
        setError('Failed to create order');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <FaCheck className="text-green-600 text-2xl" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          
          <p className="text-gray-600 mb-4">
            Your order <strong>#{orderNumber}</strong> has been received and will be processed soon.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              The store owner will contact you shortly to confirm your order.
            </p>
          </div>
          
          <button
            onClick={onSuccess}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Complete Your Order
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUser className="inline mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': storefront.theme.primaryColor } as React.CSSProperties}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-1" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': storefront.theme.primaryColor } as React.CSSProperties}
                  placeholder="+233123456789"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-1" />
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': storefront.theme.primaryColor } as React.CSSProperties}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {selectedProducts.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.product.name} - {item.variant.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      {item.variant.network && (
                        <span className="flex items-center gap-1">
                          Network: {item.variant.network}
                        </span>
                      )}
                      {item.variant.dataVolume && (
                        <span>{item.variant.dataVolume}GB</span>
                      )}
                      {item.variant.validity && (
                        <span>{item.variant.validity} days</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {formatPrice(item.variant.price)} each
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatPrice(item.variant.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span style={{ color: storefront.theme.primaryColor }}>
                  {formatPrice(calculateTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading || selectedProducts.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: storefront.theme.accentColor }}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaShoppingCart />
                  Place Order ({formatPrice(calculateTotal())})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
