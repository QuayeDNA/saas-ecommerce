import { forwardRef } from "react";
import type { ReactNode, HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

type TableVariant = "simple" | "striped" | "bordered";
type TableSize = "sm" | "md" | "lg";
type SortDirection = "asc" | "desc";

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  variant?: TableVariant;
  size?: TableSize;
  fullWidth?: boolean;
  stickyHeader?: boolean;
  className?: string;
}

const sizeClasses = { sm: "text-xs", md: "text-sm", lg: "text-base" };

const variantClasses = {
  simple: "",
  striped: "[&_tbody_tr:nth-child(odd)]:bg-[var(--bg-surface-alt)]",
  bordered: "border border-[var(--border-color)]",
};

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, variant = "simple", size = "md", fullWidth = true, stickyHeader = false, className = "", ...props }, ref) => {
    const tableClasses = [
      "table-auto border-collapse",
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? "w-full" : "",
      stickyHeader ? "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10" : "",
      className,
    ].join(" ");

    return (
      <div className="overflow-x-auto rounded-lg border border-[var(--border-color)]">
        <table ref={ref} className={tableClasses} {...props}>
          {children}
        </table>
      </div>
    );
  },
);
Table.displayName = "Table";

export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ children, className = "", ...props }, ref) => (
    <thead ref={ref} className={`bg-[var(--bg-surface-alt)] text-[var(--text-primary)] ${className}`} {...props}>
      {children}
    </thead>
  ),
);
TableHeader.displayName = "TableHeader";

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: SortDirection | null;
  onSort?: () => void;
}

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ children, className = "", ...props }, ref) => (
    <th ref={ref} className={`px-4 py-3 text-left font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)] ${className}`} {...props}>
      {children}
    </th>
  ),
);
TableHeaderCell.displayName = "TableHeaderCell";

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ children, className = "", ...props }, ref) => (
    <tbody ref={ref} className={`divide-y divide-[var(--border-color)] ${className}`} {...props}>
      {children}
    </tbody>
  ),
);
TableBody.displayName = "TableBody";

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ children, className = "", ...props }, ref) => (
    <tr ref={ref} className={`hover:bg-[var(--bg-surface-alt)] transition-colors duration-150 ${className}`} {...props}>
      {children}
    </tr>
  ),
);
TableRow.displayName = "TableRow";

export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ children, className = "", ...props }, ref) => (
    <td ref={ref} className={`px-4 py-3 text-[var(--text-secondary)] ${className}`} {...props}>
      {children}
    </td>
  ),
);
TableCell.displayName = "TableCell";
