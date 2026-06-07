import { useState } from "react";
import { FaUsers, FaTh, FaList, FaUser, FaPhone, FaCalendar, FaTag } from "react-icons/fa";
import type { ReferralAdminUser } from "../../../types/referral";
import { Card, CardBody, Badge, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Pagination } from "../../../design-system";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });
};

interface ReferralUsersTabProps {
  users: ReferralAdminUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
  loading: boolean;
  onPageChange: (page: number) => void;
}

export const ReferralUsersTab = ({ users, pagination, loading, onPageChange }: ReferralUsersTabProps) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  return (
    <Card variant="outlined">
      <CardBody>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaUsers className="w-4 h-4" style={{ color: "var(--color-secondary)" }} /> Referred Users
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-surface-alt)", color: "var(--text-muted)" }}>
              {pagination.total}
            </span>
          </h3>
          <div className="flex rounded-lg p-0.5" style={{ background: "var(--bg-surface-alt)" }}>
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <FaUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No referred users found</p>
          </div>
        ) : viewMode === "card" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="border rounded-lg p-4"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                    >
                      {u.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{u.fullName}</p>
                      <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                    </div>
                    <Badge colorScheme={u.status === "active" ? "success" : "error"} variant="subtle" size="sm">
                      {u.status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <div className="flex items-center gap-2">
                      <FaPhone className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                      <span className="truncate">{u.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUser className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                      <span className="truncate">
                        Referred by: {u.referredBy?.fullName || <span style={{ color: "var(--text-muted)" }}>—</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaCalendar className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                      <span>Joined {formatDate(u.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTag className="w-3 h-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                      <span>Code: {u.referralCode}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Earned</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        GHS {(u.commissionStats?.totalEarned || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Orders</p>
                      <Badge colorScheme="info" variant="subtle" size="sm">
                        {u.commissionStats?.totalOrders || 0}
                      </Badge>
                    </div>
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
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium" style={{ color: "var(--text-primary)" }}>{u.fullName}</TableCell>
                      <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>{u.email}</TableCell>
                      <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>{u.phone}</TableCell>
                      <TableCell>
                        <Badge variant="subtle" colorScheme="info" size="sm">{u.referralCode}</Badge>
                      </TableCell>
                      <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {u.referredBy?.fullName || <span style={{ color: "var(--text-muted)" }}>—</span>}
                      </TableCell>
                      <TableCell className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        GHS {(u.commissionStats?.totalEarned || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme="info" variant="subtle" size="sm">
                          {u.commissionStats?.totalOrders || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge colorScheme={u.status === "active" ? "success" : "error"} variant="subtle" size="sm">
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <p className="text-sm">{formatDate(u.createdAt)}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatTime(u.createdAt)}</p>
                      </TableCell>
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
