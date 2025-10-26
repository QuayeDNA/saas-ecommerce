import { FaMoneyBillWave, FaCheckCircle, FaClock, FaTimes, FaUsers } from 'react-icons/fa';
import { Card, CardBody, CardHeader } from '../../design-system';
import type { CurrentMonthStatistics } from '../../services/commission.service';

interface CurrentMonthStatsProps {
  statistics: CurrentMonthStatistics;
  formatCurrency: (amount: number) => string;
  isAgent?: boolean;
}

export function CurrentMonthStats({ statistics, formatCurrency, isAgent = false }: CurrentMonthStatsProps) {
  const { currentMonth } = statistics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">This Month's Earnings</h2>
          <p className="text-sm text-gray-600">{currentMonth.month}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Earned</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentMonth.totalEarned)}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Paid</h3>
            <FaCheckCircle className="text-green-500 text-lg" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(currentMonth.totalPaid)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Successfully paid</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Pending Payment</h3>
            <FaClock className="text-yellow-500 text-lg" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(currentMonth.totalPending)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {currentMonth.pendingCount} pending {currentMonth.pendingCount === 1 ? 'record' : 'records'}
            </p>
          </CardBody>
        </Card>

        {currentMonth.totalRejected > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
              <FaTimes className="text-red-500 text-lg" />
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(currentMonth.totalRejected)}
              </div>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </CardBody>
          </Card>
        )}

        {!isAgent && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Agents</h3>
              <FaUsers className="text-blue-500 text-lg" />
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-bold text-blue-600">
                {currentMonth.agentCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">Earning this month</p>
            </CardBody>
          </Card>
        )}

        <Card className={currentMonth.totalRejected > 0 || !isAgent ? '' : 'sm:col-span-2'}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Records</h3>
            <FaMoneyBillWave className="text-purple-500 text-lg" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold text-purple-600">
              {currentMonth.totalRecords}
            </div>
            <p className="text-xs text-gray-500 mt-1">Commission records</p>
          </CardBody>
        </Card>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Payment Progress</h3>
              <span className="text-sm font-medium text-gray-600">
                {currentMonth.totalEarned > 0
                  ? Math.round((currentMonth.totalPaid / currentMonth.totalEarned) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  currentMonth.totalPaid === currentMonth.totalEarned && currentMonth.totalEarned > 0
                    ? 'bg-green-600'
                    : currentMonth.totalPaid > 0
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${
                    currentMonth.totalEarned > 0
                      ? (currentMonth.totalPaid / currentMonth.totalEarned) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Paid: {formatCurrency(currentMonth.totalPaid)}</span>
              <span>Remaining: {formatCurrency(currentMonth.totalEarned - currentMonth.totalPaid)}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Info Message */}
      {isAgent && currentMonth.totalPending > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <FaClock className="text-blue-600 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Pending Payment</h4>
              <p className="text-sm text-blue-800">
                You have {formatCurrency(currentMonth.totalPending)} in pending commissions for this month. 
                These will be processed by the admin. Pending commissions expire after 30 days if not paid.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
