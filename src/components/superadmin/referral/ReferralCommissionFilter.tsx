type CommissionStatusFilter = "all" | "pending" | "credited" | "cancelled";

interface ReferralCommissionFilterProps {
  value: CommissionStatusFilter;
  onChange: (filter: CommissionStatusFilter) => void;
}

const FILTERS: CommissionStatusFilter[] = ["all", "pending", "credited", "cancelled"];

export const ReferralCommissionFilter = ({ value, onChange }: ReferralCommissionFilterProps) => (
  <div className="flex gap-1.5">
    {FILTERS.map((filter) => (
      <button
        key={filter}
        type="button"
        onClick={() => onChange(filter)}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          value === filter
            ? "bg-[var(--color-secondary)] text-white border-[var(--color-secondary)]"
            : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--color-secondary)]"
        }`}
      >
        {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
      </button>
    ))}
  </div>
);
