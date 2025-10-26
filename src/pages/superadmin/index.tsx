import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaBuilding,
  FaClipboardList,
  FaWallet,
  FaCog,
  FaMoneyBillWave,
  FaBox,
  FaChartLine,
  FaUserTie,
  FaUserShield,
  FaUserCheck,
  FaUserCog,
  FaCrown,
} from "react-icons/fa";
import { Card, CardHeader, CardBody, Button, Badge } from "../../design-system";
import {
  userService,
  type DashboardStats,
  type ChartData,
} from "../../services/user.service";
import { colors } from "../../design-system/tokens";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const quickLinks = [
  {
    to: "/superadmin/users",
    label: "Manage Users",
    icon: <FaUsers className="text-blue-600 text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/providers",
    label: "Manage Providers",
    icon: <FaBuilding className="text-green-600 text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/packages",
    label: "Manage Packages",
    icon: <FaBox className="text-orange-600 text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/orders",
    label: "View Orders",
    icon: <FaClipboardList className="text-yellow-600 text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/wallet",
    label: "Wallet & Transactions",
    icon: <FaWallet className="text-purple-600 text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/settings",
    label: "Settings",
    icon: <FaCog className="text-gray-600 text-xl sm:text-2xl" />,
  },
];

// Skeleton loading components
const MetricCardSkeleton = () => (
  <Card className="animate-pulse bg-[#142850] border-[#0f1f3a]">
    <CardBody className="p-4 sm:p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-20"></div>
        </div>
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>
    </CardBody>
  </Card>
);

const ChartSkeleton = () => (
  <Card className="animate-pulse">
    <CardBody>
      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="h-80 bg-gray-200 rounded"></div>
    </CardBody>
  </Card>
);

const StatsCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardBody>
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
);

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // User type carousel data
  const userTypeCarousel = [
    {
      key: "agents",
      label: "Active Agents",
      icon: <FaUserTie className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      key: "super_agents",
      label: "Super Agents",
      icon: (
        <FaUserShield className="text-white text-sm sm:text-lg lg:text-xl" />
      ),
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      key: "dealers",
      label: "Dealers",
      icon: (
        <FaUserCheck className="text-white text-sm sm:text-lg lg:text-xl" />
      ),
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      key: "super_dealers",
      label: "Super Dealers",
      icon: <FaUserCog className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
    {
      key: "super_admins",
      label: "Super Admins",
      icon: <FaCrown className="text-white text-sm sm:text-lg lg:text-xl" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
  ];

  const getUserTypeCount = (key: string): number => {
    if (!stats?.users?.byType) return 0;
    return (stats.users.byType as Record<string, number>)[key] || 0;
  };

  // Carousel timer
  useEffect(() => {
    if (!stats) return;

    const interval = setInterval(() => {
      setCarouselIndex(
        (prevIndex) => (prevIndex + 1) % userTypeCarousel.length
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [stats, userTypeCarousel.length]);

  // Load stats first (faster to load)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setError(null);
        const statsData = await userService.fetchDashboardStats();
        setStats(statsData);
      } catch {
        setError("Failed to load dashboard stats");
        // Stats error
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Load charts after stats (heavier data)
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        setLoadingCharts(true);
        const chartDataResponse = await userService.fetchChartData();
        setChartData(chartDataResponse);
      } catch {
        // Chart data error
        // Don't set error for charts as they're not critical
      } finally {
        setLoadingCharts(false);
      }
    };

    // Small delay to prioritize stats loading
    const timer = setTimeout(fetchCharts, 100);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "active":
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "failed":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  // Chart configurations
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
        },
      },
      y: {
        beginAtZero: true,
        min: 0, // Ensure no negative values
        suggestedMin: 0, // Additional safeguard
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  const createLineChartData = (
    labels: string[],
    userData: number[],
    orderData: number[],
    revenueData: number[]
  ) => ({
    labels,
    datasets: [
      {
        label: "User Registrations",
        data: userData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Orders",
        data: orderData,
        borderColor: "rgb(245, 158, 11)",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Revenue (GHS)",
        data: revenueData,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  });

  const createPieChartData = (
    labels: string[],
    data: number[],
    colors: string[]
  ) => ({
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: colors.map((color) => color.replace("0.8", "1")),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  });

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Check if chart data has meaningful values
  const hasChartData =
    chartData &&
    (chartData.userRegistrations.some((val) => val > 0) ||
      chartData.orders.some((val) => val > 0) ||
      chartData.revenue.some((val) => val > 0));

  const hasPieChartData =
    chartData &&
    (chartData.orderStatus.completed > 0 ||
      chartData.orderStatus.pending > 0 ||
      chartData.orderStatus.failed > 0);

  // Filter out negative values from chart data and ensure all values are non-negative
  const sanitizedChartData = chartData
    ? {
        ...chartData,
        userRegistrations: chartData.userRegistrations.map((val) =>
          Math.max(0, val || 0)
        ),
        orders: chartData.orders.map((val) => Math.max(0, val || 0)),
        revenue: chartData.revenue.map((val) => Math.max(0, val || 0)),
      }
    : null;

  if (error && !stats) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardBody className="text-center sm:text-left">
          <h1
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: colors.brand.primary }}
          >
            Welcome, Super Admin!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Platform overview and analytics dashboard
          </p>
        </CardBody>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {loadingStats ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : stats ? (
          <>
            {/* Total Users */}
            <Card className="bg-[#142850] border-[#0f1f3a] hover:bg-[#1a2f5a] transition-colors duration-200">
              <CardBody className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Total Users
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {stats.users.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-400 mt-1 truncate">
                      +{stats.users.newThisWeek} this week
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaUsers className="text-white text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Total Revenue */}
            <Card className="bg-[#142850] border-[#0f1f3a] hover:bg-[#1a2f5a] transition-colors duration-200">
              <CardBody className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Total Revenue
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {formatCurrency(stats.revenue.total)}
                    </p>
                    <p className="text-xs text-green-400 mt-1 truncate">
                      +{formatCurrency(stats.revenue.total)} total
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaMoneyBillWave className="text-white text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Total Orders */}
            <Card className="bg-[#142850] border-[#0f1f3a] hover:bg-[#1a2f5a] transition-colors duration-200">
              <CardBody className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Total Orders
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {stats.orders.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-400 mt-1 truncate">
                      {stats.orders.successRate}% success rate
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaClipboardList className="text-white text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* User Types Carousel */}
            <Card className="bg-[#142850] border-[#0f1f3a] hover:bg-[#1a2f5a] transition-colors duration-200 relative overflow-hidden">
              <CardBody className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      {userTypeCarousel[carouselIndex].label}
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {getUserTypeCount(userTypeCarousel[carouselIndex].key)}
                    </p>
                    <p
                      className={`text-xs mt-1 truncate ${userTypeCarousel[carouselIndex].color}`}
                    >
                      {getUserTypeCount(userTypeCarousel[carouselIndex].key)}{" "}
                      total
                    </p>
                  </div>
                  <div
                    className={`p-2 sm:p-2.5 md:p-3 lg:p-4 ${userTypeCarousel[carouselIndex].bgColor} rounded-full flex-shrink-0 flex items-center justify-center`}
                  >
                    {userTypeCarousel[carouselIndex].icon}
                  </div>
                </div>
                {/* Carousel Indicators */}
                <div className="flex justify-center mt-2 sm:mt-3 space-x-1">
                  {userTypeCarousel.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarouselIndex(index)}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-200 ${
                        index === carouselIndex ? "bg-white" : "bg-white/30"
                      }`}
                      aria-label={`Go to ${userTypeCarousel[index].label}`}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Total Commissions */}
            <Card className="bg-[#142850] border-[#0f1f3a] hover:bg-[#1a2f5a] transition-colors duration-200">
              <CardBody className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Total Commissions
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {formatCurrency(stats.commissions.totalPaid)}
                    </p>
                    <p className="text-xs text-yellow-400 mt-1 truncate">
                      {stats.commissions.pendingCount} pending
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaMoneyBillWave className="text-white text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Active Providers */}
            <Card className="bg-[#142850] border-[#0f1f3a] hover:bg-[#1a2f5a] transition-colors duration-200">
              <CardBody className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-300 mb-1 truncate">
                      Active Providers
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight truncate">
                      {stats.providers.active}
                    </p>
                    <p className="text-xs text-indigo-400 mt-1 truncate">
                      {stats.providers.newThisMonth} new this month
                    </p>
                  </div>
                  <div className="p-2 sm:p-2.5 md:p-3 lg:p-4 bg-white/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <FaBuilding className="text-white text-sm sm:text-base md:text-lg lg:text-xl" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        ) : null}
      </div>

      {/* Quick Actions - Mobile-first design */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                {link.icon}
                <span className="font-medium text-xs">{link.label}</span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Charts Section */}
      {loadingCharts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : chartData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Line Chart - Activity Over Time */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaChartLine className="text-blue-600" />
                Activity Over Time (Last 30 Days)
              </h3>
            </CardHeader>
            <CardBody>
              {hasChartData ? (
                <div className="h-auto">
                  <Line
                    options={lineChartOptions}
                    data={createLineChartData(
                      sanitizedChartData!.labels,
                      sanitizedChartData!.userRegistrations,
                      sanitizedChartData!.orders,
                      sanitizedChartData!.revenue
                    )}
                  />
                </div>
              ) : (
                <div className="h-60 sm:h-80 flex items-center justify-center">
                  <div className="text-center">
                    <FaChartLine className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      No Activity Data
                    </h3>
                    <p className="text-sm text-gray-500">
                      No activity data available for the selected period.
                    </p>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Pie Charts Row */}
          <div className="space-y-4 sm:space-y-6">
            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  Order Status Distribution
                </h3>
              </CardHeader>
              <CardBody>
                {hasPieChartData ? (
                  <div className="h-60 sm:h-64">
                    <Pie
                      data={createPieChartData(
                        ["Completed", "Pending", "Failed"],
                        [
                          chartData.orderStatus.completed,
                          chartData.orderStatus.pending,
                          chartData.orderStatus.failed,
                        ],
                        [
                          "rgba(34, 197, 94, 0.8)",
                          "rgba(245, 158, 11, 0.8)",
                          "rgba(239, 68, 68, 0.8)",
                        ]
                      )}
                      options={pieChartOptions}
                    />
                  </div>
                ) : (
                  <div className="h-60 sm:h-64 flex items-center justify-center">
                    <div className="text-center">
                      <FaClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        No Order Data
                      </h3>
                      <p className="text-sm text-gray-500">
                        No order status data available.
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Detailed Statistics */}
      {loadingStats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* User Statistics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaUsers className="text-blue-600" />
                User Statistics
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {/* Dynamic User Type Statistics */}
                {stats.users.byType &&
                  Object.entries(stats.users.byType).map(
                    ([userType, count]) => (
                      <div
                        key={userType}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm text-gray-600 capitalize">
                          {userType.replace(/_/g, " ").replace(/s$/, "")}s
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    )
                  )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Verified Users</span>
                  <span className="font-medium">{stats.users.verified}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Agents</span>
                  <Badge colorScheme="warning" size="sm">
                    {stats.users.activeAgents}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Verification Rate
                  </span>
                  <Badge colorScheme="success" size="sm">
                    {stats?.rates?.userVerification ?? 0}%
                  </Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Order Statistics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaClipboardList className="text-yellow-600" />
                Order Statistics
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Completed Orders
                  </span>
                  <Badge colorScheme="success" size="sm">
                    {stats.orders.completed}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Orders</span>
                  <Badge colorScheme="warning" size="sm">
                    {stats.orders.pending}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Failed Orders</span>
                  <Badge colorScheme="error" size="sm">
                    {stats.orders.failed}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-medium">{stats.orders.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <Badge colorScheme="success" size="sm">
                    {stats.orders.successRate}%
                  </Badge>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* Revenue & Provider Stats */}
      {loadingStats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Revenue Statistics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaMoneyBillWave className="text-green-600" />
                Revenue Statistics
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(stats.revenue.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-medium">
                    {formatCurrency(stats.revenue.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Order Value</span>
                  <span className="font-medium">
                    {formatCurrency(stats.revenue.averageOrderValue)}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Provider Statistics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaBuilding className="text-blue-600" />
                Provider Statistics
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Providers</span>
                  <span className="font-medium">{stats.providers.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Active Providers
                  </span>
                  <Badge colorScheme="success" size="sm">
                    {stats.providers.active}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New This Month</span>
                  <span className="font-medium">
                    {stats.providers.newThisMonth}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* Recent Activity */}
      {loadingStats ? (
        <Card className="animate-pulse">
          <CardBody>
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, j) => (
                      <div
                        key={j}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : stats?.recentActivity ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaChartLine className="text-purple-600" />
              Recent Activity
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Recent Users */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Recent Users</h4>
                <div className="space-y-2">
                  {stats.recentActivity.users?.slice(0, 5)?.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Badge
                        variant="subtle"
                        colorScheme={getStatusColor(user.status)}
                        size="xs"
                      >
                        {user.userType}
                      </Badge>
                    </div>
                  )) || []}
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  Recent Orders
                </h4>
                <div className="space-y-2">
                  {stats.recentActivity.orders?.slice(0, 5)?.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                      <Badge
                        variant="subtle"
                        colorScheme={getStatusColor(order.status)}
                        size="xs"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  )) || []}
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">
                  Recent Transactions
                </h4>
                <div className="space-y-2">
                  {stats.recentActivity.transactions
                    ?.slice(0, 5)
                    ?.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {transaction.description || transaction.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        <Badge
                          variant="subtle"
                          colorScheme={getStatusColor(transaction.type)}
                          size="xs"
                        >
                          {transaction.type}
                        </Badge>
                      </div>
                    )) || []}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
