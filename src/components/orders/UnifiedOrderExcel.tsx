// src/components/orders/UnifiedOrderExcel.tsx
import React, { useMemo } from 'react';
import { DataGrid } from 'react-data-grid';
import type { Order } from '../../types/order';
import { Badge } from '../../design-system';
import { FaFileExcel, FaDownload, FaCopy } from 'react-icons/fa';

interface UnifiedOrderExcelProps {
  orders: Order[];
  loading?: boolean;
}

interface ExcelRow {
  id: string;
  orderId: string;
  contactNumber: string;
  dataVolume: string;
  providerName: string;
  status: string;
  date: string;
  total: number;
  orderType: string;
  paymentStatus: string;
}

const columns = [
  {
    key: 'orderId',
    name: 'Order ID',
    width: 150,
    resizable: true,
    sortable: true,
  },
  {
    key: 'contactNumber',
    name: 'Contact Number',
    width: 150,
    resizable: true,
    sortable: true,
  },
  {
    key: 'dataVolume',
    name: 'Data Volume',
    width: 120,
    resizable: true,
    sortable: true,
  },
  {
    key: 'providerName',
    name: 'Provider',
    width: 120,
    resizable: true,
    sortable: true,
  },
  {
    key: 'status',
    name: 'Status',
    width: 120,
    resizable: true,
    sortable: true,
    renderCell: ({ row }: { row: ExcelRow }) => (
      <Badge
        variant="subtle"
        colorScheme={
          row.status === 'completed' ? 'success' :
          row.status === 'processing' ? 'warning' :
          row.status === 'cancelled' ? 'error' :
          row.status === 'failed' ? 'error' :
          'default'
        }
        className="text-xs"
      >
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </Badge>
    ),
  },
  {
    key: 'date',
    name: 'Date',
    width: 120,
    resizable: true,
    sortable: true,
  },
  {
    key: 'total',
    name: 'Total (GHS)',
    width: 120,
    resizable: true,
    sortable: true,
    renderCell: ({ row }: { row: ExcelRow }) => (
      <span className="font-mono text-sm">
        {row.total.toLocaleString('en-GH', {
          style: 'currency',
          currency: 'GHS',
          minimumFractionDigits: 2
        })}
      </span>
    ),
  },
  {
    key: 'orderType',
    name: 'Order Type',
    width: 100,
    resizable: true,
    sortable: true,
    renderCell: ({ row }: { row: ExcelRow }) => (
      <Badge
        variant="subtle"
        colorScheme={row.orderType === 'bulk' ? 'warning' : 'default'}
        className="text-xs"
      >
        {row.orderType.charAt(0).toUpperCase() + row.orderType.slice(1)}
      </Badge>
    ),
  },
  {
    key: 'paymentStatus',
    name: 'Payment',
    width: 100,
    resizable: true,
    sortable: true,
    renderCell: ({ row }: { row: ExcelRow }) => (
      <Badge
        variant="subtle"
        colorScheme={
          row.paymentStatus === 'paid' ? 'success' :
          row.paymentStatus === 'failed' ? 'error' :
          'warning'
        }
        className="text-xs"
      >
        {row.paymentStatus.charAt(0).toUpperCase() + row.paymentStatus.slice(1)}
      </Badge>
    ),
  },
];

export const UnifiedOrderExcel: React.FC<UnifiedOrderExcelProps> = ({
  orders,
  loading = false,
}) => {
  // Transform orders to Excel format
  const excelRows = useMemo(() => {
    return orders.map((order) => {
      // Get the first item's data volume and provider
      const firstItem = order.items[0];
      const dataVolume = firstItem?.packageDetails?.dataVolume 
        ? `${firstItem.packageDetails.dataVolume}`
        : 'N/A';
      
      const providerName = firstItem?.packageDetails?.provider || 'N/A';
      
      // Get contact number from customer info or first item
      const contactNumber = order.customerInfo?.phone || 
                          firstItem?.customerPhone || 
                          'N/A';

      return {
        id: order._id || '',
        orderId: order.orderNumber,
        contactNumber,
        dataVolume,
        providerName,
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        total: order.total,
        orderType: order.orderType,
        paymentStatus: order.paymentStatus,
      };
    });
  }, [orders]);

  // Sort rows by date (newest first)
  const sortedRows = useMemo(() => {
    return [...excelRows].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return bDate - aDate; // Newest first
    });
  }, [excelRows]);

  const handleExport = () => {
    // Create CSV content
    const headers = columns.map(col => col.name).join(',');
    const rows = sortedRows.map(row => 
      [
        row.orderId,
        row.contactNumber,
        row.dataVolume,
        row.providerName,
        row.status,
        row.date,
        row.total.toFixed(2),
        row.orderType,
        row.paymentStatus
      ].join(',')
    ).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPendingOrders = async () => {
    // Filter pending orders
    const pendingOrders = orders.filter(order => order.status === 'pending');
    
    if (pendingOrders.length === 0) {
      alert('No pending orders found to copy.');
      return;
    }

    // Format data as "number datavolume"
    const formattedData = pendingOrders.map(order => {
      const firstItem = order.items[0];
      const contactNumber = order.customerInfo?.phone || 
                          firstItem?.customerPhone || 
                          'N/A';
      
      // Extract just the number from dataVolume (remove "GB" or any text)
      const dataVolumeRaw = firstItem?.packageDetails?.dataVolume || '0';
      const dataVolumeNumber = dataVolumeRaw.toString().replace(/[^\d.]/g, '');
      
      return `${contactNumber} ${dataVolumeNumber}`;
    }).join('\n');

    try {
      await navigator.clipboard.writeText(formattedData);
      alert(`Copied ${pendingOrders.length} pending orders to clipboard!`);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = formattedData;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(`Copied ${pendingOrders.length} pending orders to clipboard!`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading Excel view...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 w-full h-full flex flex-col">
      {/* Excel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-3 sm:p-4 rounded-lg border border-gray-200 gap-3 sm:gap-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <FaFileExcel className="text-green-600 text-lg sm:text-xl flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Excel View</h3>
          </div>
          <span className="text-xs sm:text-sm text-gray-500">
            {sortedRows.length} orders • Newest first
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyPendingOrders}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <FaCopy className="text-xs sm:text-sm" />
            <span className="hidden sm:inline">Copy Pending Orders</span>
            <span className="sm:hidden">Copy Pending</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <FaDownload className="text-xs sm:text-sm" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Excel Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full flex-1">
        <div className="w-full h-full">
          <DataGrid
            columns={columns}
            rows={sortedRows}
            className="rdg-light w-full h-full"
            style={{
              '--rdg-color': '#374151',
              '--rdg-summary-border-color': '#d1d5db',
              '--rdg-border-color': '#e5e7eb',
              '--rdg-summary-background-color': '#f9fafb',
              '--rdg-background-color': '#ffffff',
              '--rdg-header-background-color': '#f3f4f6',
              '--rdg-row-hover-background-color': '#f9fafb',
              '--rdg-row-selected-background-color': '#dbeafe',
              '--rdg-row-selected-hover-background-color': '#bfdbfe',
              '--rdg-checkbox-color': '#3b82f6',
              '--rdg-checkbox-focus-color': '#1d4ed8',
              '--rdg-checkbox-disabled-color': '#9ca3af',
              '--rdg-selection-color': '#3b82f6',
              '--rdg-font-size': '14px',
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Excel Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg gap-2 sm:gap-0">
        <div>
          Showing {sortedRows.length} of {sortedRows.length} orders
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
          <span>Sorted by: Date (Newest first)</span>
          <span className="hidden sm:inline">•</span>
          <span>Click column headers to sort</span>
        </div>
      </div>
    </div>
  );
}; 