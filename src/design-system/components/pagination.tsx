import React from 'react';
import { Button } from './button';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  size = 'md',
  variant = 'default',
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = variant === 'compact' ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {showInfo && (
        <div className="text-sm text-gray-700 text-center sm:text-left">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
      )}
      
      <div className="flex flex-wrap justify-center sm:justify-end gap-2">
        {/* Previous Button */}
        <Button
          size={size}
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="min-w-[40px]"
        >
          <FaChevronLeft className="w-3 h-3" />
        </Button>

        {/* Page Numbers */}
        {variant === 'compact' ? (
          // Compact variant - show current page and total
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        ) : (
          // Default variant - show page numbers
          visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm text-gray-500">...</span>
              ) : (
                <Button
                  size={size}
                  variant={page === currentPage ? "primary" : "outline"}
                  onClick={() => onPageChange(page as number)}
                  className="min-w-[40px]"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))
        )}

        {/* Next Button */}
        <Button
          size={size}
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="min-w-[40px]"
        >
          <FaChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}; 