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
    <div className="space-y-6">
      {groupedLogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
          No activity yet.
        </div>
      ) : (
        groupedLogs.map(([day, logs]) => (
          <div key={day}>
            <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {new Date(day).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>

            <div className="relative ml-3 space-y-4 border-l border-gray-200 pl-5">
              {logs.map((log) => {
                const expanded = expandedId === log._id;
                const changes = formatChanges(log.changes);
                const metadata = formatMetadataEntries(log.metadata);
                const actionLabel = formatAction(log.action);
                const categoryLabel = formatCategory(log.category);

                return (
                  <article
                    key={log._id}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                  >
                    <span className="absolute -left-6 top-5 h-3 w-3 rounded-full bg-[var(--color-primary-500)] ring-4 ring-white" />

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-100)] text-xs font-semibold text-[var(--color-primary-700)]">
                          {getInitials(log.user?.fullName)}
                        </div>
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {actionLabel}
                            </p>
                            <Badge variant="outline" size="sm">
                              {categoryLabel}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {log.user?.fullName || "System"} • {formatTimestamp(log.timestamp)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge colorScheme={severityColor(log.severity)}>
                          {log.severity}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedId(expanded ? null : log._id)
                          }
                          aria-expanded={expanded}
                        >
                          {expanded ? <FaChevronDown /> : <FaChevronRight />}
                        </Button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-4 space-y-3">
                        {changes.length > 0 && (
                          <section className="rounded-2xl bg-gray-50 p-4">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Changes
                              </h4>
                              <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400">
                                {changes.length} {changes.length === 1 ? "field" : "fields"}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {changes.map((c) => (
                                <div
                                  key={c.field}
                                  className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <span className="font-medium text-gray-600">
                                    {c.field}:
                                  </span>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700 line-through">
                                      {c.from}
                                    </span>
                                    <span className="text-gray-400">&rarr;</span>
                                    <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-700">
                                      {c.to}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                        {metadata.length > 0 && (
                          <section className="rounded-2xl bg-gray-50 p-4">
                            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              Metadata
                            </h4>
                            <div className="grid gap-2 text-xs sm:grid-cols-2">
                              {metadata.map(({ label, value }) => (
                                <div
                                  key={label}
                                  className="rounded-xl border border-gray-200 bg-white p-3"
                                >
                                  <p className="mb-1 text-[11px] uppercase tracking-[0.15em] text-gray-500">
                                    {label}
                                  </p>
                                  <p className="break-all text-gray-700">{value}</p>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        ))
      )}

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
