import { useState } from "react";
import { FaMoneyBillWave, FaTh, FaList } from "react-icons/fa";
import { Card, CardBody } from "../../../design-system/components/card";
import { Badge } from "../../../design-system/components/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell,
} from "../../../design-system/components/table";
import { formatDate, CommissionStatusBadge } from "./badge-helpers";
import type { Commission } from "../../../types/commission";

interface CommissionHistoryProps {
  commissions: Commission[];
}

export const CommissionHistory = ({ commissions }: CommissionHistoryProps) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  return (
    <Card variant="outlined">
      <CardBody>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaMoneyBillWave className="w-4 h-4" style={{ color: "var(--color-secondary)" }} /> Commission History
          </h3>
          <div className="flex rounded-lg p-0.5" style={{ background: "var(--bg-surface-alt)" }}>
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
        {commissions.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <FaMoneyBillWave className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No commissions yet</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <CommissionStatusBadge status={c.status} />
                </div>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>GHS {c.amount.toFixed(2)}</p>
                <div className="flex gap-4 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{c.rate}% rate</span>
                  <span>{c.ordersCount || 0} orders</span>
                  <span>{c.qualifiedUsersCount || 0} users</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <Table variant="striped" size="sm">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Rate</TableHeaderCell>
                  <TableHeaderCell>Orders</TableHeaderCell>
                  <TableHeaderCell>Qualified Users</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>
                      <p className="text-sm whitespace-nowrap">{formatDate(c.date)}</p>
                    </TableCell>
                    <TableCell className="font-semibold">GHS {c.amount.toFixed(2)}</TableCell>
                    <TableCell>{c.rate}%</TableCell>
                    <TableCell>{c.ordersCount || 0}</TableCell>
                    <TableCell>{c.qualifiedUsersCount || 0}</TableCell>
                    <TableCell><CommissionStatusBadge status={c.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
