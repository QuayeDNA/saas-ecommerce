import { useState } from "react";
import { FaHistory, FaTh, FaList, FaUser } from "react-icons/fa";
import type { Withdrawal, PopulatedUser } from "../../../types/commission";
import { Card, CardBody, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Pagination } from "../../../design-system";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });
};

const userName = (u: string | PopulatedUser): string =>
  typeof u === "object" ? u.fullName : "—";

const userEmail = (u: string | PopulatedUser): string =>
  typeof u === "object" ? u.email : "";

interface ReferralWithdrawalsTabProps {
  withdrawals: Withdrawal[];
  pagination: { page: number; limit: number; total: number; pages: number };
  loading: boolean;
  onPageChange: (page: number) => void;
}

export const ReferralWithdrawalsTab = ({ withdrawals, pagination, loading, onPageChange }: ReferralWithdrawalsTabProps) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  return (
    <Card variant="outlined">
      <CardBody>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaHistory className="w-4 h-4" style={{ color: "var(--color-secondary)" }} /> Withdrawal History
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
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <FaHistory className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No withdrawals recorded</p>
          </div>
        ) : viewMode === "card" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {withdrawals.map((w) => (
                <div
                  key={w._id}
                  className="border rounded-lg p-4"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(w.createdAt)} {formatTime(w.createdAt)}
                    </span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: "var(--color-success-icon)" }}>+GHS {w.amount.toFixed(2)}</p>
                  {typeof w.user === "object" && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <FaUser className="w-3 h-3" />
                      <span>{userName(w.user)}</span>
                      {userEmail(w.user) && (
                        <span className="truncate" style={{ color: "var(--text-muted)" }}>· {userEmail(w.user)}</span>
                      )}
                    </div>
                  )}
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Balance after: GHS {(w.balanceAfter || 0).toFixed(2)}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
                    {w.description || w.metadata?.type || "Commission withdrawal"}
                  </p>
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
                    <TableHeaderCell>User</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Balance After</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FaUser className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                          <div>
                            <p className="text-sm font-medium">{userName(w.user)}</p>
                            {userEmail(w.user) && (
                              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{userEmail(w.user)}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <p className="text-sm">{formatDate(w.createdAt)}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formatTime(w.createdAt)}</p>
                      </TableCell>
                      <TableCell className="font-semibold" style={{ color: "var(--color-success-icon)" }}>+GHS {w.amount.toFixed(2)}</TableCell>
                      <TableCell>GHS {(w.balanceAfter || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {w.description || w.metadata?.type || "Commission withdrawal"}
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
