import { useState } from "react";
import { FaHistory, FaTh, FaList } from "react-icons/fa";
import type { Withdrawal } from "../../../types/commission";
import { Card, CardBody, Badge, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from "../../../design-system";
import { formatCurrency } from "../../../utils/pricingHelpers";

const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  return {
    date: d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }),
  };
};

interface ReferralWithdrawalsTabProps {
  withdrawals: Withdrawal[];
  loading: boolean;
}

export const ReferralWithdrawalsTab = ({ withdrawals, loading }: ReferralWithdrawalsTabProps) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  return (
    <Card variant="outlined">
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaHistory className="w-4 h-4" style={{ color: "var(--color-secondary)" }} />
            Withdrawal History
            <Badge variant="subtle" colorScheme="info" size="sm">{withdrawals.length}</Badge>
          </h3>
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
            <FaHistory className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No withdrawals recorded</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {withdrawals.map((w) => {
              const dt = formatDateTime(w.createdAt);
              return (
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
                      {dt.date} {dt.time}
                    </span>
                    <Badge variant="subtle" colorScheme="info" size="sm">
                      {w.type?.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    {formatCurrency(w.amount)}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Balance after: {formatCurrency(w.balanceAfter)}
                  </p>
                  <p className="text-xs mt-1 truncate" style={{ color: "var(--text-secondary)" }}>
                    {w.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table variant="striped" size="sm">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Balance After</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => {
                  const dt = formatDateTime(w.createdAt);
                  return (
                    <TableRow key={w._id}>
                      <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {dt.date}<br /><span className="text-xs">{dt.time}</span>
                      </TableCell>
                      <TableCell className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(w.amount)}
                      </TableCell>
                      <TableCell className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {formatCurrency(w.balanceAfter)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="subtle" colorScheme="info" size="sm">
                          {w.type?.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {w.description}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
