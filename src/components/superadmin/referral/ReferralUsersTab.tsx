import { useState } from "react";
import { FaUsers, FaTh, FaList, FaUser, FaPhone, FaCalendar } from "react-icons/fa";
import type { ReferralAdminUser } from "../../../types/referral";
import { Badge, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from "../../../design-system";
import { formatCurrency } from "../../../utils/pricingHelpers";

const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  return {
    date: d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }),
  };
};

interface ReferralUsersTabProps {
  users: ReferralAdminUser[];
  loading: boolean;
}

export const ReferralUsersTab = ({ users, loading }: ReferralUsersTabProps) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  return (
    <div className="space-y-4">
      {/* Header with view switcher */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FaUsers className="w-5 h-5 text-[var(--color-secondary)]" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Referred Users</h3>
          <Badge variant="subtle" colorScheme="info" size="sm">{users.length}</Badge>
        </div>
        <div className="flex bg-[var(--bg-surface-alt)] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "card"
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FaTh className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "table"
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <FaList className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg">
          <FaUsers className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No referred users found</p>
        </div>
      ) : viewMode === "card" ? (
        /* ── Card View ────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => {
            const joined = formatDateTime(u.createdAt);
            return (
              <div
                key={u._id}
                className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary)] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {u.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{u.fullName}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{u.email}</p>
                  </div>
                  <Badge
                    colorScheme={u.status === "active" ? "success" : "error"}
                    variant="subtle"
                    size="sm"
                  >
                    {u.status}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <FaPhone className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                    <span className="truncate">{u.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaUser className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                    <span className="truncate">
                      Referred by: {u.referredBy?.fullName || <span className="text-[var(--text-muted)]">—</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCalendar className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                    <span>Joined {joined.date}</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Earned</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatCurrency(u.commissionStats?.totalEarned || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-muted)]">Orders</p>
                    <Badge colorScheme="info" variant="subtle" size="sm">
                      {u.commissionStats?.totalOrders || 0}
                    </Badge>
                  </div>
                  <Badge variant="subtle" colorScheme="info" size="sm">{u.referralCode}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table View ───────────────────────────────── */
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg overflow-hidden">
          <Table variant="striped" size="sm">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Code</TableHeaderCell>
                <TableHeaderCell>Referred By</TableHeaderCell>
                <TableHeaderCell>Earned</TableHeaderCell>
                <TableHeaderCell>Orders</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Joined</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const joined = formatDateTime(u.createdAt);
                return (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium text-[var(--text-primary)]">{u.fullName}</TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)]">{u.email}</TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)]">{u.phone}</TableCell>
                    <TableCell>
                      <Badge variant="subtle" colorScheme="info" size="sm">{u.referralCode}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)]">
                      {u.referredBy?.fullName || <span className="text-[var(--text-muted)]">—</span>}
                    </TableCell>
                    <TableCell className="font-semibold text-[var(--text-primary)]">
                      {formatCurrency(u.commissionStats?.totalEarned || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge colorScheme="info" variant="subtle" size="sm">
                        {u.commissionStats?.totalOrders || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        colorScheme={u.status === "active" ? "success" : "error"}
                        variant="subtle"
                        size="sm"
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-muted)]">
                      {joined.date}<br />
                      <span className="text-xs">{joined.time}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
