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
  FaUserTie,
  FaUserShield,
  FaUserCheck,
  FaUserCog,
  FaCrown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Card, CardHeader, CardBody, Button, Badge } from "../../design-system";
import {
  userService,
  type DashboardStats,
} from "../../services/user.service";
import { StatCard } from "../../design-system";

const quickLinks = [
  {
    to: "/superadmin/users",
    label: "Manage Users",
    icon: (
      <FaUsers
        className="text-xl sm:text-2xl"
        style={{ color: "var(--color-primary)" }}
      />
    ),
  },
  {
    to: "/superadmin/packages",
    label: "Manage Packages & Providers",
     icon: <FaBox className="text-xl sm:text-2xl" style={{ color: "var(--warning)" }} />,
  },
  {
    to: "/superadmin/orders",
    label: "View Orders",
    icon: <FaClipboardList className="text-[var(--warning)] text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/wallet/top-ups",
    label: "Wallet & Transactions",
    icon: <FaWallet className="text-[var(--accent)] text-xl sm:text-2xl" />,
  },
  {
    to: "/superadmin/settings",
    label: "Settings",
    icon: <FaCog className="text-[var(--text-muted)] text-xl sm:text-2xl" />,
  },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // User type carousel data
  const userTypeCarousel = [
    {
      key: "agents",
      label: "Active Agents",
      icon: <FaUserTie className="text-white text-sm sm:text-lg lg:text-xl" />,
    },
    {
      key: "super_agents",
      label: "Super Agents",
      icon: (
        <FaUserShield className="text-white text-sm sm:text-lg lg:text-xl" />
      ),
    },
    {
      key: "dealers",
      label: "Dealers",
      icon: (
        <FaUserCheck className="text-white text-sm sm:text-lg lg:text-xl" />
      ),
    },
    {
      key: "super_dealers",
      label: "Super Dealers",
      icon: <FaUserCog className="text-white text-sm sm:text-lg lg:text-xl" />,
    },
    {
      key: "elite_dealers",
      label: "Elite Dealers",
      icon: <FaUserCog className="text-white text-sm sm:text-lg lg:text-xl" />,
    },
    {
      key: "master_dealers",
      label: "Master Dealers",
      icon: <FaUserCog className="text-white text-sm sm:text-lg lg:text-xl" />,
    },
    {
      key: "super_admins",
      label: "Super Admins",
      icon: <FaCrown className="text-white text-sm sm:text-lg lg:text-xl" />,
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
    }, 5000); // Change every 5 seconds

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  if (error && !stats) {
    return (
      <div className="text-center py-8">
        <div className="text-[var(--error)] mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      {/* Today's Snapshot */}
      {loadingStats ? (
        <Card className="animate-pulse">
          <CardBody>
            <div className="h-5 bg-[var(--bg-surface-alt)] rounded w-40 mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-[var(--bg-surface-alt)] rounded w-20 mb-2"></div>
                  <div className="h-7 bg-[var(--bg-surface-alt)] rounded w-14 mb-1"></div>
                  <div className="h-2 bg-[var(--bg-surface-alt)] rounded w-24"></div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : stats ? (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
                Today's Snapshot
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {/* Orders Today */}
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Orders Today</p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-primary)" }}>
                  {stats.orders.today.total}
                </p>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                  {stats.orders.today.completed > 0 && (
                    <span className="text-[10px] text-[var(--success)]">{stats.orders.today.completed} completed</span>
                  )}
                  {stats.orders.today.pending > 0 && (
                    <span className="text-[10px] text-[var(--warning)]">{stats.orders.today.pending} pending</span>
                  )}
                  {stats.orders.today.processing > 0 && (
                    <span className="text-[10px] text-[var(--color-secondary)]">{stats.orders.today.processing} processing</span>
                  )}
                  {stats.orders.today.failed > 0 && (
                    <span className="text-[10px] text-[var(--error)]">{stats.orders.today.failed} failed</span>
                  )}
                  {stats.orders.today.cancelled > 0 && (
                    <span className="text-[10px] text-[var(--text-muted)]">{stats.orders.today.cancelled} cancelled</span>
                  )}
                  {stats.orders.today.total === 0 && (
                    <span className="text-[10px] text-[var(--text-muted)]">No orders yet</span>
                  )}
                </div>
              </div>
              {/* Revenue Today */}
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Revenue Today</p>
                <p className="text-2xl sm:text-3xl font-bold text-[var(--success)]">
                  {formatCurrency(stats.revenue.today)}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  This month: {formatCurrency(stats.revenue.thisMonth)}
                </p>
              </div>
              {/* New Users */}
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">New Users This Week</p>
                <p className="text-2xl sm:text-3xl font-bold text-[var(--color-secondary)]">
                  {stats.users.newThisWeek}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  {stats.users.total} total users
                </p>
              </div>
              {/* Platform Health */}
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-1">Success Rate</p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: stats.orders.successRate >= 90 ? "var(--success)" : stats.orders.successRate >= 70 ? "var(--warning)" : "var(--error)" }}>
                  {stats.orders.successRate}%
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  {stats.orders.completed.toLocaleString()} of {stats.orders.total.toLocaleString()} orders
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Key Metrics */}
      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <StatCard
            title="Total Users"
            value={stats.users.total.toLocaleString()}
            subtitle={`+${stats.users.newThisWeek} this week`}
            icon={<FaUsers />}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue.total)}
            subtitle={`${formatCurrency(stats.revenue.total)} total`}
            icon={<FaMoneyBillWave />}
          />
          <StatCard
            title="Total Orders"
            value={stats.orders.total.toLocaleString()}
            subtitle={`${stats.orders.successRate}% success rate`}
            icon={<FaClipboardList />}
          />
          {/* User Type Carousel */}
          <Card style={{ background: "var(--gradient-brand-dark)" }}>
            <CardBody>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() =>
                    setCarouselIndex(
                      (prev) =>
                        (prev - 1 + userTypeCarousel.length) %
                        userTypeCarousel.length
                    )
                  }
                  className="p-1 sm:p-1.5 transition-colors"
                  style={{ color: "var(--text-inverse)", opacity: 0.7 }}
                  aria-label="Previous user type"
                >
                  <FaChevronLeft size={14} />
                </button>
                <div className="flex-1 text-center min-w-0">
                  <p
                    className="text-[10px] xs:text-xs sm:text-sm font-medium mb-0.5 truncate"
                    style={{ color: "var(--text-inverse)", opacity: 0.6 }}
                  >
                    {userTypeCarousel[carouselIndex].label}
                  </p>
                  <p
                    className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight truncate"
                    style={{ color: "var(--text-inverse)" }}
                  >
                    {getUserTypeCount(userTypeCarousel[carouselIndex].key)}
                  </p>
                  <p
                    className="text-[9px] xs:text-xs truncate"
                    style={{ color: "var(--text-inverse)", opacity: 0.5 }}
                  >
                    total {userTypeCarousel[carouselIndex].label.toLowerCase()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setCarouselIndex(
                      (prev) => (prev + 1) % userTypeCarousel.length
                    )
                  }
                  className="p-1 sm:p-1.5 transition-colors"
                  style={{ color: "var(--text-inverse)", opacity: 0.7 }}
                  aria-label="Next user type"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
              <div className="flex justify-center mt-2 sm:mt-3 space-x-1.5">
                {userTypeCarousel.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCarouselIndex(index)}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-200"
                    style={{
                      backgroundColor: index === carouselIndex
                        ? "var(--text-inverse)"
                        : "color-mix(in srgb, var(--text-inverse) 30%, transparent)",
                    }}
                    aria-label={`Go to ${userTypeCarousel[index].label}`}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
          <StatCard
            title="Active Providers"
            value={stats.providers.active}
            subtitle={`${stats.providers.newThisMonth} new this month`}
            icon={<FaBuilding />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse" style={{ background: "var(--gradient-brand-dark)" }}>
              <CardBody>
                <div className="h-3 bg-white/20 rounded w-16 mb-2"></div>
                <div className="h-6 bg-white/20 rounded w-12 mb-1"></div>
                <div className="h-2 bg-white/20 rounded w-20"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

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
                className="flex flex-col items-center gap-2 p-3 bg-[var(--bg-surface-alt)] rounded-lg hover:bg-[var(--bg-surface-alt)] transition-colors text-center"
              >
                {link.icon}
                <span className="font-medium text-xs">{link.label}</span>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Analytics Summary */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Analytics Summary
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)", maxWidth: "32rem" }}>
              A quick overview of your top business KPIs. See the full analytics
              dashboard for detailed trends and breakdowns.
            </p>
          </div>
          <Link
            to="/superadmin/analytics"
            className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
            }}
          >
            See more
          </Link>
        </div>
      </div>

      {/* Analytics Details */}
      {loadingStats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="animate-pulse">
            <CardBody>
              <div className="h-6 bg-[var(--bg-surface-alt)] rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-[var(--bg-surface-alt)] rounded w-24"></div>
                    <div className="h-4 bg-[var(--bg-surface-alt)] rounded w-12"></div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
          <Card className="animate-pulse">
            <CardBody>
              <div className="h-6 bg-[var(--bg-surface-alt)] rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-[var(--bg-surface-alt)] rounded w-24"></div>
                    <div className="h-4 bg-[var(--bg-surface-alt)] rounded w-12"></div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Order Statistics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaClipboardList style={{ color: "var(--warning)" }} />
                Order Statistics
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Completed Orders</span>
                  <Badge colorScheme="success" size="sm">{stats.orders.completed}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Pending Orders</span>
                  <Badge colorScheme="warning" size="sm">{stats.orders.pending}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Failed Orders</span>
                  <Badge colorScheme="error" size="sm">{stats.orders.failed}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Total Orders</span>
                  <span className="font-medium">{stats.orders.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Success Rate</span>
                  <Badge colorScheme="success" size="sm">{stats.orders.successRate}%</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Revenue Statistics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaMoneyBillWave style={{ color: "var(--success)" }} />
                Revenue Statistics
              </h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Total Revenue</span>
                  <span className="font-medium" style={{ color: "var(--success)" }}>
                    {formatCurrency(stats.revenue.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Avg Order Value</span>
                  <span className="font-medium">
                    {formatCurrency(stats.revenue.averageOrderValue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Total Providers</span>
                  <span className="font-medium">{stats.providers.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>Active Providers</span>
                  <Badge colorScheme="success" size="sm">{stats.providers.active}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>New This Month</span>
                  <span className="font-medium">{stats.providers.newThisMonth}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
