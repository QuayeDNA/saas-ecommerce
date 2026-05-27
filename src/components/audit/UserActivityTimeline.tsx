import { useMemo, useState } from "react";
import { FaChevronDown, FaChevronLeft, FaChevronRight, FaInfoCircle } from "react-icons/fa";
import { Button } from "../../design-system";
import { useUserActivityTimeline } from "../../hooks/useAuditLogs";
import type { DayFilter, UserActivityLog } from "../../types/auditLog";

interface UserActivityTimelineProps {
  userId: string;
}

const DAY_FILTERS: { label: string; value: DayFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "2 Days Ago", value: "2daysago" },
  { label: "All", value: "all" },
];

const severityConfig = {
  info: { label: "Info", classes: "bg-blue-100 text-blue-700" },
  warning: { label: "Warning", classes: "bg-amber-100 text-amber-700" },
  critical: { label: "Critical", classes: "bg-red-100 text-red-700" },
} as const;

const getInitials = (fullName?: string) => {
  if (!fullName) return "U";
  return fullName
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getDayLabel = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((today.getTime() - target.getTime()) / 86400000);

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff === 2) return "2 Days Ago";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function Pagination({
  page,
  pages,
  total,
  onPageChange,
}: {
  page: number;
  pages: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const range: (number | "...")[] = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) range.push(i);
    } else {
      range.push(1);
      if (page > 3) range.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
        range.push(i);
      }
      if (page < pages - 2) range.push("...");
      range.push(pages);
    }
    return range;
  };

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <p className="text-xs text-gray-500">
        {total} result{total !== 1 ? "s" : ""} &middot; Page {page} of {pages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
        >
          <FaChevronLeft className="h-3 w-3" />
          Prev
        </button>

        {getPageNumbers().map((item, i) =>
          item === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition ${
                item === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40"
        >
          Next
          <FaChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function ActivityCard({
  log,
  expanded,
  onToggle,
}: {
  log: UserActivityLog;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sev = severityConfig[log.severity];
  const hasRawData =
    log.raw.metadata && Object.keys(log.raw.metadata).length > 0;

  return (
    <article className="rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700 sm:h-10 sm:w-10">
          {getInitials(log.user.fullName)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-gray-900">
                {log.description}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  {log.action}
                </span>
                <span aria-hidden="true">&middot;</span>
                <span>{log.time}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${sev.classes}`}
              >
                {sev.label}
              </span>
              {hasRawData && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  aria-expanded={expanded}
                  aria-label={expanded ? "Hide details" : "Show details"}
                >
                  {expanded ? (
                    <FaChevronDown className="h-3 w-3" />
                  ) : (
                    <FaChevronRight className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {expanded && hasRawData && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">
            <FaInfoCircle className="h-3 w-3" />
            Technical Details
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            {Object.entries(log.raw.metadata).map(([key, value]) => {
              const display =
                typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value);
              return (
                <div
                  key={key}
                  className="flex gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5"
                >
                  <span className="shrink-0 font-medium capitalize text-gray-500">
                    {key.replace(/_/g, " ")}:
                  </span>
                  <span className="break-all text-gray-700">{display}</span>
                </div>
              );
            })}
            {log.raw.changes && (
              <div className="mt-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
                <span className="font-medium capitalize text-gray-500">
                  Changes:
                </span>
                <pre className="mt-0.5 overflow-x-auto text-[11px] text-gray-600">
                  {JSON.stringify(log.raw.changes, null, 1)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

export const UserActivityTimeline = ({ userId }: UserActivityTimelineProps) => {
  const [dayFilter, setDayFilter] = useState<DayFilter>("today");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const query = useUserActivityTimeline(userId, dayFilter, page);

  const groupedLogs = useMemo(() => {
    const logs = query.data?.logs ?? [];
    const groups = new Map<string, UserActivityLog[]>();

    logs.forEach((log) => {
      const key = getDayLabel(log.timestamp);
      const existing = groups.get(key) ?? [];
      existing.push(log);
      groups.set(key, existing);
    });

    return Array.from(groups.entries());
  }, [query.data?.logs]);

  const handleFilterChange = (value: DayFilter) => {
    setDayFilter(value);
    setPage(1);
    setExpandedId(null);
  };

  const pagination = query.data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DAY_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              dayFilter === f.value
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : groupedLogs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
          No activity found for this period.
        </div>
      ) : (
        <>
          {groupedLogs.map(([day, logs]) => (
            <div key={day}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {day}
              </div>
              <div className="space-y-2">
                {logs.map((log) => (
                  <ActivityCard
                    key={log._id}
                    log={log}
                    expanded={expandedId === log._id}
                    onToggle={() =>
                      setExpandedId(expandedId === log._id ? null : log._id)
                    }
                  />
                ))}
              </div>
            </div>
          ))}

          {pagination && (
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {query.isFetching && !query.isLoading && (
        <div className="flex justify-center py-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      )}
    </div>
  );
};

export default UserActivityTimeline;
