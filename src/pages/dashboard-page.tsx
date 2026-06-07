import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../hooks";
import { useAgentAnalytics } from "../hooks/use-analytics";
import { useProvider } from "../hooks/use-provider";
import { useSiteStatus } from "../contexts/site-status-context";
import { orderService } from "../services/order.service";
import { packageService } from "../services/package.service";
import { Card, CardHeader, CardBody, Badge, Spinner, StatsGrid } from "../design-system";
import {
  FaPhone,
  FaWallet,
  FaShoppingCart,
  FaStar,
  FaTimes,
  FaClock,
  FaArrowRight,
  FaChartLine,
} from "react-icons/fa";
import type { WalletTransaction } from "../types/wallet";
import type { Order } from "../types/order";
import type { Package } from "../types/package";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Add CSS keyframes for fade-in animation
const fadeInKeyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject the CSS
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = fadeInKeyframes;
  document.head.appendChild(style);
}

// Register Chart.js components including Filler and Bar plugins
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
);

export const DashboardPage = () => {
  const { getTransactionHistory } = useWallet();
  const { providers } = useProvider();
  const { siteStatus } = useSiteStatus();

  // State for modals and data
  const [recentTransactions, setRecentTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("7d");

  const {
    data: agentAnalytics,
    isLoading: analyticsLoading,
  } = useAgentAnalytics(analyticsTimeframe);

  const analyticsData = useMemo(() => {
    if (!agentAnalytics) {
      return {
        orders: { total: 0, completed: 0, pending: 0, processing: 0, confirmed: 0, failed: 0, cancelled: 0, partiallyCompleted: 0, successRate: 0, todayCounts: { total: 0, completed: 0, pending: 0, processing: 0, confirmed: 0, failed: 0, cancelled: 0, partiallyCompleted: 0 } },
        revenue: { total: 0, today: 0, orderCount: 0, averageOrderValue: 0 },
        wallet: { balance: 0 },
        charts: { labels: [] as string[], orders: [] as number[], revenue: [] as number[], completedOrders: [] as number[] },
      };
    }
    return {
      orders: {
        total: agentAnalytics.orders?.total || 0,
        completed: agentAnalytics.orders?.completed || 0,
        pending: agentAnalytics.orders?.pending || 0,
        processing: agentAnalytics.orders?.processing || 0,
        confirmed: agentAnalytics.orders?.confirmed || 0,
        failed: agentAnalytics.orders?.failed || 0,
        cancelled: agentAnalytics.orders?.cancelled || 0,
        partiallyCompleted: agentAnalytics.orders?.partiallyCompleted || 0,
        successRate: agentAnalytics.orders?.successRate || 0,
        todayCounts: {
          total: agentAnalytics.orders?.todayCounts?.total || 0,
          completed: agentAnalytics.orders?.todayCounts?.completed || 0,
          pending: agentAnalytics.orders?.todayCounts?.pending || 0,
          processing: agentAnalytics.orders?.todayCounts?.processing || 0,
          confirmed: agentAnalytics.orders?.todayCounts?.confirmed || 0,
          failed: agentAnalytics.orders?.todayCounts?.failed || 0,
          cancelled: agentAnalytics.orders?.todayCounts?.cancelled || 0,
          partiallyCompleted: agentAnalytics.orders?.todayCounts?.partiallyCompleted || 0,
        },
      },
      revenue: {
        total: agentAnalytics.revenue?.total || 0,
        today: agentAnalytics.revenue?.today || 0,
        orderCount: agentAnalytics.revenue?.orderCount || 0,
        averageOrderValue: agentAnalytics.revenue?.averageOrderValue || 0,
      },
      wallet: { balance: agentAnalytics.wallet?.balance || 0 },
      charts: {
        labels: agentAnalytics.charts?.labels || [],
        orders: agentAnalytics.charts?.orders || [],
        revenue: agentAnalytics.charts?.revenue || [],
        completedOrders: agentAnalytics.charts?.completedOrders || [],
      },
    };
  }, [agentAnalytics]);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  const [showSiteMessage, setShowSiteMessage] = useState(true);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [activeOrdersLoading, setActiveOrdersLoading] = useState(true);
  const [dashboardPackages, setDashboardPackages] = useState<Package[]>([]);
  const [dashboardPackagesLoading, setDashboardPackagesLoading] = useState(true);

  const navigate = useNavigate();

  // Auto-dismiss site message after 5 seconds
  useEffect(() => {
    if (!showSiteMessage || !siteStatus) return;
    const timer = setTimeout(() => setShowSiteMessage(false), 5000);
    return () => clearTimeout(timer);
  }, [showSiteMessage, siteStatus]);

  // Get site message
  const getSiteMessage = () => {
    if (!siteStatus) return "";
    return siteStatus.isSiteOpen
      ? "Hi! We are currently open for business! 🎉"
      : "Sorry, store is currently closed for business 😔";
  };

  const siteStatusColor = siteStatus?.isSiteOpen ? "var(--success)" : "var(--error)";

  // Handle quick link click
  const handleQuickLinkClick = (slug: string) => {
    navigate(`./packages/${slug}`);
  };

  // Get provider logo by provider code
  const getProviderLogo = (providerCode: string) => {
    const provider = providers.find((p) => p.code === providerCode);
    return provider?.logo;
  };

  // Get provider color by provider code
  const getProviderColor = (providerCode: string) => {
    const colorMap: Record<string, string> = {
      MTN: "bg-yellow-500",
      TELECEL: "bg-red-500",
      AT: "bg-blue-500",
      AFA: "bg-green-500",
    };
    return colorMap[providerCode] || "bg-[var(--text-muted)]";
  };

  // Fetch packages for quick actions
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setDashboardPackagesLoading(true);
        const response = await packageService.getPackages({
          isActive: true,
        });
        setDashboardPackages(response.packages || []);
      } catch {
        setDashboardPackages([]);
      } finally {
        setDashboardPackagesLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Format transaction amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Get transaction status color
  const getTransactionStatusColor = (type: string) => {
    return type === "credit" ? "success" : "error";
  };

  // Load dashboard data (transactions only)
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const transactionData = await getTransactionHistory(1, 5);
        if (transactionData) {
          setRecentTransactions(transactionData.transactions);
        }
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [getTransactionHistory]);

  // Fetch active (pending/processing/confirmed) orders
  useEffect(() => {
    const loadActiveOrders = async () => {
      try {
        setActiveOrdersLoading(true);
        // Fetch pending orders first, then processing, then confirmed
        const [pendingRes, processingRes, confirmedRes] = await Promise.all([
          orderService.getOrders(
            { status: "pending" },
            { limit: 5, page: 1, sortBy: "createdAt", sortOrder: "desc" },
          ),
          orderService.getOrders(
            { status: "processing" },
            { limit: 5, page: 1, sortBy: "createdAt", sortOrder: "desc" },
          ),
          orderService.getOrders(
            { status: "confirmed" },
            { limit: 5, page: 1, sortBy: "createdAt", sortOrder: "desc" },
          ),
        ]);

        // Combine, sort by createdAt desc, take first 5
        const combined = [
          ...pendingRes.orders,
          ...processingRes.orders,
          ...confirmedRes.orders,
        ]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5);

        setActiveOrders(combined);
      } catch (err) {
        console.error("Failed to load active orders:", err);
      } finally {
        setActiveOrdersLoading(false);
      }
    };

    loadActiveOrders();
  }, []);

  // Format time ago
  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Get status badge color
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "confirmed":
        return "success";
      default:
        return "default";
    }
  };

  // Get timeframe display label
  const getTimeframeLabel = () => {
    switch (analyticsTimeframe) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "365d":
        return "Last 12 Months";
      case "1d":
        return "Today";
      default:
        return "Last 30 Days";
    }
  };

  // Prepare sales chart data - uses backend labels directly
  const salesChartData = useMemo(() => {
    const labels = analyticsData.charts.labels || [];
    const revenueData = analyticsData.charts.revenue || [];

    if (labels.length === 0) {
      return { labels: [], datasets: [] };
    }

    const formatLabel = (label: string) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
        const d = new Date(label + "T00:00:00");
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      }
      if (/^\d{4}-\d{2}$/.test(label)) {
        const d = new Date(label + "-01T00:00:00");
        return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      }
      return label;
    };

    return {
      labels: labels.map(formatLabel),
      datasets: [
        {
          label: "Revenue (GHS)",
          data: revenueData,
          backgroundColor: labels.map((_, i) => {
            const colors = ["#10b981", "#34d399", "#6ee7b7", "#059669", "#047857", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#84cc16"];
            return colors[i % colors.length];
          }),
          borderColor: labels.map((_, i) => {
            const colors = ["#059669", "#10b981", "#34d399", "#047857", "#065f46", "#2563eb", "#4f46e5", "#7c3aed", "#9333ea", "#c026d3", "#db2777", "#e11d48", "#ea580c", "#ca8a04", "#65a30d"];
            return colors[i % colors.length];
          }),
          borderWidth: 1.5,
          borderRadius: 4,
        },
      ],
    };
  }, [analyticsData.charts.labels, analyticsData.charts.revenue]);

  const salesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return `Revenue: GHS ${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          callback: function (value: any) {
            return `₵${value}`;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Prepare order analytics chart data - Order completion trends
  const orderAnalyticsChartData = useMemo(() => {
    const labels = ["Total Orders", "Completed", "Pending"];
    const data = [
      analyticsData.orders.total,
      analyticsData.orders.completed,
      analyticsData.orders.pending,
    ];

    return {
      labels,
      datasets: [
        {
          label: "Orders",
          data,
          backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
          borderColor: ["#2563eb", "#059669", "#d97706"],
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData.orders.total, analyticsData.orders.completed, analyticsData.orders.pending]);

  const orderAnalyticsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return `${context.label}: ${context.parsed.y} orders`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="dashboard-welcome space-y-4 sm:space-y-6">
      {/* Site Status Message - Glassmorphic design */}
      {showSiteMessage && siteStatus && (
        <div
          className="transform transition-all duration-1000 ease-in-out"
          style={{
            animation: "fadeIn 0.5s ease-in-out",
            opacity: showSiteMessage ? 1 : 0,
            transform: showSiteMessage ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          <Card
            className="backdrop-blur-md p-4"
            style={{
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "var(--bg-surface-alt)" }}
                >
                  <FaStar
                    className="w-6 h-6"
                    style={{ color: siteStatusColor }}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm sm:text-base font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {getSiteMessage()}
                  </p>
                </div>
                <button
                  onClick={() => setShowSiteMessage(false)}
                  className="p-2 rounded-full transition-all duration-200"
                  style={{
                    color: "var(--text-muted)",
                    transition: "color var(--transition-fast)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--text-secondary)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--text-muted)")
                  }
                  aria-label="Close message"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Active Orders - Show pending/processing/confirmed */}
      <div className="active-orders">
        <div className="flex items-center justify-between mb-3 px-2 sm:px-0">
          <h2 className="text-lg font-medium flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaClock style={{ color: "var(--warning)" }} />
            Active Orders
          </h2>
          <Link
            to="./orders"
            className="text-sm font-medium flex items-center gap-1"
            style={{
              color: "var(--color-secondary)",
              transition: "gap var(--transition-fast)",
            }}
          >
            View all <FaArrowRight className="text-xs" />
          </Link>
        </div>

        {activeOrdersLoading ? (
          <Card>
            <CardBody>
              <div className="flex justify-center items-center h-24">
                <Spinner />
              </div>
            </CardBody>
          </Card>
        ) : activeOrders.length === 0 ? (
          <Card>
            <CardBody className="text-center py-6">
              <FaShoppingCart className="mx-auto h-8 w-8 mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No active orders</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                All your orders are completed or you haven't placed any yet
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="max-h-[136px] overflow-y-auto pr-1 scrollbar-thin">
            <div className="space-y-2">
              {activeOrders.map((order) => (
                <Link key={order._id} to={`./orders`} className="block">
                  <Card
                    variant="interactive"
                    size="sm"
                  >
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                              {order.orderNumber}
                            </span>
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              {order.items?.length || 0} item
                              {(order.items?.length || 0) !== 1
                                ? "s"
                                : ""} · {getTimeAgo(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="subtle"
                            colorScheme={
                              getOrderStatusColor(order.status) as
                                | "warning"
                                | "info"
                                | "success"
                                | "default"
                            }
                            size="xs"
                          >
                            {order.status}
                          </Badge>
                          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                            ₵{order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
            {activeOrders.length > 2 && (
              <p className="text-[10px] text-center mt-1" style={{ color: "var(--text-muted)" }}>
                Scroll for more ({activeOrders.length} orders)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="text-lg font-medium mb-3 px-2 sm:px-0" style={{ color: "var(--text-primary)" }}>
          All Packages
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {dashboardPackagesLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8">
              <Spinner />
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                Loading packages...
              </p>
            </div>
          ) : dashboardPackages.length === 0 ? (
            <div className="col-span-full text-center py-8" style={{ color: "var(--text-secondary)" }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                No packages found
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No packages are available at the moment.
              </p>
            </div>
          ) : (
            dashboardPackages.filter((pkg) => pkg._id && pkg.provider !== "AFA").map((pkg) => {
              const providerLogo = getProviderLogo(pkg.provider);
              const providerColor = getProviderColor(pkg.provider);
              const key = pkg._id || pkg.slug;
              return (
                <Card
                  key={key}
                  variant="interactive"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => pkg._id && handleQuickLinkClick(pkg._id)}
                >
                  <CardBody className="text-center">
                    <div
                      className={`${providerColor} text-white rounded-full mx-auto mb-2 w-12 h-12 flex items-center justify-center overflow-hidden`}
                    >
                      {providerLogo?.url &&
                      !failedLogos.has(pkg.provider) ? (
                        <img
                          src={providerLogo.url}
                          alt={providerLogo.alt || pkg.name}
                          className="w-12 h-12 object-cover rounded-full"
                          onError={() => {
                            setFailedLogos((prev) =>
                              new Set(prev).add(pkg.provider),
                            );
                          }}
                        />
                      ) : (
                        <FaPhone className="w-6 h-6" />
                      )}
                    </div>
                    <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{pkg.name}</div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Browse bundles
                    </div>
                  </CardBody>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="account-overview">
        <h2 className="text-lg font-medium mb-3 px-2 sm:px-0" style={{ color: "var(--text-primary)" }}>
          Account Overview
        </h2>
        <StatsGrid
          stats={[
            {
              title: "Total Orders Today",
              value: analyticsData.orders.todayCounts.total,
              subtitle: `Total: ${analyticsData.orders.total}`,
              icon: <FaShoppingCart />,
              size: "sm",
            },
            {
              title: "Today's Spending",
              value: `₵${analyticsData.revenue.today.toFixed(2)}`,
              icon: <FaWallet />,
              size: "sm",
            },
            {
              title: "Total Sales Today",
              value: `₵${analyticsData.revenue.today.toFixed(2)}`,
              icon: <FaChartLine />,
              size: "sm",
            },
          ]}
          columns={3}
          gap="sm"
        />
      </div>

      {/* Sales Analytics Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
              Sales Analytics
            </h3>
            <div className="flex gap-2">
              <select
                value={analyticsTimeframe}
                onChange={(e) => setAnalyticsTimeframe(e.target.value)}
                className="text-sm block p-2"
                style={{
                  backgroundColor: "var(--bg-surface-alt)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  borderRadius: "var(--radius-md)",
                  outline: "none",
                }}
              >
                <option value="7d">Weekly (Last 7 Days)</option>
                <option value="30d">Monthly (Last 30 Days)</option>
                <option value="365d">Yearly (Last 12 Months)</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {(loading || analyticsLoading) ? (
            <div className="flex justify-center items-center h-40 sm:h-48">
              <Spinner />
            </div>
          ) : !analyticsData.charts.labels ||
            analyticsData.charts.labels.length === 0 ? (
            <div
              className="h-40 sm:h-48 flex items-center justify-center"
              style={{
                backgroundColor: "var(--bg-surface-alt)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div className="text-center">
                <FaChartLine className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No sales data available for selected period
                </p>
              </div>
            </div>
          ) : (
            <div className="h-40 sm:h-48">
              <Bar data={salesChartData} options={salesChartOptions} />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Order Analytics Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
              Order Analytics ({getTimeframeLabel()})
            </h3>
            <Link
              to="./orders"
              className="text-sm font-medium"
              style={{
                color: "var(--color-secondary)",
                transition: "color var(--transition-fast)",
              }}
            >
              View Orders
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {(loading || analyticsLoading) ? (
            <div className="flex justify-center items-center h-40 sm:h-48">
              <Spinner />
            </div>
          ) : analyticsData.orders.total === 0 ? (
            <div
              className="h-40 sm:h-48 flex items-center justify-center"
              style={{
                backgroundColor: "var(--bg-surface-alt)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div className="text-center">
                <FaShoppingCart className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No order data available</p>
              </div>
            </div>
          ) : (
            <div className="h-40 sm:h-48">
              <Bar
                data={orderAnalyticsChartData}
                options={orderAnalyticsChartOptions}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Recent Transactions */}
      <Card className="recent-transactions">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
              Recent Transactions
            </h3>
            <Link
              to="./wallet"
              className="text-sm font-medium"
              style={{
                color: "var(--color-secondary)",
                transition: "color var(--transition-fast)",
              }}
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Spinner />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
              <FaWallet className="mx-auto h-12 w-12 mb-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                No transactions
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                You don't have any wallet transactions yet.
              </p>
            </div>
          ) : (
            <div className="max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3"
                    style={{
                      backgroundColor: "var(--bg-surface-alt)",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize text-sm" style={{ color: "var(--text-primary)" }}>
                          {transaction.type}
                        </span>
                        <Badge
                          variant="subtle"
                          colorScheme={getTransactionStatusColor(
                            transaction.type,
                          )}
                          size="xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {transaction.description}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {formatAmount(transaction.amount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
