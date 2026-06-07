import { useState } from "react";
import { FaTrophy, FaTh, FaList, FaUser } from "react-icons/fa";
import type { LeaderboardEntry } from "../../../types/referral";
import { Card, CardBody, Badge, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell } from "../../../design-system";

const TIMEFRAMES = [
  { value: "all-time", label: "All Time" },
  { value: "this-month", label: "This Month" },
  { value: "this-week", label: "This Week" },
] as const;

interface ReferralLeaderboardProps {
  data: LeaderboardEntry[];
  loading: boolean;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

const rankColor = (rank: number) => {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return undefined;
};

export const ReferralLeaderboard = ({
  data, loading, timeframe, onTimeframeChange,
}: ReferralLeaderboardProps) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  return (
    <Card variant="outlined">
      <CardBody>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <FaTrophy className="w-4 h-4" style={{ color: "var(--color-secondary)" }} />
            Top Referrers
            <Badge variant="subtle" colorScheme="info" size="sm">{data.length}</Badge>
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  type="button"
                  onClick={() => onTimeframeChange(tf.value)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors"
                  style={{
                    background: timeframe === tf.value ? "var(--color-secondary)" : "var(--bg-surface)",
                    color: timeframe === tf.value ? "white" : "var(--text-secondary)",
                    borderColor: timeframe === tf.value ? "var(--color-secondary)" : "var(--border-color)",
                  }}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg p-0.5 shrink-0" style={{ background: "var(--bg-surface-alt)" }}>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "card" ? "shadow-sm border" : ""}`}
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === "table" ? "shadow-sm border" : ""}`}
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
        ) : data.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--text-muted)" }}>
            <FaTrophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No referrers found</p>
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.map((entry, idx) => (
              <div
                key={entry.referrerId}
                className="border rounded-lg p-4"
                style={{ background: "var(--bg-surface)", borderColor: "var(--border-color)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: rankColor(idx) ? `${rankColor(idx)}33` : "var(--bg-surface-alt)",
                        color: rankColor(idx) || "var(--text-secondary)",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{entry.fullName}</span>
                  </div>
                  <Badge variant="subtle" colorScheme="info" size="sm">{entry.referralCode}</Badge>
                </div>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>GHS {entry.commissionsEarned.toFixed(2)}</p>
                <div className="flex gap-4 mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{entry.totalOrders} orders</span>
                  <span>{entry.totalReferred} referred</span>
                  <span>{entry.batchCount} batches</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table variant="striped" size="sm">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>#</TableHeaderCell>
                  <TableHeaderCell>Agent</TableHeaderCell>
                  <TableHeaderCell>Code</TableHeaderCell>
                  <TableHeaderCell>Commission Earned</TableHeaderCell>
                  <TableHeaderCell>Orders</TableHeaderCell>
                  <TableHeaderCell>Referred</TableHeaderCell>
                  <TableHeaderCell>Batches</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry, idx) => (
                  <TableRow key={entry.referrerId}>
                    <TableCell>
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: rankColor(idx) ? `${rankColor(idx)}33` : "transparent",
                          color: rankColor(idx) || "var(--text-secondary)",
                        }}
                      >
                        {idx + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FaUser className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                        <span style={{ color: "var(--text-primary)" }}>{entry.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="subtle" colorScheme="info" size="sm">{entry.referralCode}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold" style={{ color: "var(--color-success-icon)" }}>
                      +GHS {entry.commissionsEarned.toFixed(2)}
                    </TableCell>
                    <TableCell>{entry.totalOrders}</TableCell>
                    <TableCell>{entry.totalReferred}</TableCell>
                    <TableCell>{entry.batchCount}</TableCell>
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
