import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type TabsVariant = "default" | "file";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant: TabsVariant;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  variant?: TabsVariant;
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className = "",
  variant = "default",
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultValue || "",
  );

  const activeTab = value !== undefined ? value : internalActiveTab;
  const setActiveTab = (tab: string) => {
    if (onValueChange) {
      onValueChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export function TabsList({ children, className = "" }: TabsListProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsList must be used within Tabs");

  const base = context.variant === "file"
    ? "flex overflow-x-auto flex-nowrap scroll-smooth text-[var(--text-secondary)]"
    : "flex w-full overflow-x-auto flex-nowrap scroll-smooth h-10 items-center justify-center rounded-lg bg-[var(--bg-surface-alt)] p-1 text-[var(--text-secondary)]";

  return (
    <div className={`${base} ${className}`} role="tablist">
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsTrigger({
  value,
  children,
  className = "",
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const { activeTab, setActiveTab, variant } = context;
  const isActive = activeTab === value;

  const base = variant === "file"
    ? `inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-colors relative
       ${isActive
         ? "text-[var(--text-primary)] bg-[var(--bg-surface)] rounded-t-md border border-[var(--border-color)] border-b-0 -mb-px"
         : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
       }`
    : `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium 
       ring-offset-[var(--bg-surface)] transition-all focus-visible:outline-none focus-visible:ring-2 
       focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none 
       disabled:opacity-50
       ${
         isActive
           ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
           : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
       }`;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={`${base} ${className}`}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabsContent({
  value,
  children,
  className = "",
}: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  const { activeTab, variant } = context;

  if (activeTab !== value) return null;

  const panelClass = variant === "file"
    ? "border border-t-0 border-[var(--border-color)] rounded-b-md p-4 bg-[var(--bg-surface)]"
    : "mt-2";

  return (
    <div
      role="tabpanel"
      className={`ring-offset-[var(--bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${panelClass} ${className}`}
    >
      {children}
    </div>
  );
}
