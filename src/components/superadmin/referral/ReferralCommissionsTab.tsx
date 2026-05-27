import { FaMoneyBillWave } from "react-icons/fa";
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
}: ReferralCommissionsTabProps) => (
  <Card variant="outlined">
    <CardBody>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <FaMoneyBillWave className="w-4 h-4 text-[var(--color-secondary)]" />
          Commission History
          <Badge variant="subtle" colorScheme="info" size="sm">{pagination.total}</Badge>
        </h3>
        <ReferralCommissionFilter value={filter} onChange={onFilterChange} />
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : commissions.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <FaMoneyBillWave className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No commission records found</p>
        </div>
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
                      <TableCell className="text-sm text-[var(--text-secondary)]">
                        {dt.date}<br /><span className="text-xs">{dt.time}</span>
                      </TableCell>
                      <TableCell className="font-semibold text-[var(--text-primary)]">
                        {formatCurrency(c.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--text-secondary)]">
                        {(c.commissionRate * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-sm text-[var(--text-secondary)]">
                        {c.ordersCount}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--text-secondary)]">
                        {c.qualifiedUsersCount}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--text-secondary)]">
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
