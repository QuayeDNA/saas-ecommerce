// src/components/orders/OrderAnalytics.tsx
import React from "react";
import { Card, CardBody, Spinner } from "../../design-system";
import { StatsGrid } from "../../design-system/components/stats-card";
import type { StatCardProps } from "../../design-system/components/stats-card";
import {
  FaChartBar,
  FaCheckCircle,
  FaMoneyBillWave,
  FaClock,
  FaTimesCircle,
  FaPauseCircle
} from "react-icons/fa";

interface AnalyticsData {
  // Super Admin fields
  totalOrders?: number;
  todayOrders?: number;
  thisMonthOrders?: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  todayRevenue?: number;
  todayCompletedOrders?: number;
  statusCounts?: {
    processing?: number;
    pending?: number;
    cancelled?: number;
  };
  // Agent fields
  orders?: {
    total?: number;
    completed?: number;
    processing?: number;
    pending?: number;
    cancelled?: number;
    today?: {
      completed?: number;
      processing?: number;
      pending?: number;
      cancelled?: number;
    };
  };
  commission?: {
    totalPaid?: number;
    pendingAmount?: number;
    pendingCount?: number;
  };
  revenue?: {
    total?: number;
    today?: number;
    thisMonth?: number;
  };
}

interface OrderAnalyticsProps {
  analyticsData: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isAgent?: boolean;
}

export const OrderAnalytics: React.FC<OrderAnalyticsProps> = ({
  analyticsData,
  loading,
  error,
  isAdmin,
  isAgent,
}) => {
  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex justify-center items-center p-8">
            <Spinner />
            <span className="ml-3 text-gray-600">Loading analytics...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Error loading analytics: {error}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <FaChartBar className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Analytics Data
            </h3>
            <p className="text-gray-600">
              Analytics data is not available at the moment.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
    }).format(amount);
};

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatsCards = (): StatCardProps[] => {
    if (isAdmin) {
      // Super Admin: 8 stat cards as requested
      return [
        {
          title: "Total Orders",
          value: formatNumber(analyticsData.totalOrders || 0),
          icon: <FaChartBar />,
          size: "md",
        },
        {
          title: "Todays Orders",
          value: formatNumber(analyticsData.todayOrders || 0),
          subtitle: `Orders this month: ${formatNumber(analyticsData.thisMonthOrders || 0)}`,
          icon: <FaChartBar />,
          size: "md",
        },
        {
          title: "Today's Sales",
          value: formatCurrency(analyticsData.todayRevenue || 0),
          subtitle: `Total Sales: ${formatCurrency(analyticsData.totalRevenue || 0)}`,
          icon: <FaMoneyBillWave />,
          size: "md",
        },
        {
          title: "Monthly Sales",
          value: formatCurrency(analyticsData.monthlyRevenue || 0),
          subtitle: `Commission: ${formatCurrency(analyticsData.commission?.pendingAmount || 0)}`,
          icon: <FaMoneyBillWave />,
          size: "md",
        },
        {
          title: "Completed orders today",
          value: formatNumber(analyticsData.todayCompletedOrders || 0),
          subtitle: `Total completed: ${formatNumber(analyticsData.totalOrders || 0)}`,
          icon: <FaCheckCircle />,
          size: "md",
        },
        {
          title: "Processing",
          value: formatNumber(analyticsData.statusCounts?.processing || 0),
          subtitle: `Total processing: ${formatNumber(analyticsData.statusCounts?.processing || 0)}`,
          icon: <FaClock />,
          size: "md",
        },
        {
          title: "Pending",
          value: formatNumber(analyticsData.statusCounts?.pending || 0),
          subtitle: `Total pending: ${formatNumber(analyticsData.statusCounts?.pending || 0)}`,
          icon: <FaPauseCircle />,
          size: "md",
        },
        {
          title: "Cancelled",
          value: formatNumber(analyticsData.statusCounts?.cancelled || 0),
          subtitle: `Total cancelled: ${formatNumber(analyticsData.statusCounts?.cancelled || 0)}`,
          icon: <FaTimesCircle />,
          size: "md",
        },
      ];
    } else if (isAgent) {
      // Agent: 6 stat cards as requested
      return [
        {
          title: "Total Sales",
          value: formatCurrency(analyticsData.revenue?.total || 0),
          icon: <FaMoneyBillWave />,
          size: "md",
        },
        {
          title: "Monthly sales",
          value: formatCurrency(analyticsData.revenue?.today || 0),
          subtitle: `Sales today: ${formatCurrency(analyticsData.revenue?.today || 0)}`,
          icon: <FaMoneyBillWave />,
          size: "md",
        },
        {
          title: "Completed today",
          value: formatNumber(analyticsData.orders?.today?.completed || 0),
          subtitle: `Total completed: ${formatNumber(analyticsData.orders?.completed || 0)}`,
          icon: <FaCheckCircle />,
          size: "md",
        },
        {
          title: "Processing",
          value: formatNumber(analyticsData.orders?.today?.processing || 0),
          subtitle: `Total processing: ${formatNumber(analyticsData.orders?.processing || 0)}`,
          icon: <FaClock />,
          size: "md",
        },
        {
          title: "Pending",
          value: formatNumber(analyticsData.orders?.today?.pending || 0),
          subtitle: `Total pending: ${formatNumber(analyticsData.orders?.pending || 0)}`,
          icon: <FaPauseCircle />,
          size: "md",
        },
        {
          title: "Cancelled",
          value: formatNumber(analyticsData.orders?.today?.cancelled || 0),
          subtitle: `Total cancelled: ${formatNumber(analyticsData.orders?.cancelled || 0)}`,
          icon: <FaTimesCircle />,
          size: "md",
        },
      ];
    }

    // Default fallback
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <StatsGrid
        stats={getStatsCards()}
        columns={6}
        gap="md"
      />
    </div>
  );
};
