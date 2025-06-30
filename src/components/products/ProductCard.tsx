// src/components/products/ProductCard.tsx
import React from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaToggleOn, 
  FaToggleOff,
  FaExclamationTriangle,
  FaWifi,
  FaClock
} from 'react-icons/fa';
import type { Product } from '../../types/products';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
  onView
}) => {
  const hasLowStock = product.variants.some(
    variant => variant.availableInventory <= variant.lowStockThreshold
  );

  const totalInventory = product.variants.reduce(
    (sum, variant) => sum + variant.inventory, 0
  );

  const averagePrice = product.variants.length > 0 
    ? product.variants.reduce((sum, variant) => sum + variant.price, 0) / product.variants.length
    : 0;

  let borderClass = '';
  if (!product.isActive) {
    borderClass = 'border-l-gray-400 opacity-60';
  } else if (hasLowStock) {
    borderClass = 'border-l-red-500';
  } else {
    borderClass = 'border-l-blue-500';
  }

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 transition-all duration-200 hover:shadow-lg ${borderClass}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {product.name}
              </h3>
              {hasLowStock && (
                <FaExclamationTriangle className="text-red-500 text-sm" title="Low Stock" />
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {product.category}
              </span>
              {product.provider && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {product.provider}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onToggleStatus(product._id!, product.isActive)}
            className={`p-2 rounded-full transition-colors ${
              product.isActive 
                ? 'text-green-600 hover:bg-green-100' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={product.isActive ? 'Active' : 'Inactive'}
          >
            {product.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
          </button>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {product.variants.length}
            </div>
            <div className="text-xs text-gray-600">Variants</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {totalInventory}
            </div>
            <div className="text-xs text-gray-600">Total Stock</div>
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-900">
            ${averagePrice.toFixed(2)}
            <span className="text-sm font-normal text-gray-600 ml-1">avg</span>
          </div>
        </div>

        {/* Mobile Bundle Info */}
        {product.category.includes('bundle') && (
          <div className="mb-4 space-y-2">
            {product.variants.slice(0, 2).map((variant) => (
              <div key={variant._id ?? variant.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {variant.network && <FaWifi className="text-blue-500" />}
                  <span className="text-gray-700">{variant.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  {variant.dataVolume && (
                    <span>{variant.dataVolume}GB</span>
                  )}
                  {variant.validity && (
                    <div className="flex items-center gap-1">
                      <FaClock size={12} />
                      <span>{variant.validity}d</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {product.variants.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{product.variants.length - 2} more variants
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(product)}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
              title="View Details"
            >
              <FaEye size={16} />
            </button>
            
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
              title="Edit Product"
            >
              <FaEdit size={16} />
            </button>
            
            <button
              onClick={() => onDelete(product._id!)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
              title="Delete Product"
            >
              <FaTrash size={16} />
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            {new Date(product.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
