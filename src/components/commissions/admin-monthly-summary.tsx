import { useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaClock,
  FaCalendar,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";
import { Card, CardBody, CardHeader, Badge, Button } from "../../design-system";
import type { CommissionMonthlySummary } from "../../services/commission.service";

interface AdminMonthlyCardProps {
  summary: CommissionMonthlySummary;
  formatCurrency: (amount: number) => string;
  onViewDetails?: (summary: CommissionMonthlySummary) => void;
}

export function AdminMonthlyCard({
  summary,
  formatCurrency,
  onViewDetails,
}: AdminMonthlyCardProps) {
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <FaCalendar className="text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {summary.monthName}
            </h3>
            {summary.agentId && (
              <p className="text-sm text-gray-600">
                {summary.agentId.fullName}
              </p>
            )}
          </div>
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
              <div className="flex items-center gap-2 mb-1">
                <FaDollarSign className="text-blue-600 text-sm" />
                <p className="text-xs text-gray-500">Total Earned</p>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(summary.totalEarned)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaCheckCircle className="text-green-600 text-sm" />
                <p className="text-xs text-gray-500">Total Paid</p>
              </div>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(summary.totalPaid)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaClock className="text-yellow-600 text-sm" />
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <p className="text-sm font-medium text-yellow-600">
                {formatCurrency(summary.totalPending)}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FaUsers className="text-purple-600 text-sm" />
                <p className="text-xs text-gray-500">Orders</p>
              </div>
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

          {/* Action Button */}
          {onViewDetails && (
            <div className="pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(summary)}
                className="w-full"
              >
                View Details
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

interface AdminMonthlyListProps {
  summaries: CommissionMonthlySummary[];
  formatCurrency: (amount: number) => string;
  onViewDetails?: (summary: CommissionMonthlySummary) => void;
  loading?: boolean;
}

export function AdminMonthlyList({
  summaries,
  formatCurrency,
  onViewDetails,
  loading = false,
}: AdminMonthlyListProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredSummaries =
    filterStatus === "all"
      ? summaries
      : summaries.filter((s) => s.paymentStatus === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterStatus === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
        >
          All ({summaries.length})
        </Button>
        <Button
          variant={filterStatus === "unpaid" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("unpaid")}
        >
          Unpaid ({summaries.filter((s) => s.paymentStatus === "unpaid").length}
          )
        </Button>
        <Button
          variant={filterStatus === "partially_paid" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("partially_paid")}
        >
          Partial (
          {summaries.filter((s) => s.paymentStatus === "partially_paid").length}
          )
        </Button>
        <Button
          variant={filterStatus === "fully_paid" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("fully_paid")}
        >
          Fully Paid (
          {summaries.filter((s) => s.paymentStatus === "fully_paid").length})
        </Button>
      </div>

      {/* Summary List */}
      {filteredSummaries.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            No {filterStatus !== "all" ? filterStatus.replace("_", " ") : ""}{" "}
            Summaries
          </h3>
          <p className="text-sm text-gray-500">
            {filterStatus === "all"
              ? "Historical commission summaries will appear here once months are archived."
              : `No ${filterStatus.replace("_", " ")} summaries found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSummaries.map((summary) => (
            <AdminMonthlyCard
              key={summary._id}
              summary={summary}
              formatCurrency={formatCurrency}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
