import { useState } from "react";
import { FaMoneyBillWave, FaTh, FaList, FaUser } from "react-icons/fa";
import type { Commission, PopulatedUser } from "../../../types/commission";
import { Card, CardBody, Badge, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Pagination } from "../../../design-system";
import { ReferralCommissionFilter } from "./ReferralCommissionFilter";

type CommissionStatusFilter = "all" | "pending" | "credited" | "cancelled";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
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

const referrerName = (r: string | PopulatedUser): string =>
  typeof r === "object" ? r.fullName : "—";

const referrerDetail = (r: string | PopulatedUser): string =>
  typeof r === "object" ? [r.email, r.agentCode].filter(Boolean).join(" · ") : "";

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
          <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaMoneyBillWave className="w-4 h-4" style={{ color: "var(--color-secondary)" }} />
            Commission History
            <Badge variant="subtle" colorScheme="info" size="sm">{pagination.total}</Badge>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <ReferralCommissionFilter value={filter} onChange={onFilterChange} />
            <div className="flex rounded-lg p-0.5 shrink-0" style={{ background: "var(--bg-surface-alt)" }}>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "card" ? "shadow-sm border" : ""
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "table" ? "shadow-sm border" : ""
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
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <FaMoneyBillWave className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No commission records found</p>
          </div>
        ) : viewMode === "card" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {commissions.map((c) => (
                <div
                  key={c._id}
                  className="border rounded-lg p-4"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge colorScheme="info" variant="subtle" size="sm">{formatDate(c.date)}</Badge>
                    {statusBadge(c.status)}
                  </div>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>GHS {c.amount.toFixed(2)}</p>
                  {typeof c.referrer === "object" && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <FaUser className="w-3 h-3" />
                      <span>{referrerName(c.referrer)}</span>
                      {referrerDetail(c.referrer) && (
                        <span className="truncate" style={{ color: "var(--text-muted)" }}>· {referrerDetail(c.referrer)}</span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-4 mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>{c.rate}% rate</span>
                    <span>{c.ordersCount || 0} orders</span>
                    <span>{c.qualifiedUsersCount || 0} users</span>
                    <span>Batch: GHS {(c.batchTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
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
                    <TableHeaderCell>Agent</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Rate</TableHeaderCell>
                    <TableHeaderCell>Orders</TableHeaderCell>
                    <TableHeaderCell>Users</TableHeaderCell>
                    <TableHeaderCell>Batch Total</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FaUser className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                          <div>
                            <p className="text-sm font-medium">{referrerName(c.referrer)}</p>
                            {referrerDetail(c.referrer) && (
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{referrerDetail(c.referrer)}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm whitespace-nowrap">{formatDate(c.date)}</p>
                      </TableCell>
                      <TableCell className="font-semibold">GHS {c.amount.toFixed(2)}</TableCell>
                      <TableCell>{c.rate}%</TableCell>
                      <TableCell>{c.ordersCount || 0}</TableCell>
                      <TableCell>{c.qualifiedUsersCount || 0}</TableCell>
                      <TableCell>GHS {(c.batchTotal || 0).toFixed(2)}</TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                    </TableRow>
                  ))}
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
