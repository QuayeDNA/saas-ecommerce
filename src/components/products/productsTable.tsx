// src/components/products/productsTable.tsx
import React from 'react';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaToggleOn, 
  FaToggleOff,
  FaExclamationTriangle,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';
import type { Product } from '../../types/products';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  Button
} from '../../design-system';

// Sortable header component extracted outside of the main component
interface SortableHeaderProps {
  label: string;
  field: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label, 
  field,
  sortField,
  sortDirection,
  onSort
}) => (
  <button 
    className="flex items-center cursor-pointer w-full text-left focus:outline-none"
    onClick={() => onSort(field)}
    aria-label={`Sort by ${label}`}
    type="button"
  >
    <span>{label}</span>
    {sortField === field && (
      <span className="ml-1">
        {sortDirection === 'asc' ? <FaSortAmountUp size={12} /> : <FaSortAmountDown size={12} />}
      </span>
    )}
  </button>
);

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onView: (product: Product) => void;
  selectedProducts: string[];
  onSelectProduct: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  showBulkActions?: boolean;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  showBulkActions = false,
  sortField,
  sortDirection,
  onSort
}) => {
  // Check if all products are selected
  const allSelected = products.length > 0 && selectedProducts.length === products.length;

  return (
    <div className="overflow-x-auto">
      <Table variant="striped" size="md" fullWidth stickyHeader>
        <TableHeader>
          <TableRow>
            {showBulkActions && (
              <TableCell className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </TableCell>
            )}
            <TableCell className="w-10">#</TableCell>
            <TableCell>
              <SortableHeader 
                label="Product Name" 
                field="name" 
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            </TableCell>
            <TableCell>
              <SortableHeader 
                label="Category" 
                field="category"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            </TableCell>
            <TableCell>
              <SortableHeader 
                label="Price" 
                field="variants.price"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            </TableCell>
            <TableCell>
              <SortableHeader 
                label="Inventory" 
                field="variants.inventory"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            </TableCell>
            <TableCell>
              <SortableHeader 
                label="Status" 
                field="isActive"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            </TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const isSelected = selectedProducts.includes(product._id ?? '');
            
            const hasLowStock = product.variants.some(
              variant => variant.availableInventory <= variant.lowStockThreshold
            );
            
            const totalInventory = product.variants.reduce(
              (sum, variant) => sum + variant.availableInventory, 0
            );
            
            const averagePrice = product.variants.length > 0 
              ? product.variants.reduce((sum, variant) => sum + variant.price, 0) / product.variants.length
              : 0;
              
            return (
              <TableRow 
                key={product._id} 
                isSelected={isSelected}
                isHoverable
                className={!product.isActive ? 'opacity-60' : ''}
              >
                {showBulkActions && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onSelectProduct(product._id ?? '', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </TableCell>
                )}
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{product.name}</div>
                  {product.provider && (
                    <div className="text-xs text-gray-500">{product.provider}</div>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
                    {formatCategoryName(product.category)}
                  </span>
                </TableCell>
                <TableCell>
                  {product.variants.length > 1 ? (
                    <span>
                      {formatCurrency(averagePrice)} <span className="text-xs text-gray-500">avg</span>
                    </span>
                  ) : (
                    formatCurrency(product.variants[0]?.price || 0)
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {totalInventory}
                    {hasLowStock && (
                      <FaExclamationTriangle 
                        className="ml-2 text-amber-500" 
                        title="Low stock alert" 
                        size={14}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {product.isActive ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(product)}
                      aria-label="View product"
                    >
                      <FaEye size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(product)}
                      aria-label="Edit product"
                    >
                      <FaEdit size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onToggleStatus(product._id ?? '', product.isActive)}
                      aria-label={product.isActive ? "Deactivate product" : "Activate product"}
                    >
                      {product.isActive ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      colorScheme="error" 
                      size="sm" 
                      onClick={() => onDelete(product._id ?? '')}
                      aria-label="Delete product"
                    >
                      <FaTrash size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={showBulkActions ? 8 : 7} className="text-center py-8">
                <div className="text-gray-500">No products found</div>
                <div className="mt-2">
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => window.location.href = "#create-product"}
                  >
                    Add a product
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Helper functions
const formatCategoryName = (category: string): string => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(value);
};
