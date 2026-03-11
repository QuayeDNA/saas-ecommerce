import React from 'react';
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showInfo?: boolean;
  showPerPageSelector?: boolean;
  perPageOptions?: number[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showInfo = true,
  showPerPageSelector = true,
  perPageOptions = [20, 30, 50, 100],
  size = 'md',
  variant = 'default',
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    // On mobile show fewer pages (delta 1), on larger screens use delta 2
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

  // Shared button classes
  const baseBtn = 'inline-flex items-center justify-center rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed select-none';
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-10 w-10 text-base',
  };
  const navBtn = `${baseBtn} ${sizeClasses[size]} border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100`;
  const pageBtn = (active: boolean) =>
    `${baseBtn} ${sizeClasses[size]} ${active
      ? 'border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700'
      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
    }`;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Row 1 (mobile): info + per-page ───────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {showInfo && (
          <p className="text-xs sm:text-sm text-gray-500 leading-tight">
            <span className="font-medium text-gray-700">{startItem}–{endItem}</span>
            {' '}of{' '}
            <span className="font-medium text-gray-700">{totalItems}</span>
            {' '}results
          </p>
        )}

        {showPerPageSelector && onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-gray-500 whitespace-nowrap">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-gray-300 bg-white px-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              {perPageOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Row 2: page controls ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {/* First page — hidden on mobile to save space */}
        {variant !== 'compact' && (
          <button
            className={`${navBtn} hidden sm:inline-flex`}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            <FaAngleDoubleLeft className="w-3 h-3" />
          </button>
        )}

        {/* Previous */}
        <button
          className={navBtn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <FaChevronLeft className="w-3 h-3" />
        </button>

        {/* Page numbers / compact label */}
        {variant === 'compact' ? (
          <span className="px-3 py-1 text-sm text-gray-600 font-medium">
            {currentPage} / {totalPages}
          </span>
        ) : (
          <>
            {/* Mobile: show only current / total */}
            <span className="sm:hidden px-2 py-1 text-sm text-gray-600 font-medium whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>

            {/* Desktop: full page numbers */}
            <div className="hidden sm:flex items-center gap-1 flex-wrap">
              {visiblePages.map((page, index) =>
                page === '...' ? (
                  <span key={`dots-${index}`} className="w-8 text-center text-sm text-gray-400 select-none">
                    ···
                  </span>
                ) : (
                  <button
                    key={`page-${page}-${index}`}
                    className={pageBtn(page === currentPage)}
                    onClick={() => onPageChange(page as number)}
                    aria-label={`Page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          </>
        )}

        {/* Next */}
        <button
          className={navBtn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <FaChevronRight className="w-3 h-3" />
        </button>

        {/* Last page — hidden on mobile */}
        {variant !== 'compact' && (
          <button
            className={`${navBtn} hidden sm:inline-flex`}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            <FaAngleDoubleRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};