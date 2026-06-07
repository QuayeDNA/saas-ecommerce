type CommissionStatusFilter = "all" | "pending" | "credited" | "cancelled";

interface ReferralCommissionFilterProps {
  value: CommissionStatusFilter;
  onChange: (filter: CommissionStatusFilter) => void;
}

const FILTERS: CommissionStatusFilter[] = ["all", "pending", "credited", "cancelled"];

export const ReferralCommissionFilter = ({ value, onChange }: ReferralCommissionFilterProps) => (
  <div className="flex gap-1 flex-wrap">
    {FILTERS.map((filter) => (
      <button
        key={filter}
        type="button"
        onClick={() => onChange(filter)}
        className="px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors"
        style={{
          background: value === filter ? "var(--color-secondary)" : "var(--bg-surface)",
          color: value === filter ? "white" : "var(--text-secondary)",
          borderColor: value === filter ? "var(--color-secondary)" : "var(--border-color)",
        }}
      >
        {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
      </button>
    ))}
  </div>
);
