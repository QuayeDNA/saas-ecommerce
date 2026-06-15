import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

// ─── Context types ──────────────────────────────────────────────────────────

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
}

const AccordionItemContext = createContext<AccordionItemContextValue | undefined>(undefined);

// ─── Accordion Root ──────────────────────────────────────────────────────────

interface AccordionProps {
  children: ReactNode;
  type?: "single" | "multiple";
  value?: string[];
  onValueChange?: (value: string[]) => void;
  defaultValue?: string[];
  className?: string;
}

export function Accordion({
  children,
  type = "single",
  value,
  onValueChange,
  defaultValue = [],
  className = "",
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);

  const openItems = value !== undefined ? value : internalValue;

  const toggleItem = useCallback((itemValue: string) => {
    const next = openItems.includes(itemValue)
      ? openItems.filter((v) => v !== itemValue)
      : type === "single"
        ? [itemValue]
        : [...openItems, itemValue];

    if (onValueChange) {
      onValueChange(next);
    } else {
      setInternalValue(next);
    }
  }, [openItems, type, onValueChange]);

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={`space-y-1 ${className}`}>{children}</div>
    </AccordionContext.Provider>
  );
}

// ─── AccordionItem ───────────────────────────────────────────────────────────

interface AccordionItemProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function AccordionItem({ value, children, className = "" }: AccordionItemProps) {
  const root = useContext(AccordionContext);
  const isOpen = root ? root.openItems.includes(value) : false;

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div className={`border border-[var(--border-color)] rounded-md overflow-hidden ${className}`}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// ─── AccordionTrigger ────────────────────────────────────────────────────────

interface AccordionTriggerProps {
  children: ReactNode;
  className?: string;
}

export function AccordionTrigger({ children, className = "" }: AccordionTriggerProps) {
  const root = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);
  if (!root) throw new Error("AccordionTrigger must be used within Accordion");
  if (!item) throw new Error("AccordionTrigger must be used within AccordionItem");

  const isOpen = item.isOpen;

  return (
    <button
      type="button"
      onClick={() => root.toggleItem(item.value)}
      className={`w-full flex items-center gap-3 p-3 hover:bg-[var(--bg-surface)] transition-colors text-left ${className}`}
      aria-expanded={isOpen}
    >
      <ChevronDown
        className={`w-4 h-4 shrink-0 transition-transform text-[var(--text-secondary)] ${isOpen ? "" : "-rotate-90"}`}
      />
      {children}
    </button>
  );
}

// ─── AccordionContent ────────────────────────────────────────────────────────

interface AccordionContentProps {
  children: ReactNode;
  className?: string;
}

export function AccordionContent({ children, className = "" }: AccordionContentProps) {
  const root = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);
  if (!root) throw new Error("AccordionContent must be used within Accordion");
  if (!item) throw new Error("AccordionContent must be used within AccordionItem");

  if (!root.openItems.includes(item.value)) return null;

  return (
    <div className={`border-t border-[var(--border-color)] p-4 space-y-4 bg-[var(--bg-surface)] ${className}`}>
      {children}
    </div>
  );
}
