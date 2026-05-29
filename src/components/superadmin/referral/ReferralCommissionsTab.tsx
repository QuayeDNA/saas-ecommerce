import { useState } from "react";
import { FaMoneyBillWave, FaTh, FaList } from "react-icons/fa";
import type { Commission } from "../../../types/commission";
import { Card, CardBody, Badge, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Pagination } from "../../../design-system";
import { formatCurrency } from "../../../utils/pricingHelpers";
import { ReferralCommissionFilter } from "./ReferralCommissionFilter";

type CommissionStatusFilter = "all" | "pending" | "credited" | "cancelled";

const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  return {
    date: d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }),
  };
};

const statusBadge = (status: string) => {
  const map: Record<string, { colorScheme: "success" | "warning" | "error" | "info"; label: string }> = {
    credited: { colorScheme: "success", label: "Credited" },
    pending: { colorScheme: "warning", label: "Pending" },
    cancelled: { colorScheme: "error", label: "Cancelled" },
  };
  const s = map[status] || { colorScheme: "info" as const, label: status };
  return <Badge colorScheme={s.colorScheme} variant="subtle" size="sm">{s.label}</Badge>;
};

interface ReferralCommissionsTabProps {
  commissions: Commission[];
  pagination: { page: number; limit: number; total: number; pages: number };
  filter: CommissionStatusFilter;
  loading: boolean;
  onFilterChange: (filter: CommissionStatusFilter) => void;
  onPageChange: (page: number) => void;
}

export const ReferralCommissionsTab = ({
  commissions, pagination, filter, loading, onFilterChange, onPageChange,
}: ReferralCommissionsTabProps) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  return (
    <Card variant="outlined">
      <CardBody>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaMoneyBillWave className="w-4 h-4" style={{ color: "var(--color-secondary)" }} />
            Commission History
            <Badge variant="subtle" colorScheme="info" size="sm">{pagination.total}</Badge>
          </h3>
          <div className="flex items-center gap-2">
            <ReferralCommissionFilter value={filter} onChange={onFilterChange} />
            <div className="flex rounded-lg p-0.5" style={{ background: "var(--bg-surface-alt)" }}>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "card"
                    ? "shadow-sm border"
                    : ""
                }`}
                style={{
                  background: viewMode === "card" ? "var(--bg-surface)" : "transparent",
                  color: viewMode === "card" ? "var(--text-primary)" : "var(--text-muted)",
                  borderColor: viewMode === "card" ? "var(--border-color)" : "transparent",
                }}
              >
                <FaTh className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "shadow-sm border"
                    : ""
                }`}
                style={{
                  background: viewMode === "table" ? "var(--bg-surface)" : "transparent",
                  color: viewMode === "table" ? "var(--text-primary)" : "var(--text-muted)",
                  borderColor: viewMode === "table" ? "var(--border-color)" : "transparent",
                }}
              >
                <FaList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
            <FaMoneyBillWave className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No commission records found</p>
          </div>
        ) : viewMode === "card" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {commissions.map((c) => {
                const dt = formatDateTime(c.date);
                return (
                  <div
                    key={c._id}
                    className="border rounded-lg p-4"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {dt.date} {dt.time}
                      </span>
                      {statusBadge(c.status)}
                    </div>
                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(c.amount)}
                    </p>
                    <div className="flex gap-3 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      <span>{(c.commissionRate * 100).toFixed(1)}% rate</span>
                      <span>{c.ordersCount} orders</span>
                      <span>{c.qualifiedUsersCount} users</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={onPageChange}
              size="sm"
              variant="compact"
            />
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table variant="striped" size="sm">
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Rate</TableHeaderCell>
                    <TableHeaderCell>Orders</TableHeaderCell>
                    <TableHeaderCell>Qualified Users</TableHeaderCell>
                    <TableHeaderCell>Batch Total</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((c) => {
                    const dt = formatDateTime(c.date);
                    return (
                      <TableRow key={c._id}>
                        <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {dt.date}<br /><span className="text-xs">{dt.time}</span>
                        </TableCell>
                        <TableCell className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {formatCurrency(c.amount)}
                        </TableCell>
                        <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {(c.commissionRate * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {c.ordersCount}
                        </TableCell>
                        <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {c.qualifiedUsersCount}
                        </TableCell>
                        <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          {formatCurrency(c.batchTotal)}
                        </TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={onPageChange}
                size="sm"
                variant="compact"
              />
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
};
