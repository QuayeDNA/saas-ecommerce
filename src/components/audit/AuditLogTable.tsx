import { useMemo, useState } from "react";
import { FaChevronDown, FaChevronRight, FaDownload } from "react-icons/fa";
import {
  Badge,
  Button,
  Card,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  useToast,
} from "../../design-system";
import { SearchAndFilter } from "../common/SearchAndFilter";
import type { FilterOption } from "../common/SearchAndFilter";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import { useAuditLogRealtime } from "../../hooks/useAuditLogRealtime";
import { auditLogService } from "../../services/auditLogService";
import type { AuditLog } from "../../types/auditLog";
import {
  formatAction,
  formatCategory,
  formatMetadataEntries,
  formatChanges,
  formatTimestamp,
} from "./auditHelpers";

type SortField = "timestamp" | "user" | "action" | "category";
type SortDirection = "asc" | "desc";

const severityColor = (severity: AuditLog["severity"]) => {
  if (severity === "critical") return "error";
  if (severity === "warning") return "warning";
  return "info";
};

const categoryFilterOptions: FilterOption[] = [
  { value: "auth", label: "Authentication" },
  { value: "user", label: "User Management" },
  { value: "order", label: "Orders" },
  { value: "wallet", label: "Wallet" },
  { value: "storefront", label: "Storefront" },
  { value: "payout", label: "Payouts" },
  { value: "settings", label: "Settings" },
  { value: "bundle", label: "Bundles" },
];

const severityFilterOptions: FilterOption[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

export const AuditLogTable = (_props?: { filters?: any }) => {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useAuditLogRealtime(true);

  const { data, isLoading, isFetching } = useAuditLogs({
    search: searchTerm || undefined,
    category: category || undefined,
    severity: severity || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });

  const sortedLogs = useMemo(() => {
    const source = [...(data?.logs ?? [])];

    source.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortField === "timestamp") {
        return (
          (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) *
          direction
        );
      }

      if (sortField === "user") {
        const left =
          `${a.user?.fullName ?? ""} ${a.user?.email ?? ""}`.toLowerCase();
        const right =
          `${b.user?.fullName ?? ""} ${b.user?.email ?? ""}`.toLowerCase();
        return left.localeCompare(right) * direction;
      }

      return (
        String(a[sortField]).localeCompare(String(b[sortField])) * direction
      );
    });

    return source;
  }, [data?.logs, sortDirection, sortField]);

  const onSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  };

  const onExport = async () => {
    try {
      const blob = await auditLogService.exportLogs({
        search: searchTerm || undefined,
        category: category || undefined,
        severity: severity || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      addToast("Audit logs export started", "success");
    } catch {
      addToast("Failed to export audit logs", "error");
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "category") setCategory(value);
    if (key === "severity") setSeverity(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategory("");
    setSeverity("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const pagination = data?.pagination ?? { page: 1, pages: 1, total: 0, limit };

  return (
    <div className="space-y-4">
      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by user or action..."
        filters={{
          category: {
            value: category,
            options: categoryFilterOptions,
            label: "Category",
            placeholder: "All categories",
          },
          severity: {
            value: severity,
            options: severityFilterOptions,
            label: "Severity",
            placeholder: "All severities",
          },
        }}
        onFilterChange={handleFilterChange}
        showDateRange
        dateRange={{ startDate, endDate }}
        onDateRangeChange={(s, e) => {
          setStartDate(s);
          setEndDate(e);
          setPage(1);
        }}
        onSearch={(e) => {
          e.preventDefault();
          setPage(1);
        }}
        onClearFilters={handleClearFilters}
        customActions={
          <Button variant="outline" size="sm" onClick={onExport}>
            <FaDownload className="mr-2" /> Export CSV
          </Button>
        }
      />

      <Card variant="outlined" className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {isLoading ? "Loading logs..." : `${pagination.total} logs found`}
            {isFetching && !isLoading ? " (refreshing)" : ""}
          </div>
        </div>

        <Table variant="bordered" size="sm" fullWidth>
          <TableHeader>
            <TableRow>
              <TableHeaderCell
                sortable
                sortDirection={sortField === "timestamp" ? sortDirection : null}
                onSort={() => onSort("timestamp")}
              >
                Timestamp
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sortField === "user" ? sortDirection : null}
                onSort={() => onSort("user")}
              >
                User
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sortField === "action" ? sortDirection : null}
                onSort={() => onSort("action")}
              >
                Action
              </TableHeaderCell>
              <TableHeaderCell
                sortable
                sortDirection={sortField === "category" ? sortDirection : null}
                onSort={() => onSort("category")}
              >
                Category
              </TableHeaderCell>
              <TableHeaderCell>Severity</TableHeaderCell>
              <TableHeaderCell>Details</TableHeaderCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sortedLogs.map((log) => {
              const isExpanded = expandedId === log._id;
              const changes = formatChanges(log.changes);
              const metadata = formatMetadataEntries(log.metadata);
              const actionLabel = formatAction(log.action);
              const categoryLabel = formatCategory(log.category);

              return (
                <>
                  <TableRow key={log._id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm">
                        {formatTimestamp(log.timestamp)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {log.user?.fullName || "System"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.user?.email || log.userId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{actionLabel}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" size="sm">
                        {categoryLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="subtle"
                        colorScheme={severityColor(log.severity)}
                      >
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : log._id)
                        }
                      >
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow key={`${log._id}-details`}>
                      <TableCell colSpan={6} className="bg-gray-50">
                        <div className="grid gap-6 md:grid-cols-2">
                          {changes.length > 0 && (
                            <div>
                              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Changes
                              </h4>
                              <div className="space-y-2">
                                {changes.map((c) => (
                                  <div
                                    key={c.field}
                                    className="rounded border border-gray-200 bg-white p-2 text-sm"
                                  >
                                    <div className="mb-1 font-medium text-gray-700">
                                      {c.field}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700 line-through">
                                        {c.from}
                                      </span>
                                      <span className="text-gray-400">
                                        &rarr;
                                      </span>
                                      <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-700">
                                        {c.to}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {metadata.length > 0 && (
                            <div>
                              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Metadata
                              </h4>
                              <div className="space-y-1">
                                {metadata.map(({ label, value }) => (
                                  <div
                                    key={label}
                                    className="flex gap-2 text-sm"
                                  >
                                    <span className="min-w-[100px] font-medium text-gray-600">
                                      {label}:
                                    </span>
                                    <span className="text-gray-800 break-all">
                                      {value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {changes.length === 0 && metadata.length === 0 && (
                            <div className="text-sm text-gray-400 col-span-2">
                              No additional details available.
                            </div>
                          )}

                          {log.ipAddress && (
                            <div className="text-xs text-gray-400 col-span-2">
                              IP: {log.ipAddress}
                              {log.userAgent
                                ? ` · Agent: ${log.userAgent.slice(0, 80)}${log.userAgent.length > 80 ? "..." : ""}`
                                : ""}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}

            {!isLoading && sortedLogs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-sm text-gray-500"
                >
                  No audit logs found for current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={setPage}
            onItemsPerPageChange={(next) => {
              setLimit(next);
              setPage(1);
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default AuditLogTable;
