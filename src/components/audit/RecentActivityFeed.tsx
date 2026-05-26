import { useMemo, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Badge, Button, Card, Select } from "../../design-system";
import { useRecentActivity } from "../../hooks/useAuditLogs";
import { useAuditLogRealtime } from "../../hooks/useAuditLogRealtime";
import type { AuditLog } from "../../types/auditLog";
import { formatAction, formatCategory, formatMetadataEntries, formatTimestamp } from "./auditHelpers";

interface RecentActivityFeedProps {
  limit?: number;
}

const categoryOptions = [
  { value: "", label: "All categories" },
  { value: "auth", label: "Authentication" },
  { value: "user", label: "User Management" },
  { value: "order", label: "Orders" },
  { value: "wallet", label: "Wallet" },
  { value: "storefront", label: "Storefront" },
  { value: "payout", label: "Payouts" },
  { value: "settings", label: "Settings" },
  { value: "bundle", label: "Bundles" },
];

const severityColor = (severity: AuditLog["severity"]) => {
  if (severity === "critical") return "error";
  if (severity === "warning") return "warning";
  return "info";
};

const groupLabel = (timestamp: string) => {
  const eventDate = new Date(timestamp);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  const weekAgo = new Date(startToday);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (eventDate >= startToday) return "Today";
  if (eventDate >= startYesterday) return "Yesterday";
  if (eventDate >= weekAgo) return "This Week";
  return "Earlier";
};

export const RecentActivityFeed = ({ limit = 20 }: RecentActivityFeedProps) => {
  const [category, setCategory] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading } = useRecentActivity(limit);

  useAuditLogRealtime(true);

  const grouped = useMemo(() => {
    const logs = (data?.logs ?? []).filter((item) =>
      category ? item.category === category : true,
    );

    const map = new Map<string, AuditLog[]>();
    logs.forEach((log) => {
      const key = groupLabel(log.timestamp);
      const existing = map.get(key) ?? [];
      existing.push(log);
      map.set(key, existing);
    });

    return Array.from(map.entries());
  }, [category, data?.logs]);

  return (
    <Card variant="outlined" className="flex h-full flex-col p-4">
      <div className="mb-4 flex flex-col items-start justify-center gap-3 shrink-0">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="w-full md:w-48">
          <Select
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            label="Category"
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-gray-500 shrink-0">Loading recent activity...</div>
      )}

      <div className="space-y-4 flex-1 overflow-y-auto min-h-0">
        {grouped.map(([label, entries]) => (
          <div key={label}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {label}
            </div>
            <div className="space-y-2">
              {entries.map((entry) => {
                const expanded = expandedId === entry._id;
                const metadata = formatMetadataEntries(entry.metadata);
                const actionLabel = formatAction(entry.action);
                const categoryLabel = formatCategory(entry.category);

                return (
                  <div
                    key={entry._id}
                    className="rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{actionLabel}</span>
                          <Badge variant="outline" size="sm">{categoryLabel}</Badge>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          {entry.user?.fullName || "System"} • {formatTimestamp(entry.timestamp)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge colorScheme={severityColor(entry.severity)}>
                          {entry.severity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expanded ? null : entry._id)}
                        >
                          {expanded ? <FaChevronDown /> : <FaChevronRight />}
                        </Button>
                      </div>
                    </div>

                    {expanded && metadata.length > 0 && (
                      <div className="mt-3 rounded bg-gray-50 p-3">
                        <div className="space-y-1">
                          {metadata.map(({ label, value }) => (
                            <div key={label} className="flex gap-2 text-xs">
                              <span className="min-w-[80px] font-medium text-gray-500">{label}:</span>
                              <span className="text-gray-700 break-all">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {!isLoading && grouped.length === 0 && (
          <div className="py-4 text-center text-sm text-gray-500 shrink-0">No recent activity found.</div>
        )}
      </div>
    </Card>
  );
};

export default RecentActivityFeed;
