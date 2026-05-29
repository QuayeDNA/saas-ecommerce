// src/components/orders/OrderAnalytics.tsx
import React, { useState, useEffect } from "react";
import { Card, CardBody, Spinner } from "../../design-system";
import { StatsGrid } from "../../design-system/components/stats-card";
import type { StatCardProps } from "../../design-system/components/stats-card";
import {
  FaChartBar,
  FaCheckCircle,
  FaMoneyBillWave,
  FaClock,
  FaTimesCircle,
  FaPauseCircle,
  FaExclamationTriangle,
  FaSearch,
  FaCheckDouble,
  FaChevronLeft,
  FaChevronRight,
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
    confirmed?: number;
    cancelled?: number;
    partiallyCompleted?: number;
  };
  receptionCounts?: {
    received?: number;
    not_received?: number;
    checking?: number;
    resolved?: number;
  };
  // Agent fields
  orders?: {
    total?: number;
    completed?: number;
    processing?: number;
    pending?: number;
    confirmed?: number;
    cancelled?: number;
    partiallyCompleted?: number;
    today?: {
      completed?: number;
      processing?: number;
      pending?: number;
      confirmed?: number;
      cancelled?: number;
      partiallyCompleted?: number;
    };
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

// Reception Carousel Card Component
const ReceptionCarouselCard: React.FC<{
  receptionCounts: AnalyticsData["receptionCounts"];
  carouselIndex: number;
  setCarouselIndex: (index: number | ((prev: number) => number)) => void;
  formatNumber: (num: number) => string;
}> = ({ receptionCounts, carouselIndex, setCarouselIndex, formatNumber }) => {
  const receptionItems = [
    {
      title: "Data Received",
      value: receptionCounts?.received || 0,
      subtitle: "Confirmed delivery",
      icon: <FaCheckDouble />,
      color: "text-[var(--success)]",
    },
    {
      title: "Delivery Issues",
      value: receptionCounts?.not_received || 0,
      subtitle: "Reported not received",
      icon: <FaExclamationTriangle />,
      color: "text-[var(--error)]",
    },
    {
      title: "Under Investigation",
      value: receptionCounts?.checking || 0,
      subtitle: "Being investigated",
      icon: <FaSearch />,
      color: "text-[var(--warning)]",
    },
    {
      title: "Issues Resolved",
      value: receptionCounts?.resolved || 0,
      subtitle: "Successfully resolved",
      icon: <FaCheckCircle />,
      color: "text-[var(--success)]",
    },
  ];

  const currentReceptionItem = receptionItems[carouselIndex];

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % receptionItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [setCarouselIndex, receptionItems.length]);

  return (
    <Card
      style={{ background: "var(--gradient-brand-dark)" }}
    >
      <CardBody>
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <p
              className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 lg:mb-2 truncate"
              style={{ color: "var(--text-inverse)", opacity: 0.6 }}
            >
              Order Reception Status
            </p>

            {/* Carousel Content */}
            <div className="relative">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setCarouselIndex(
                      (prev) =>
                        (prev - 1 + receptionItems.length) %
                        receptionItems.length,
                    )
                  }
                  className="p-1 rounded-full transition-colors"
                  style={{ color: "var(--text-inverse)", opacity: 0.7 }}
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 text-center px-4">
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className="text-3xl font-bold"
                      style={{ color: "var(--text-inverse)" }}
                    >
                      {formatNumber(currentReceptionItem.value)}
                    </div>
                    <div
                      className="text-lg font-medium"
                      style={{ color: "var(--text-inverse)", opacity: 0.8 }}
                    >
                      {currentReceptionItem.title}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "var(--text-inverse)", opacity: 0.6 }}
                    >
                      {currentReceptionItem.subtitle}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setCarouselIndex(
                      (prev) => (prev + 1) % receptionItems.length,
                    )
                  }
                  className="p-1 rounded-full transition-colors"
                  style={{ color: "var(--text-inverse)", opacity: 0.7 }}
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Carousel indicators */}
              <div className="flex justify-center space-x-2 mt-3">
                {receptionItems.map((item, index) => (
                  <button
                    key={`reception-${item.title}`}
                    onClick={() => setCarouselIndex(index)}
                    className="w-2 h-2 rounded-full transition-colors"
                    style={{
                      backgroundColor: index === carouselIndex
                        ? "var(--text-inverse)"
                        : "color-mix(in srgb, var(--text-inverse) 30%, transparent)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            className="p-2 sm:p-2.5 lg:p-3 rounded-full flex-shrink-0 hidden sm:flex items-center justify-center"
            style={{ backgroundColor: "color-mix(in srgb, var(--text-inverse) 20%, transparent)" }}
          >
            <div
              className="text-sm sm:text-base lg:text-lg"
              style={{ color: "var(--text-inverse)" }}
            >
              <FaChartBar />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export const OrderAnalytics: React.FC<OrderAnalyticsProps> = ({
  analyticsData,
  loading,
  error,
  isAdmin,
  isAgent,
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex justify-center items-center p-8">
            <Spinner />
            <span className="ml-3 text-[var(--text-muted)]">Loading analytics...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="p-6 bg-[var(--error-lighter)] border border-[var(--error)]/20 rounded-lg">
            <p className="text-[var(--error)]">Error loading analytics: {error}</p>
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
            <FaChartBar className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
              No Analytics Data
            </h3>
            <p className="text-[var(--text-muted)]">
              Analytics data is not available at the moment.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
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
          subtitle: `Orders this month: ${formatNumber(
            analyticsData.thisMonthOrders || 0,
          )}`,
          icon: <FaChartBar />,
          size: "md",
        },
        {
          title: "Today's Sales",
          value: formatCurrency(analyticsData.todayRevenue || 0),
          subtitle: `Total Sales: ${formatCurrency(
            analyticsData.totalRevenue || 0,
          )}`,
          icon: <FaMoneyBillWave />,
          size: "md",
        },
        {
          title: "Monthly Sales",
          value: formatCurrency(analyticsData.monthlyRevenue || 0),
          subtitle: `Monthly revenue summary`,
          icon: <FaMoneyBillWave />,
          size: "md",
        },
        {
          title: "Completed orders today",
          value: formatNumber(analyticsData.todayCompletedOrders || 0),
          subtitle: `Total completed: ${formatNumber(
            analyticsData.totalOrders || 0,
          )}`,
          icon: <FaCheckCircle />,
          size: "md",
        },
        {
          title: "Processing",
          value: formatNumber(analyticsData.orders?.today?.processing || 0),
          subtitle: `Total processing: ${formatNumber(
            analyticsData.statusCounts?.processing ||
              analyticsData.orders?.processing ||
              0,
          )}`,
          icon: <FaClock />,
          size: "md",
        },
        {
          title: "Pending",
          value: formatNumber(analyticsData.orders?.today?.pending || 0),
          subtitle: `Total pending: ${formatNumber(
            analyticsData.statusCounts?.pending ||
              analyticsData.orders?.pending ||
              0,
          )}`,
          icon: <FaPauseCircle />,
          size: "md",
        },
        {
          title: "Cancelled",
          value: formatNumber(analyticsData.orders?.today?.cancelled || 0),
          subtitle: `Total cancelled: ${formatNumber(
            analyticsData.statusCounts?.cancelled ||
              analyticsData.orders?.cancelled ||
              0,
          )}`,
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
          value: formatCurrency(analyticsData.revenue?.thisMonth || 0),
          subtitle: `Sales today: ${formatCurrency(
            analyticsData.revenue?.today || 0,
          )}`,
          icon: <FaMoneyBillWave />,
          size: "md",
        },
        {
          title: "Completed today",
          value: formatNumber(analyticsData.orders?.today?.completed || 0),
          subtitle: `Total completed: ${formatNumber(
            analyticsData.orders?.completed || 0,
          )}`,
          icon: <FaCheckCircle />,
          size: "md",
        },
        {
          title: "Processing",
          value: formatNumber(analyticsData.orders?.today?.processing || 0),
          subtitle: `Total processing: ${formatNumber(
            analyticsData.orders?.processing || 0,
          )}`,
          icon: <FaClock />,
          size: "md",
        },
        {
          title: "Pending",
          value: formatNumber(analyticsData.orders?.today?.pending || 0),
          subtitle: `Total pending: ${formatNumber(
            analyticsData.orders?.pending || 0,
          )}`,
          icon: <FaPauseCircle />,
          size: "md",
        },
        {
          title: "Cancelled",
          value: formatNumber(analyticsData.orders?.today?.cancelled || 0),
          subtitle: `Total cancelled: ${formatNumber(
            analyticsData.orders?.cancelled || 0,
          )}`,
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
      <StatsGrid stats={getStatsCards()} columns={4} gap="xs" />

      {/* Reception Status Carousel - Only for Admins */}
      {isAdmin && analyticsData?.receptionCounts && (
        <div className="grid grid-cols-1 gap-4">
          <ReceptionCarouselCard
            receptionCounts={analyticsData.receptionCounts}
            carouselIndex={carouselIndex}
            setCarouselIndex={setCarouselIndex}
            formatNumber={formatNumber}
          />
        </div>
      )}
    </div>
  );
};
