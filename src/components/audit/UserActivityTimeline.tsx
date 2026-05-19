import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { Badge, Button } from "../../design-system";
import { useInfiniteAuditLogs } from "../../hooks/useAuditLogs";
import { useAuditLogRealtime } from "../../hooks/useAuditLogRealtime";
import type { AuditLog } from "../../types/auditLog";
import {
  formatAction,
  formatCategory,
  formatMetadataEntries,
  formatChanges,
  formatTimestamp,
} from "./auditHelpers";

interface UserActivityTimelineProps {
  userId: string;
  limit?: number;
}

const severityColor = (severity: AuditLog["severity"]) => {
  if (severity === "critical") return "error";
  if (severity === "warning") return "warning";
  return "info";
};

const getInitials = (fullName?: string) => {
  if (!fullName) return "SY";
  return fullName
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const UserActivityTimeline = ({ userId }: UserActivityTimelineProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useAuditLogRealtime(Boolean(userId));

  const query = useInfiniteAuditLogs({ userId });

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (
          first.isIntersecting &&
          query.hasNextPage &&
          !query.isFetchingNextPage
        ) {
          query.fetchNextPage();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [query]);

  const groupedLogs = useMemo(() => {
    const allLogs = query.data?.pages.flatMap((page) => page.logs) ?? [];
    const groups = new Map<string, AuditLog[]>();

    allLogs.forEach((log) => {
      const key = new Date(log.timestamp).toDateString();
      const existing = groups.get(key) ?? [];
      existing.push(log);
      groups.set(key, existing);
    });

    return Array.from(groups.entries());
  }, [query.data?.pages]);

  return (
    <div>
      <div className="space-y-5">
        {groupedLogs.map(([day, logs]) => (
          <div key={day}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {new Date(day).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <div className="relative ml-3 space-y-3 border-l border-gray-200 pl-4">
              {logs.map((log) => {
                const expanded = expandedId === log._id;
                const changes = formatChanges(log.changes);
                const metadata = formatMetadataEntries(log.metadata);
                const actionLabel = formatAction(log.action);
                const categoryLabel = formatCategory(log.category);

                return (
                  <div
                    key={log._id}
                    className="relative rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <span className="absolute -left-6 top-4 h-3 w-3 rounded-full bg-[var(--color-primary-500)]" />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-semibold text-[var(--color-primary-700)]">
                          {getInitials(log.user?.fullName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {actionLabel}
                            </span>
                            <Badge variant="outline" size="sm">
                              {categoryLabel}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.user?.fullName || "System"} •{" "}
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge colorScheme={severityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedId(expanded ? null : log._id)
                          }
                        >
                          {expanded ? <FaChevronDown /> : <FaChevronRight />}
                        </Button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-3 space-y-3">
                        {changes.length > 0 && (
                          <div className="rounded bg-gray-50 p-3">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Changes
                            </h4>
                            <div className="space-y-1.5">
                              {changes.map((c) => (
                                <div
                                  key={c.field}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <span className="min-w-[80px] font-medium text-gray-600">
                                    {c.field}:
                                  </span>
                                  <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700 line-through">
                                    {c.from}
                                  </span>
                                  <span className="text-gray-400">&rarr;</span>
                                  <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-700">
                                    {c.to}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {metadata.length > 0 && (
                          <div className="rounded bg-gray-50 p-3">
                            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Metadata
                            </h4>
                            <div className="space-y-1">
                              {metadata.map(({ label, value }) => (
                                <div key={label} className="flex gap-2 text-xs">
                                  <span className="min-w-[80px] font-medium text-gray-500">
                                    {label}:
                                  </span>
                                  <span className="break-all text-gray-700">
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="mt-4" />

      {query.hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => query.fetchNextPage()}
            isLoading={query.isFetchingNextPage}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserActivityTimeline;
