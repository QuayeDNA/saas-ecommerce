import React from "react";

interface SettingRowProps {
  children: React.ReactNode;
}

export const SettingRow: React.FC<SettingRowProps> = ({ children }) => (
  <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-muted)' }}>
    {children}
  </div>
);
