import { useMemo, useState } from "react";
import { FaFileAlt, FaExclamationTriangle, FaUsers } from "react-icons/fa";
import { Badge, Card, Input, StatsGrid } from "../../design-system";
import { useAuditStats } from "../../hooks/useAuditLogs";
import type { StatCardProps } from "../../design-system/components/stats-card";

const palette = [
  "var(--color-primary-500)",
  "var(--color-secondary-500)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
  "var(--color-primary-300)",
];

const severityColor: Record<string, string> = {
  info: "var(--color-info)",
  warning: "var(--color-warning)",
  critical: "var(--color-error)",
};

export const AuditStatsWidget = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useAuditStats(
    startDate || undefined,
    endDate || undefined,
  );

  const categoryEntries = useMemo(
    () =>
      Object.entries(data?.stats.byCategory ?? {}).sort((a, b) => b[1] - a[1]),
    [data?.stats.byCategory],
  );
  const severityEntries = useMemo(
    () =>
      Object.entries(data?.stats.bySeverity ?? {}).sort((a, b) => b[1] - a[1]),
    [data?.stats.bySeverity],
  );

  const categoryTotal = categoryEntries.reduce(
    (sum, [, value]) => sum + value,
    0,
  );

  const pieStyle = useMemo(() => {
    if (!categoryTotal) {
      return {
        background:
          "conic-gradient(var(--color-border) 0deg, var(--color-border) 360deg)",
      };
    }

    let current = 0;
    const parts = categoryEntries.slice(0, 6).map(([, value], index) => {
      const angle = (value / categoryTotal) * 360;
      const start = current;
      const end = current + angle;
      current = end;
      return `${palette[index % palette.length]} ${start}deg ${end}deg`;
    });

    return { background: `conic-gradient(${parts.join(", ")})` };
  }, [categoryEntries, categoryTotal]);

  const topStatCards: StatCardProps[] = [
    {
      title: "Total Logs",
      value: data?.stats.totalLogs ?? 0,
      icon: <FaFileAlt />,
      size: "md",
    },
    {
      title: "Critical (24h)",
      value: data?.stats.recentCritical ?? 0,
      icon: <FaExclamationTriangle />,
      size: "md",
    },
    {
      title: "Top Active Users",
      value: (data?.stats.topUsers ?? []).length,
      icon: <FaUsers />,
      size: "md",
    },
  ];

  return (
    <Card variant="outlined" className="p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading stats...</div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <StatsGrid stats={topStatCards} columns={3} gap="sm" />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
              <h4 className="mb-3 text-sm font-semibold sm:text-base">
                Category Breakdown
              </h4>
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div
                  className="relative h-32 w-32 shrink-0 sm:h-36 sm:w-36"
                >
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    {categoryEntries.slice(0, 6).map(() => {
                      if (categoryTotal === 0) return null;
                      return null;
                    })}
                  </svg>
                  <div
                    className="absolute inset-0 h-full w-full rounded-full"
                    style={pieStyle}
                  >
                    <div className="absolute inset-[22%] rounded-full bg-white" />
                  </div>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  {categoryEntries.slice(0, 6).map(([label, value], index) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3"
                        style={{
                          backgroundColor: palette[index % palette.length],
                        }}
                      />
                      <span className="capitalize text-gray-700">{label}</span>
                      <span className="font-semibold text-gray-900">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
              <h4 className="mb-3 text-sm font-semibold sm:text-base">
                Severity Breakdown
              </h4>
              <div className="space-y-3">
                {severityEntries.map(([label, value]) => {
                  const max = Math.max(
                    ...severityEntries.map(([, count]) => count),
                    1,
                  );
                  const width = `${Math.round((value / max) * 100)}%`;

                  return (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <Badge
                          variant="outline"
                          colorScheme={
                            label === "critical"
                              ? "error"
                              : label === "warning"
                                ? "warning"
                                : "info"
                          }
                        >
                          {label}
                        </Badge>
                        <span className="font-semibold text-gray-900">
                          {value}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width,
                            backgroundColor:
                              severityColor[label] ?? "var(--color-info)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
            <h4 className="mb-3 text-sm font-semibold sm:text-base">
              Top 5 Active Users
            </h4>
            <div className="space-y-2">
              {(data?.stats.topUsers ?? []).slice(0, 5).map((user, index) => (
                <div
                  key={`${user.userId}-${index}`}
                  className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-700">
                    {user.userName}
                  </span>
                  <Badge colorScheme="gray">{user.count}</Badge>
                </div>
              ))}
              {(data?.stats.topUsers ?? []).length === 0 && (
                <div className="text-sm text-gray-500">
                  No user activity data yet.
                </div>
              )}
            </div>
          </div>
          </div>

          
        </div>
      )}
    </Card>
  );
};

export default AuditStatsWidget;
