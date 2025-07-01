// src/components/products/ProductCard.tsx
/**
 * Modern Product Card Component
 * 
 * Features:
 * - Mobile-first responsive design with fluid layout
 * - Consistent visual indicators for status and inventory
 * - Accessibility-focused interactive elements
 * - Clean, minimalist UI with proper spacing and hierarchy
 * - Hover effects and micro-interactions for enhanced UX
 * - Optimized rendering with memoization where appropriate
 */

import React from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaToggleOn, 
  FaToggleOff,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
  FaStar
} from 'react-icons/fa';
import type { Product } from '../../types/products';
import { Card, Button } from '../../design-system';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onView: (product: Product) => void;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  showBulkActions?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
  selected,
  onSelect,
  showBulkActions = false,
}) => {
  const [showDetails, setShowDetails] = React.useState(false);
  
  // Calculate product stats with memoization for performance
  const productStats = React.useMemo(() => {
    // Check if any variant has stock below threshold
    const hasLowStock = product.variants.some(
      variant => variant.availableInventory <= variant.lowStockThreshold
    );

    // Calculate total inventory across all variants
    const totalInventory = product.variants.reduce(
      (sum, variant) => sum + variant.availableInventory, 0
    );
    
    // Get total sales count
    const totalSales = product.salesCount || 0;

    // Calculate average price across variants
    const averagePrice = product.variants.length > 0 
      ? product.variants.reduce((sum, variant) => sum + variant.price, 0) / product.variants.length
      : 0;

    // Calculate stock status percentage for progress bar
    const avgStockPercentage = product.variants.length > 0
      ? product.variants.reduce((sum, variant) => {
          const max = variant.inventory;
          const current = variant.availableInventory;
          return sum + (max > 0 ? (current / max * 100) : 0);
        }, 0) / product.variants.length
      : 0;

    return {
      hasLowStock,
      totalInventory,
      totalSales,
      averagePrice,
      avgStockPercentage
    };
  }, [product]);
    
  // Format category name for display
  const formatCategoryName = (category: string): string => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get badge color based on product category
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'data-bundle':
        return 'bg-blue-100 text-blue-800'; 
      case 'voice-bundle':
        return 'bg-indigo-100 text-indigo-800';
      case 'combo-bundle':
        return 'bg-green-100 text-green-800';
      case 'sms-bundle':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Extract image URL for product
  const primaryImage = React.useMemo(() => {
    // Try to find a primary image from any variant
    for (const variant of product.variants) {
      const primaryImg = variant.images.find(img => img.isPrimary);
      if (primaryImg) return primaryImg.url;
    }
    // If no primary image, use the first image available
    for (const variant of product.variants) {
      if (variant.images.length > 0) return variant.images[0].url;
    }
    // Fallback to placeholder
    return 'https://via.placeholder.com/300x200?text=No+Image';
  }, [product.variants]);

  return (
    <Card 
      className={`w-full overflow-hidden transition-all duration-300 hover:shadow-lg ${!product.isActive ? 'opacity-80' : ''} ${selected ? 'ring-2 ring-primary-500' : ''}`}
      variant="elevated"
    >
      {/* Product Status Indicator */}
      <div className={`h-1.5 w-full ${productStats.hasLowStock ? 'bg-red-500' : product.isActive ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
      
      <div className="p-4 sm:p-5">
        {/* Header with Checkbox and Status Toggle */}
        <div className="flex items-center justify-between mb-4">
          {showBulkActions && (
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => onSelect(e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary-600 transition duration-150 rounded border-gray-300 focus:ring-2 focus:ring-primary-500"
                aria-label={`Select ${product.name}`}
              />
              <span className="ml-2 text-xs text-gray-600">Select</span>
            </label>
          )}
          {!showBulkActions && <div className="w-4"></div>}
          
          <button
            onClick={() => onToggleStatus(product._id || '', product.isActive)}
            className={`text-sm flex items-center px-2.5 py-1 rounded-full transition-all duration-200 ${
              product.isActive 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            aria-label={product.isActive ? 'Deactivate product' : 'Activate product'}
          >
            {product.isActive ? (
              <>
                <FaToggleOn className="mr-1.5" size={14} />
                <span>Active</span>
              </>
            ) : (
              <>
                <FaToggleOff className="mr-1.5" size={14} />
                <span>Inactive</span>
              </>
            )}
          </button>
        </div>
        
        <div className="sm:flex gap-4">
          {/* Product Image (only visible on sm and up) */}
          <div className="hidden sm:block flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
            {primaryImage && (
              <img 
                src={primaryImage} 
                alt={product.name} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  // Fallback on image load error
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
            )}
          </div>
          
          <div className="flex-1">
            {/* Product Title and Category */}
            <div className="mb-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 text-lg mb-1.5 line-clamp-2">{product.name}</h3>
                
                <div className="ml-2 flex-shrink-0">
                  {productStats.hasLowStock && (
                    <div 
                      className="text-amber-500" 
                      title="Low stock alert"
                      aria-label="Low stock alert"
                    >
                      <FaExclamationTriangle size={14} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                  {formatCategoryName(product.category)}
                </span>
                
                {product.provider && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {product.provider}
                  </span>
                )}
              </div>
            </div>
            
            {/* Description - Mobile only */}
            {product.description && (
              <div className="sm:hidden mb-3 text-sm text-gray-600 line-clamp-2">
                {product.description}
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 my-4">
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <div className="text-lg font-semibold text-gray-800">
              {formatCurrency(productStats.averagePrice)}
            </div>
            <div className="text-xs text-gray-500">Price</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <div className="text-lg font-semibold text-gray-800">
              {productStats.totalInventory}
            </div>
            <div className="text-xs text-gray-500">Stock</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <div className="text-lg font-semibold text-gray-800">
              {product.variants.length}
            </div>
            <div className="text-xs text-gray-500">Variants</div>
          </div>
        </div>
        
        {/* Stock Status Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-600">Stock Status</span>
            <span className={`px-1.5 py-0.5 rounded-full text-white text-xs font-medium
              ${productStats.avgStockPercentage <= 25 ? 'bg-red-500' : 
                productStats.avgStockPercentage <= 50 ? 'bg-amber-500' : 
                'bg-green-500'}`}
            >
              {productStats.avgStockPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                productStats.avgStockPercentage <= 25 ? 'bg-red-500' : 
                productStats.avgStockPercentage <= 50 ? 'bg-amber-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.max(productStats.avgStockPercentage, 5)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Expandable Variants Section */}
        {product.variants.length > 0 && (
          <div className="mb-4">
            <button 
              className="w-full flex items-center justify-between py-2.5 px-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700 transition-colors"
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
              aria-controls={`variants-${product._id}`}
            >
              <span>Product Variants ({product.variants.length})</span>
              {showDetails ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>
            
            {showDetails && (
              <div 
                id={`variants-${product._id}`}
                className="mt-3 space-y-2 text-sm border-t border-gray-100 pt-3"
              >
                {product.variants.map((variant) => (
                  <div 
                    key={variant._id || variant.sku}
                    className="p-3 border border-gray-200 rounded-md flex justify-between items-center hover:border-gray-300 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-xs text-gray-500">SKU: {variant.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(variant.price)}</div>
                      <div className="text-xs text-gray-500">
                        Stock: {variant.availableInventory}/{variant.inventory}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(product)}
              title="View Details"
            >
              <FaEye size={14} className="mr-1.5" /> View
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(product)}
              title="Edit Product"
            >
              <FaEdit size={14} className="mr-1.5" /> Edit
            </Button>
          </div>
          
          <Button
            variant="ghost"
            colorScheme="error"
            size="sm"
            onClick={() => onDelete(product._id || '')}
            title="Delete Product"
            aria-label="Delete product"
          >
            <FaTrash size={14} />
          </Button>
        </div>
        
        {/* Footer with Metadata */}
        <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
          <div>Updated: {new Date(product.updatedAt).toLocaleDateString()}</div>
          {productStats.totalSales > 0 && (
            <div className="flex items-center">
              <FaStar className="text-amber-400 mr-1" size={12} />
              <span>{productStats.totalSales} sold</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};