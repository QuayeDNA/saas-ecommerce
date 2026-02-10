import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../hooks";
import { useOrder } from "../contexts/OrderContext";
import { useProvider } from "../hooks/use-provider";
import { useSiteStatus } from "../contexts/site-status-context";
import { orderService } from "../services/order.service";
import { Card, CardHeader, CardBody, Badge, Spinner } from "../design-system";
import {
  FaPhone,
  FaWallet,
  FaShoppingCart,
  FaStar,
  FaTimes,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import type { WalletTransaction } from "../types/wallet";
import type { Order } from "../types/order";
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
  BarElement
);

// Define the 4 specific packages that should be displayed
const quickActionPackages = [
  {
    name: "MTN",
    code: "MTN",
    providerCode: "MTN",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    name: "TELECEL",
    code: "TELECEL",
    providerCode: "TELECEL",
    color: "bg-red-500",
    bgColor: "bg-red-50",
  },
  {
    name: "AT BIG TIME",
    code: "AT-BIG-TIME",
    providerCode: "AT",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    name: "AT iShare Premium",
    code: "AT-ISHARE-PREMIUM",
    providerCode: "AT",
    color: "bg-purple-600",
    bgColor: "bg-purple-50",
  },
];

export const DashboardPage = () => {
  const { getTransactionHistory } = useWallet();
  const { getAgentAnalytics } = useOrder();
  const { providers, loading: providersLoading } = useProvider();
  const { siteStatus } = useSiteStatus();

  // State for modals and data
  const [recentTransactions, setRecentTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [analyticsData, setAnalyticsData] = useState({
    orders: {
      total: 0,
      completed: 0,
      pending: 0,
      processing: 0,
      confirmed: 0,
      failed: 0,
      cancelled: 0,
      partiallyCompleted: 0,
      successRate: 0,
      todayCounts: {
        total: 0,
        completed: 0,
        pending: 0,
        processing: 0,
        confirmed: 0,
        failed: 0,
        cancelled: 0,
        partiallyCompleted: 0,
      },
    },
    revenue: {
      total: 0,
      today: 0,
      orderCount: 0,
      averageOrderValue: 0,
    },
    commissions: {
      totalCommission: 0,
      paidCommission: 0,
      pendingCommission: 0,
      commissionCount: 0,
    },
    wallet: {
      balance: 0,
    },
    charts: {
      labels: [] as string[],
      orders: [] as number[],
      revenue: [] as number[],
      completedOrders: [] as number[],
    },
  });
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  const [showSiteMessage, setShowSiteMessage] = useState(true);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [activeOrdersLoading, setActiveOrdersLoading] = useState(true);

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

  // Get site status color
  const getSiteStatusColor = () => {
    return siteStatus?.isSiteOpen ? "text-green-600" : "text-red-600";
  };

  // Get site status background
  const getSiteStatusBg = () => {
    return siteStatus?.isSiteOpen ? "bg-green-50" : "bg-red-50";
  };

  // Handle quick link click
  const handleQuickLinkClick = (packageCode: string) => {
    navigate(`./packages/${packageCode.toLowerCase()}`);
  };

  // Get provider logo by provider code
  const getProviderLogo = (providerCode: string) => {
    const provider = providers.find((p) => p.code === providerCode);
    return provider?.logo;
  };

  // Get package with provider logo
  const getPackagesWithLogos = () => {
    return quickActionPackages.map((packageItem) => {
      const providerLogo = getProviderLogo(packageItem.providerCode);
      return {
        ...packageItem,
        logo: providerLogo,
      };
    });
  };

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

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load recent transactions (last 5)
        const transactionData = await getTransactionHistory(1, 5);
        if (transactionData) {
          setRecentTransactions(transactionData.transactions);
        }

        // Load agent analytics
        try {
          const analytics = await getAgentAnalytics("30d");
          if (analytics) {
            // Use the AgentAnalyticsData shape directly from the backend
            const data = analytics as {
              orders: {
                total: number;
                completed: number;
                pending: number;
                processing: number;
                confirmed: number;
                failed: number;
                cancelled: number;
                partiallyCompleted: number;
                successRate: number;
                todayCounts: {
                  total: number;
                  completed: number;
                  pending: number;
                  processing: number;
                  confirmed: number;
                  failed: number;
                  cancelled: number;
                  partiallyCompleted: number;
                };
              };
              revenue: {
                total: number;
                today: number;
                thisMonth: number;
                orderCount: number;
                averageOrderValue: number;
              };
              commissions: {
                totalCommission: number;
                paidCommission: number;
                pendingCommission: number;
                commissionCount: number;
              };
              wallet: {
                balance: number;
              };
              charts: {
                labels: string[];
                orders: number[];
                revenue: number[];
                completedOrders: number[];
              };
            };

            setAnalyticsData({
              orders: {
                total: data.orders?.total || 0,
                completed: data.orders?.completed || 0,
                pending: data.orders?.pending || 0,
                processing: data.orders?.processing || 0,
                confirmed: data.orders?.confirmed || 0,
                failed: data.orders?.failed || 0,
                cancelled: data.orders?.cancelled || 0,
                partiallyCompleted: data.orders?.partiallyCompleted || 0,
                successRate: data.orders?.successRate || 0,
                todayCounts: {
                  total: data.orders?.todayCounts?.total || 0,
                  completed: data.orders?.todayCounts?.completed || 0,
                  pending: data.orders?.todayCounts?.pending || 0,
                  processing: data.orders?.todayCounts?.processing || 0,
                  confirmed: data.orders?.todayCounts?.confirmed || 0,
                  failed: data.orders?.todayCounts?.failed || 0,
                  cancelled: data.orders?.todayCounts?.cancelled || 0,
                  partiallyCompleted: data.orders?.todayCounts?.partiallyCompleted || 0,
                },
              },
              revenue: {
                total: data.revenue?.total || 0,
                today: data.revenue?.today || 0,
                orderCount: data.revenue?.orderCount || 0,
                averageOrderValue: data.revenue?.averageOrderValue || 0,
              },
              commissions: {
                totalCommission: data.commissions?.totalCommission || 0,
                paidCommission: data.commissions?.paidCommission || 0,
                pendingCommission: data.commissions?.pendingCommission || 0,
                commissionCount: data.commissions?.commissionCount || 0,
              },
              wallet: {
                balance: data.wallet?.balance || 0,
              },
              charts: {
                labels: data.charts?.labels || [],
                orders: data.charts?.orders || [],
                revenue: data.charts?.revenue || [],
                completedOrders: data.charts?.completedOrders || [],
              },
            });
          } else {
            // Set default values if analytics fails
            setAnalyticsData({
              orders: {
                total: 0,
                completed: 0,
                pending: 0,
                processing: 0,
                confirmed: 0,
                failed: 0,
                cancelled: 0,
                partiallyCompleted: 0,
                successRate: 0,
                todayCounts: {
                  total: 0,
                  completed: 0,
                  pending: 0,
                  processing: 0,
                  confirmed: 0,
                  failed: 0,
                  cancelled: 0,
                  partiallyCompleted: 0,
                },
              },
              revenue: {
                total: 0,
                today: 0,
                orderCount: 0,
                averageOrderValue: 0,
              },
              commissions: {
                totalCommission: 0,
                paidCommission: 0,
                pendingCommission: 0,
                commissionCount: 0,
              },
              wallet: { balance: 0 },
              charts: {
                labels: [],
                orders: [],
                revenue: [],
                completedOrders: [],
              },
            });
          }
        } catch (analyticsError) {
          console.error("Analytics error:", analyticsError);
          // Set default values if analytics fails
          setAnalyticsData({
            orders: {
              total: 0,
              completed: 0,
              pending: 0,
              processing: 0,
              confirmed: 0,
              failed: 0,
              cancelled: 0,
              partiallyCompleted: 0,
              successRate: 0,
              todayCounts: {
                total: 0,
                completed: 0,
                pending: 0,
                processing: 0,
                confirmed: 0,
                failed: 0,
                cancelled: 0,
                partiallyCompleted: 0,
              },
            },
            revenue: {
              total: 0,
              today: 0,
              orderCount: 0,
              averageOrderValue: 0,
            },
            commissions: {
              totalCommission: 0,
              paidCommission: 0,
              pendingCommission: 0,
              commissionCount: 0,
            },
            wallet: { balance: 0 },
            charts: {
              labels: [],
              orders: [],
              revenue: [],
              completedOrders: [],
            },
          });
        }
      } catch (error) {
        console.error("Dashboard data loading error:", error);
        // Failed to load dashboard data
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [getTransactionHistory, getAgentAnalytics]);

  // Fetch active (pending/processing/confirmed) orders
  useEffect(() => {
    const loadActiveOrders = async () => {
      try {
        setActiveOrdersLoading(true);
        // Fetch pending orders first, then processing, then confirmed
        const [pendingRes, processingRes, confirmedRes] = await Promise.all([
          orderService.getOrders({ status: "pending" }, { limit: 5, page: 1, sortBy: "createdAt", sortOrder: "desc" }),
          orderService.getOrders({ status: "processing" }, { limit: 5, page: 1, sortBy: "createdAt", sortOrder: "desc" }),
          orderService.getOrders({ status: "confirmed" }, { limit: 5, page: 1, sortBy: "createdAt", sortOrder: "desc" }),
        ]);

        // Combine, sort by createdAt desc, take first 5
        const combined = [
          ...pendingRes.orders,
          ...processingRes.orders,
          ...confirmedRes.orders,
        ]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
      case "pending": return "warning";
      case "processing": return "info";
      case "confirmed": return "success";
      default: return "default";
    }
  };

  // Prepare order analytics chart data - Order completion trends
  const prepareOrderAnalyticsChartData = () => {
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
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)", // Blue for total
            "rgba(34, 197, 94, 0.8)", // Green for completed
            "rgba(251, 191, 36, 0.8)", // Yellow for pending
          ],
          borderColor: [
            "rgb(59, 130, 246)",
            "rgb(34, 197, 94)",
            "rgb(251, 191, 36)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const orderAnalyticsChartData = prepareOrderAnalyticsChartData();

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
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6">
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
          <Card className="backdrop-blur-md border border-white/30 shadow-xl p-4">
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-full ${getSiteStatusBg()} ${getSiteStatusColor()}`}
                >
                  <FaStar className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-gray-700">
                    {getSiteMessage()}
                  </p>
                </div>
                <button
                  onClick={() => setShowSiteMessage(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/20 rounded-full transition-all duration-200"
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
          <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
            <FaClock className="text-orange-500" />
            Active Orders
          </h2>
          <Link
            to="./orders"
            className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all duration-200"
            style={{ color: "var(--color-primary-600)" }}
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
              <FaShoppingCart className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No active orders</p>
              <p className="text-xs text-gray-400 mt-1">All your orders are completed or you haven't placed any yet</p>
            </CardBody>
          </Card>
        ) : (
          <div className="max-h-[136px] overflow-y-auto pr-1 scrollbar-thin">
            <div className="space-y-2">
              {activeOrders.map((order) => (
                <Link
                  key={order._id}
                  to={`./orders`}
                  className="block"
                >
                  <Card variant="interactive" size="sm" className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm text-gray-900 truncate">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""} · {getTimeAgo(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="subtle"
                            colorScheme={getOrderStatusColor(order.status) as "warning" | "info" | "success" | "default"}
                            size="xs"
                          >
                            {order.status}
                          </Badge>
                          <span className="font-semibold text-sm text-gray-900">
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
              <p className="text-[10px] text-gray-400 text-center mt-1">Scroll for more ({activeOrders.length} orders)</p>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="text-lg font-medium text-gray-800 mb-3 px-2 sm:px-0">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8">
              <Spinner />
              <p className="text-gray-500 text-sm mt-2">Loading providers...</p>
            </div>
          ) : providersLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8">
              <Spinner />
              <p className="text-sm text-gray-500 mt-2">
                Loading provider data...
              </p>
            </div>
          ) : getPackagesWithLogos().length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No providers found
              </h3>
              <p className="text-sm text-gray-500">
                Please add providers in the settings to see quick links.
              </p>
            </div>
          ) : (
            getPackagesWithLogos().map((packageItem) => (
              <Card
                key={packageItem.code}
                variant="interactive"
                size="sm"
                className="cursor-pointer"
                onClick={() => handleQuickLinkClick(packageItem.code)}
              >
                <CardBody className="text-center">
                  <div
                    className={`${packageItem.color} text-white rounded-full mx-auto mb-2 w-12 h-12 flex items-center justify-center overflow-hidden`}
                  >
                    {packageItem.logo?.url &&
                    !failedLogos.has(packageItem.code) ? (
                      <img
                        src={packageItem.logo.url}
                        alt={packageItem.logo.alt || packageItem.name}
                        className="w-12 h-12 object-cover rounded-full"
                        onError={() => {
                          setFailedLogos((prev) =>
                            new Set(prev).add(packageItem.code)
                          );
                        }}
                      />
                    ) : (
                      <FaPhone className="w-6 h-6" />
                    )}
                  </div>
                  <div className="font-semibold text-sm">
                    {packageItem.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Order data</div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="account-overview">
        <h2 className="text-lg font-medium text-gray-800 mb-3 px-2 sm:px-0">
          Account Overview
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card
            size="sm"
            style={{
              backgroundColor: "var(--color-primary-500)",
              borderColor: "var(--color-primary-600)",
            }}
          >
            <CardBody className="text-center">
              <div className="text-gray-300 text-xs mb-1">
                Total Orders Today
              </div>
              <div className="text-xl font-bold text-white">
                {analyticsData.orders.todayCounts.total}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Total: {analyticsData.orders.total}
              </div>
            </CardBody>
          </Card>
          <Card
            size="sm"
            style={{
              backgroundColor: "var(--color-primary-500)",
              borderColor: "var(--color-primary-600)",
            }}
          >
            <CardBody className="text-center">
              <div className="text-gray-300 text-xs mb-1">Today's Spending</div>
              <div className="text-3xl font-bold text-white">
                ₵{analyticsData.revenue.today.toFixed(2)}
              </div>
            </CardBody>
          </Card>
          <Card
            size="sm"
            style={{
              backgroundColor: "var(--color-primary-500)",
              borderColor: "var(--color-primary-600)",
            }}
          >
            <CardBody className="text-center">
              <div className="text-gray-300 text-xs mb-1">
                Total Sales Today
              </div>
              <div className="text-xl font-bold text-white">
                ₵{analyticsData.revenue.today.toFixed(2)}
              </div>
            </CardBody>
          </Card>
          <Card
            size="sm"
            style={{
              backgroundColor: "var(--color-primary-500)",
              borderColor: "var(--color-primary-600)",
            }}
          >
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className="text-gray-300 text-xs">
                  Commission Earned This Month
                </div>
              </div>
              <div className="text-xl font-bold text-white">
                ₵{(analyticsData.commissions.totalCommission || 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-300 mt-2">
                Paid: ₵{(analyticsData.commissions.paidCommission || 0).toFixed(2)}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Order Analytics Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">
              Order Analytics (Last 30 Days)
            </h3>
            <Link
              to="./orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Orders
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-40 sm:h-48">
              <Spinner />
            </div>
          ) : analyticsData.orders.total === 0 ? (
            <div className="bg-gray-50 h-40 sm:h-48 flex items-center justify-center rounded">
              <div className="text-center">
                <FaShoppingCart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No order data available</p>
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
            <h3 className="text-lg font-medium text-gray-800">
              Recent Transactions
            </h3>
            <Link
              to="./wallet"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
            <div className="text-center py-8 text-gray-500">
              <FaWallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                No transactions
              </h3>
              <p className="text-sm text-gray-500">
                You don't have any wallet transactions yet.
              </p>
            </div>
          ) : (
            <div className="max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize text-sm">
                          {transaction.type}
                        </span>
                        <Badge
                          variant="subtle"
                          colorScheme={getTransactionStatusColor(
                            transaction.type
                          )}
                          size="xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
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
