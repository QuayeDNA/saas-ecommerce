import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      {subtitle && <p className="text-sm mt-1 text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
    {action}
  </div>
);
