import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaClock,
  FaCalendar,
} from "react-icons/fa";
import { Card, CardBody, CardHeader, Badge } from "../../design-system";
import type { CommissionMonthlySummary } from "../../services/commission.service";

interface MonthlyCommissionCardProps {
  summary: CommissionMonthlySummary;
  formatCurrency: (amount: number) => string;
  onClick?: () => void;
}

export function MonthlyCommissionCard({
  summary,
  formatCurrency,
  onClick,
}: MonthlyCommissionCardProps) {
  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "fully_paid":
        return <FaCheckCircle className="text-green-600" />;
      case "partially_paid":
        return <FaExclamationCircle className="text-yellow-600" />;
      case "unpaid":
        return <FaTimesCircle className="text-red-600" />;
      case "expired":
        return <FaClock className="text-orange-600" />;
      case "rejected":
        return <FaTimesCircle className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "fully_paid":
        return "success";
      case "partially_paid":
        return "warning";
      case "unpaid":
        return "error";
      case "expired":
        return "default";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "fully_paid":
        return "Fully Paid";
      case "partially_paid":
        return "Partially Paid";
      case "unpaid":
        return "Unpaid";
      case "expired":
        return "Expired";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FaCalendar className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {summary.monthName}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {getPaymentStatusIcon(summary.paymentStatus)}
          <Badge
            colorScheme={
              getPaymentStatusColor(summary.paymentStatus) as
                | "success"
                | "warning"
                | "error"
                | "default"
            }
          >
            {getPaymentStatusText(summary.paymentStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Payment Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Payment Progress</span>
              <span className="font-medium text-gray-900">
                {summary.paymentPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  summary.paymentPercentage === 100
                    ? "bg-green-600"
                    : summary.paymentPercentage > 0
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${summary.paymentPercentage}%` }}
              />
            </div>
          </div>

          {/* Commission Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Earned</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(summary.totalEarned)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Paid</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-sm font-medium text-yellow-600">
                {formatCurrency(summary.totalPending)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Orders</p>
              <p className="text-sm font-medium text-gray-900">
                {summary.orderCount}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          {(summary.totalRejected > 0 || summary.totalExpired > 0) && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {summary.totalRejected > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Rejected</p>
                    <p className="font-medium text-red-600">
                      {formatCurrency(summary.totalRejected)}
                    </p>
                  </div>
                )}
                {summary.totalExpired > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Expired</p>
                    <p className="font-medium text-orange-600">
                      {formatCurrency(summary.totalExpired)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Revenue:</span>{" "}
                {formatCurrency(summary.revenue)}
              </div>
              <div>
                <span className="font-medium">Rate:</span>{" "}
                {summary.formattedRate}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

interface MonthlyCommissionListProps {
  summaries: CommissionMonthlySummary[];
  formatCurrency: (amount: number) => string;
  onCardClick?: (summary: CommissionMonthlySummary) => void;
  loading?: boolean;
}

export function MonthlyCommissionList({
  summaries,
  formatCurrency,
  onCardClick,
  loading = false,
}: MonthlyCommissionListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12">
        <FaCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          No Historical Data
        </h3>
        <p className="text-sm text-gray-500">
          Historical commission summaries will appear here once months are
          archived.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {summaries.map((summary) => (
        <MonthlyCommissionCard
          key={summary._id}
          summary={summary}
          formatCurrency={formatCurrency}
          onClick={onCardClick ? () => onCardClick(summary) : undefined}
        />
      ))}
    </div>
  );
}
