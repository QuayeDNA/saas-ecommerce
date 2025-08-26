import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet, useDailySpending } from '../hooks';
import { useOrder } from '../contexts/OrderContext';
import { useProvider } from '../hooks/use-provider';
import { useSiteStatus } from '../contexts/site-status-context';
import { Card, CardHeader, CardBody, Badge, Spinner } from '../design-system';
import { FaPhone, FaWallet, FaShoppingCart, FaStar, FaTimes } from 'react-icons/fa';
import type { WalletTransaction } from '../types/wallet';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

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
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = fadeInKeyframes;
  document.head.appendChild(style);
}

// Register Chart.js components including Filler and Bar plugins
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement);

// Define the 4 specific packages that should be displayed
const quickActionPackages = [
  {
    name: 'MTN',
    code: 'MTN',
    providerCode: 'MTN',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    name: 'TELECEL',
    code: 'TELECEL',
    providerCode: 'TELECEL',
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
  },
  {
    name: 'AT BIG TIME',
    code: 'AT-BIG-TIME',
    providerCode: 'AT',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'AT iShare Premium',
    code: 'AT-ISHARE-PREMIUM',
    providerCode: 'AT',
    color: 'bg-purple-600',
    bgColor: 'bg-purple-50',
  }
];

export const DashboardPage = () => {
  const { getTransactionHistory} = useWallet();
  const { getAgentAnalytics } = useOrder();
  const { providers, loading: providersLoading } = useProvider();
  const { siteStatus } = useSiteStatus();
  const { dailySpending, orderCount, isLoading: dailySpendingLoading } = useDailySpending();
  
  // State for modals and data
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
  // totalRevenue removed - use overallTotalSales for completed-only overall sales
    overallTotalSales: 0,
    monthlyRevenue: 0,
    monthlyOrderCount: 0,
  month: "",
  monthlyCommission: 0
  });
  const [loading, setLoading] = useState(true);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());
  const [showSiteMessage, setShowSiteMessage] = useState(true);

  const navigate = useNavigate();

  // Auto-hide site message after 1 minute
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSiteMessage(false);
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, []);

  // Get site message
  const getSiteMessage = () => {
    if (!siteStatus) return "";
    return siteStatus.isSiteOpen
      ? "Hi! We are currently open for business! 🎉"
      : "Sorry, store is currently closed for business 😔";
  };

  // Get site status color
  const getSiteStatusColor = () => {
    return siteStatus?.isSiteOpen ? 'text-green-600' : 'text-red-600';
  };

  // Get site status background
  const getSiteStatusBg = () => {
    return siteStatus?.isSiteOpen ? 'bg-green-50' : 'bg-red-50';
  };

  // Handle quick link click
  const handleQuickLinkClick = (packageCode: string) => {
    navigate(`./packages/${packageCode.toLowerCase()}`);
  };

  // Get provider logo by provider code
  const getProviderLogo = (providerCode: string) => {
    const provider = providers.find(p => p.code === providerCode);
    return provider?.logo;
  };

  // Get package with provider logo
  const getPackagesWithLogos = () => {
    return quickActionPackages.map(packageItem => {
      const providerLogo = getProviderLogo(packageItem.providerCode);
      return {
        ...packageItem,
        logo: providerLogo
      };
    });
  };

  // Format transaction amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Get transaction status color
  const getTransactionStatusColor = (type: string) => {
    return type === 'credit' ? 'success' : 'error';
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
          type AgentAnalytics = {
            totalOrders?: number;
            completedOrders?: number;
            overallTotalSales?: number;
            monthlyRevenue?: number;
            monthlyOrderCount?: number;
            month?: string;
            monthlyCommission?: number;
          };

          const analytics = (await getAgentAnalytics('30d')) as AgentAnalytics | null;
          if (analytics) {
            const monthlyCommission = analytics.monthlyCommission ?? 0;
            setOrderStats({
              totalOrders: analytics.totalOrders || 0,
              completedOrders: analytics.completedOrders || 0,
              overallTotalSales: analytics.overallTotalSales || 0,
              monthlyRevenue: analytics.monthlyRevenue || 0,
              monthlyOrderCount: analytics.monthlyOrderCount || 0,
              month: analytics.month || "",
              monthlyCommission
            });
          }
        } catch (analyticsError) {
          console.error('Analytics error:', analyticsError);
          // Set default values if analytics fails
          setOrderStats({
            totalOrders: 0,
            completedOrders: 0,
            overallTotalSales: 0,
            monthlyRevenue: 0,
            monthlyOrderCount: 0,
            month: "",
            monthlyCommission: 0
          });
        }
      } catch (error) {
        console.error('Dashboard data loading error:', error);
        // Failed to load dashboard data
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [getTransactionHistory, getAgentAnalytics]);

  // Prepare order analytics chart data - Order completion trends
  const prepareOrderAnalyticsChartData = () => {
    const labels = ['Total Orders', 'Completed', 'Pending'];
    const data = [orderStats.totalOrders, orderStats.completedOrders, orderStats.totalOrders - orderStats.completedOrders];
    
    return {
      labels,
      datasets: [{
        label: 'Orders',
        data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue for total
          'rgba(34, 197, 94, 0.8)',    // Green for completed
          'rgba(251, 191, 36, 0.8)'    // Yellow for pending
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)'
        ],
        borderWidth: 1
      }]
    };
  };

  const orderAnalyticsChartData = prepareOrderAnalyticsChartData();

  const orderAnalyticsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            return `${context.label}: ${context.parsed.y} orders`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Site Status Message - Glassmorphic design */}
      {showSiteMessage && siteStatus && (
        <div 
          className="transform transition-all duration-1000 ease-in-out"
          style={{
            animation: 'fadeIn 0.5s ease-in-out',
            opacity: showSiteMessage ? 1 : 0,
            transform: showSiteMessage ? 'translateY(0)' : 'translateY(-20px)'
          }}
        >
          <Card className="backdrop-blur-md border border-white/30 shadow-xl p-4">
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${getSiteStatusBg()} ${getSiteStatusColor()}`}>
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
              <div className="text-xs text-gray-500">
                This message will automatically disappear in 1 minute
              </div>
            </CardBody>
          </Card>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="text-lg font-medium text-gray-800 mb-3 px-2 sm:px-0">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <Spinner />
              <p className="text-gray-500 text-sm mt-2">Loading providers...</p>
            </div>
          ) : providersLoading ? (
            <div className="col-span-full text-center py-8">
              <Spinner />
              <p className="text-sm text-gray-500 mt-2">Loading provider data...</p>
            </div>
          ) : getPackagesWithLogos().length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <h3 className="text-sm font-medium text-gray-900 mb-2">No providers found</h3>
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
                  <div className={`${packageItem.color} text-white rounded-full mx-auto mb-2 w-12 h-12 flex items-center justify-center overflow-hidden`}>
                    {packageItem.logo?.url && !failedLogos.has(packageItem.code) ? (
                      <img 
                        src={packageItem.logo.url} 
                        alt={packageItem.logo.alt || packageItem.name}
                        className="w-12 h-12 object-cover rounded-full"
                        onError={() => {
                          setFailedLogos(prev => new Set(prev).add(packageItem.code));
                        }}
                      />
                    ) : (
                      <FaPhone className="w-6 h-6" />
                    )}
                  </div>
                  <div className="font-semibold text-sm">{packageItem.name}</div>
                  <div className="text-xs text-gray-600 mt-1">Order data</div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* Stats */}
      <div className="account-overview">
        <h2 className="text-lg font-medium text-gray-800 mb-3 px-2 sm:px-0">Account Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card size="sm" className="bg-[#142850] border-[#0f1f3a]">
            <CardBody className="text-center">
              <div className="text-gray-300 text-xs mb-1">Total Orders</div>
              <div className="text-xl font-bold text-white">{orderStats.totalOrders}</div>
            </CardBody>
          </Card>
          <Card size="sm" className="bg-[#142850] border-[#0f1f3a]">
            <CardBody className="text-center">
              <div className="text-gray-300 text-xs mb-1">Today's Orders</div>
              <div className="text-3xl font-bold text-white">
                {dailySpendingLoading ? (
                  <div className="animate-pulse bg-white/20 h-8 w-12 rounded mx-auto"></div>
                ) : (
                  (typeof orderCount === 'number' ? orderCount : orderStats.totalOrders)
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {dailySpendingLoading ? '' : `₵${dailySpending} spent today`}
              </div>
            </CardBody>
          </Card>
          <Card size="sm" className="bg-[#142850] border-[#0f1f3a]">
            <CardBody className="text-center">
              <div className="text-gray-300 text-xs mb-1">Total Sales</div>
              <div className="text-xl font-bold text-white">₵{orderStats.overallTotalSales}</div>
            </CardBody>
          </Card>
          <Card size="sm" className="bg-[#142850] border-[#0f1f3a]">
            <CardBody className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <div className="text-gray-300 text-xs">Monthly Sales</div>
                <div className="items-center gap-1 hidden sm:flex">
                  <span className="text-white">{orderStats.month ? orderStats.month : ''}</span>
                </div>
              </div>

              <div className="text-xl font-bold text-white">{formatAmount(orderStats.monthlyRevenue)}</div>
              <div className="text-xs text-gray-300 mt-2">Commission: {formatAmount(orderStats.monthlyCommission || 0)}</div>
            </CardBody>
          </Card>
        </div>
      </div>
      
      {/* Order Analytics Chart */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Order Analytics (Last 30 Days)</h3>
            <Link to="./orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Orders
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center h-40 sm:h-48">
              <Spinner />
            </div>
          ) : orderStats.totalOrders === 0 ? (
            <div className="bg-gray-50 h-40 sm:h-48 flex items-center justify-center rounded">
              <div className="text-center">
                <FaShoppingCart className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-400 text-sm">No order data available</p>
              </div>
            </div>
          ) : (
            <div className="h-40 sm:h-48">
              <Bar data={orderAnalyticsChartData} options={orderAnalyticsChartOptions} />
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* Recent Transactions */}
      <Card className="recent-transactions">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
            <Link to="./wallet" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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
              <h3 className="text-sm font-medium text-gray-900 mb-2">No transactions</h3>
              <p className="text-sm text-gray-500">
                You don't have any wallet transactions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize text-sm">{transaction.type}</span>
                      <Badge 
                        variant="subtle" 
                        colorScheme={getTransactionStatusColor(transaction.type)}
                        size="xs"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">{transaction.description}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatDate(transaction.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{formatAmount(transaction.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
