// src/components/storefront/PublicProductCard.tsx
import React, { useState } from 'react';
import { 
  FaShoppingCart, 
  FaWifi, 
  FaClock, 
  FaPhone,
  FaTag,
  FaCheck,
  FaExclamationCircle
} from 'react-icons/fa';
import type{ Product } from '../../types/products';
import type{ Storefront } from '../../types/storefront';

interface PublicProductCardProps {
  product: Product;
  storefront: Storefront;
  onAddToCart: (product: Product, variant: Product['variants'][number], customerPhone?: string) => void;
}

export const PublicProductCard: React.FC<PublicProductCardProps> = ({
  product,
  storefront,
  onAddToCart
}) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const handleAddToCart = () => {
    if (selectedVariant.bundleType && !customerPhone) {
      setShowPhoneInput(true);
      return;
    }
    
    onAddToCart(product, selectedVariant, customerPhone);
    setShowPhoneInput(false);
    setCustomerPhone('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: storefront.currency || 'USD'
    }).format(price);
  };

  const getNetworkColor = (network: string) => {
    switch (network?.toLowerCase()) {
      case 'mtn': return 'bg-yellow-100 text-yellow-800';
      case 'vodafone': return 'bg-red-100 text-red-800';
      case 'airteltigo': return 'bg-blue-100 text-blue-800';
      case 'glo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOutOfStock = selectedVariant.inventory <= 0;
  const isLowStock = selectedVariant.inventory <= selectedVariant.lowStockThreshold && selectedVariant.inventory > 0;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg overflow-hidden ${
        storefront.theme.layout === 'list' ? 'flex' : ''
      }`}
      style={{ borderColor: storefront.theme.primaryColor + '20' }}
    >
      {/* Product Image */}
      {selectedVariant.images && selectedVariant.images.length > 0 && (
        <div className={`${storefront.theme.layout === 'list' ? 'w-48 flex-shrink-0' : 'h-48'} overflow-hidden`}>
          <img 
            src={selectedVariant.images.find(img => img.isPrimary)?.url || selectedVariant.images[0].url}
            alt={selectedVariant.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 sm:p-6 flex-1">
        {/* Product Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {product.name}
            </h3>
            
            {selectedVariant.network && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getNetworkColor(selectedVariant.network)}`}>
                {selectedVariant.network}
              </span>
            )}
          </div>
          
          {product.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Variant Selection */}
        {product.variants.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Option:
            </label>
            <select
              value={selectedVariant._id}
              onChange={(e) => {
                const variant = product.variants.find(v => v._id === e.target.value);
                if (variant) setSelectedVariant(variant);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-sm"
              style={{ '--tw-ring-color': storefront.theme.primaryColor } as React.CSSProperties}
            >
              {product.variants.map((variant) => (
                <option key={variant._id} value={variant._id}>
                  {variant.name} - {formatPrice(variant.price)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Bundle Details */}
        {selectedVariant.bundleType && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {selectedVariant.dataVolume && (
                <div className="flex items-center gap-1">
                  <FaWifi className="text-blue-500" />
                  <span>{selectedVariant.dataVolume}GB</span>
                </div>
              )}
              
              {selectedVariant.validity && (
                <div className="flex items-center gap-1">
                  <FaClock className="text-green-500" />
                  <span>{selectedVariant.validity} days</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Phone Input for Bundles */}
        {showPhoneInput && selectedVariant.bundleType && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaPhone className="inline mr-1" />
              Customer Phone Number:
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+233123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': storefront.theme.primaryColor } as React.CSSProperties}
            />
          </div>
        )}

        {/* Price and Stock */}
        <div className="mb-4">
          {storefront.features.showPrices && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold" style={{ color: storefront.theme.primaryColor }}>
                {formatPrice(selectedVariant.price)}
              </span>
              
              {storefront.features.showInventory && (
                <div className="text-sm">
                  {isOutOfStock ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="text-orange-600 flex items-center gap-1">
                      <FaExclamationCircle />
                      Low Stock ({selectedVariant.inventory} left)
                    </span>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1">
                      <FaCheck />
                      In Stock ({selectedVariant.inventory})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full"
                  style={{ 
                    backgroundColor: storefront.theme.accentColor + '20',
                    color: storefront.theme.accentColor
                  }}
                >
                  <FaTag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        {storefront.features.allowOrders && (
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              isOutOfStock
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'text-white hover:opacity-90'
            }`}
            style={{ 
              backgroundColor: isOutOfStock ? undefined : storefront.theme.accentColor 
            }}
          >
            <FaShoppingCart size={16} />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        )}

        {/* WhatsApp Order Button */}
        {storefront.features.enableWhatsAppOrders && storefront.contactInfo.socialLinks?.whatsapp && (
          <a
            href={`https://wa.me/${storefront.contactInfo.socialLinks.whatsapp}?text=Hi! I'm interested in ${product.name} - ${selectedVariant.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaPhone size={14} />
            Order via WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};
