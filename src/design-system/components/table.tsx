import { forwardRef } from 'react';
import type { ReactNode, HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { useTheme } from '../../hooks/use-theme';

// Table variants
type TableVariant = 'simple' | 'striped' | 'bordered';

// Table sizes
type TableSize = 'sm' | 'md' | 'lg';

// Table color schemes
type TableColorScheme = 'default' | 'success' | 'warning' | 'error' | 'info' | 'gray';

// Base table props
interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  variant?: TableVariant;
  size?: TableSize;
  colorScheme?: TableColorScheme;
  fullWidth?: boolean;
  stickyHeader?: boolean;
  className?: string;
  useThemeColor?: boolean;
}

// Table header props
interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  className?: string;
}

// Table body props
interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
  className?: string;
}

// Table row props
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
  isSelected?: boolean;
  isHoverable?: boolean;
}

// Table header cell props
interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

// Table cell props
interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  className?: string;
  numeric?: boolean;
}

// Table caption props
interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {
  children: ReactNode;
  className?: string;
}

// Main Table component
export const Table = forwardRef<HTMLTableElement, TableProps>(
  (
    {
      children,
      variant = 'simple',
      size = 'md',
      colorScheme = 'default',
      fullWidth = true,
      stickyHeader = false,
      className = '',
      useThemeColor = true,
      ...props
    },
    ref
  ) => {
    const { primaryColor } = useTheme();

    // Size classes
    const sizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    // Helper function to get theme-based color classes
    const getThemeColorClasses = () => {
      switch (primaryColor) {
        case 'blue':
          return {
            border: 'border-blue-200',
            headerBg: 'bg-blue-50',
            headerText: 'text-blue-900',
            stripedBg: 'even:bg-blue-25',
            selectedBg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-50',
          };
        case 'purple':
          return {
            border: 'border-purple-200',
            headerBg: 'bg-purple-50',
            headerText: 'text-purple-900',
            stripedBg: 'even:bg-purple-25',
            selectedBg: 'bg-purple-100',
            hoverBg: 'hover:bg-purple-50',
          };
        case 'green':
          return {
            border: 'border-green-200',
            headerBg: 'bg-green-50',
            headerText: 'text-green-900',
            stripedBg: 'even:bg-green-25',
            selectedBg: 'bg-green-100',
            hoverBg: 'hover:bg-green-50',
          };
        case 'orange':
          return {
            border: 'border-orange-200',
            headerBg: 'bg-orange-50',
            headerText: 'text-orange-900',
            stripedBg: 'even:bg-orange-25',
            selectedBg: 'bg-orange-100',
            hoverBg: 'hover:bg-orange-50',
          };
        case 'red':
          return {
            border: 'border-red-200',
            headerBg: 'bg-red-50',
            headerText: 'text-red-900',
            stripedBg: 'even:bg-red-25',
            selectedBg: 'bg-red-100',
            hoverBg: 'hover:bg-red-50',
          };
        default:
          return getSemanticColorClasses('info');
      }
    };

    const getSemanticColorClasses = (scheme: TableColorScheme): {
      border: string;
      headerBg: string;
      headerText: string;
      stripedBg: string;
      selectedBg: string;
      hoverBg: string;
    } => {
      switch (scheme) {
        case 'success':
          return {
            border: 'border-green-200',
            headerBg: 'bg-green-50',
            headerText: 'text-green-900',
            stripedBg: 'even:bg-green-25',
            selectedBg: 'bg-green-100',
            hoverBg: 'hover:bg-green-50',
          };
        case 'warning':
          return {
            border: 'border-yellow-200',
            headerBg: 'bg-yellow-50',
            headerText: 'text-yellow-900',
            stripedBg: 'even:bg-yellow-25',
            selectedBg: 'bg-yellow-100',
            hoverBg: 'hover:bg-yellow-50',
          };
        case 'error':
          return {
            border: 'border-red-200',
            headerBg: 'bg-red-50',
            headerText: 'text-red-900',
            stripedBg: 'even:bg-red-25',
            selectedBg: 'bg-red-100',
            hoverBg: 'hover:bg-red-50',
          };
        case 'info':
          return {
            border: 'border-blue-200',
            headerBg: 'bg-blue-50',
            headerText: 'text-blue-900',
            stripedBg: 'even:bg-blue-25',
            selectedBg: 'bg-blue-100',
            hoverBg: 'hover:bg-blue-50',
          };
        case 'gray':
          return {
            border: 'border-gray-200',
            headerBg: 'bg-gray-50',
            headerText: 'text-gray-900',
            stripedBg: 'even:bg-gray-25',
            selectedBg: 'bg-gray-100',
            hoverBg: 'hover:bg-gray-50',
          };
        case 'default':
        default:
          return getThemeColorClasses();
      }
    };

    // Get color classes
    const getColorClasses = () => {
      if (colorScheme === 'default' && useThemeColor) {
        return getThemeColorClasses();
      }
      return getSemanticColorClasses(colorScheme);
    };

    // Variant classes
    const getVariantClasses = () => {
      const colors = getColorClasses();
      
      switch (variant) {
        case 'simple':
          return 'border-collapse';
        case 'striped':
          return `border-collapse [&_tbody_tr:nth-child(even)]:bg-gray-50`;
        case 'bordered':
          return `border-collapse border ${colors.border}`;
        default:
          return 'border-collapse';
      }
    };

    const tableClasses = [
      'table-auto',
      sizeClasses[size],
      getVariantClasses(),
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ');

    return (
      <div className={stickyHeader ? 'overflow-auto' : ''}>
        <table ref={ref} className={tableClasses} {...props}>
          {children}
        </table>
      </div>
    );
  }
);

// Table Header component
export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <thead ref={ref} className={`${className}`} {...props}>
        {children}
      </thead>
    );
  }
);

// Table Body component
export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <tbody ref={ref} className={`${className}`} {...props}>
        {children}
      </tbody>
    );
  }
);

// Table Row component
export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    {
      children,
      className = '',
      isSelected = false,
      isHoverable = true,
      ...props
    },
    ref
  ) => {
    const rowClasses = [
      'border-b border-gray-200',
      isHoverable ? 'hover:bg-gray-50' : '',
      isSelected ? 'bg-blue-100' : '',
      'transition-colors duration-150',
      className,
    ].join(' ');

    return (
      <tr ref={ref} className={rowClasses} {...props}>
        {children}
      </tr>
    );
  }
);

// Table Header Cell component
export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  (
    {
      children,
      className = '',
      sortable = false,
      sortDirection = null,
      onSort,
      ...props
    },
    ref
  ) => {
    const { primaryColor } = useTheme();

    const getThemeColors = () => {
      switch (primaryColor) {
        case 'blue':
          return 'bg-blue-50 text-blue-900';
        case 'purple':
          return 'bg-purple-50 text-purple-900';
        case 'green':
          return 'bg-green-50 text-green-900';
        case 'orange':
          return 'bg-orange-50 text-orange-900';
        case 'red':
          return 'bg-red-50 text-red-900';
        default:
          return 'bg-gray-50 text-gray-900';
      }
    };

    const headerClasses = [
      'px-4 py-3',
      'text-left text-xs font-medium uppercase tracking-wider',
      getThemeColors(),
      'border-b border-gray-200',
      sortable ? 'cursor-pointer hover:bg-opacity-80 select-none' : '',
      className,
    ].join(' ');

    const handleClick = () => {
      if (sortable && onSort) {
        onSort();
      }
    };

    return (
      <th ref={ref} className={headerClasses} onClick={handleClick} {...props}>
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {sortable && (
            <span className="ml-1">
              {(() => {
                if (sortDirection === 'asc') {
                  return (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  );
                } else if (sortDirection === 'desc') {
                  return (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  );
                } else {
                  return (
                    <svg className="w-3 h-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 12l5-5 5 5H5z" />
                    </svg>
                  );
                }
              })()}
            </span>
          )}
        </div>
      </th>
    );
  }
);

// Table Cell component
export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  (
    {
      children,
      className = '',
      numeric = false,
      ...props
    },
    ref
  ) => {
    const cellClasses = [
      'px-4 py-3',
      'text-sm text-gray-900',
      'border-b border-gray-200',
      numeric ? 'text-right font-mono' : 'text-left',
      className,
    ].join(' ');

    return (
      <td ref={ref} className={cellClasses} {...props}>
        {children}
      </td>
    );
  }
);

// Table Caption component
export const TableCaption = forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <caption
        ref={ref}
        className={`text-sm text-gray-500 text-left py-2 ${className}`}
        {...props}
      >
        {children}
      </caption>
    );
  }
);

// Set display names
Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableRow.displayName = 'TableRow';
TableHeaderCell.displayName = 'TableHeaderCell';
TableCell.displayName = 'TableCell';
TableCaption.displayName = 'TableCaption';