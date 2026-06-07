import { memo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { NavItem as NavItemConfig } from "./nav-config";

/* ─── Types ────────────────────────────────────────────────────────────────── */

interface NavItemProps {
  item: NavItemConfig;
  level: number;
  isActive: boolean;
  isExpanded: boolean;
  hasActiveChild: boolean;
  checkActive: (path: string) => boolean;
  onToggle: (path: string) => void;
  onClose: () => void;
}

/* ─── Shared row classes ────────────────────────────────────────────────────
 *
 * Why CSS variables here instead of Tailwind color utilities?
 * Tailwind utilities like `text-white/60` compile to `rgba(255,255,255,0.6)`
 * at build time and are STATIC. If the sidebar background changes between
 * light/dark modes, those hardcoded values produce invisible or clashing text.
 *
 * Using `text-[var(--sb-text-primary)]` makes the text respond to whatever
 * the sidebar token is set to — no color shifting, ever.
 *
 * The tokens themselves are defined once in Sidebar.tsx.
 * ─────────────────────────────────────────────────────────────────────────── */

const baseRow =
  "group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium " +
  "transition-colors duration-150 " +
  // default text — semantic token, not hardcoded
  "text-[var(--sb-text-secondary)] " +
  // hover — bg + text lift
  "hover:bg-[var(--sb-hover-bg)] hover:text-[var(--sb-text-primary)] " +
  // focus ring
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sb-accent)] focus-visible:ring-offset-0";

const activeRow =
  // background pill + inset left bar via box-shadow (can't do inset bar in Tailwind alone)
  "bg-[var(--sb-active-bg)] text-[var(--sb-text-primary)] shadow-[inset_3px_0_0_var(--sb-accent)] " +
  // keep hover from overriding active background
  "hover:bg-[var(--sb-active-bg)]";

const iconBase = "flex-shrink-0 text-base leading-none transition-colors duration-150";
const iconActive = "text-[var(--sb-text-primary)]";
const iconInactive = "text-[var(--sb-text-secondary)] group-hover:text-[var(--sb-text-primary)]";

/* ─── Active indicator dot ──────────────────────────────────────────────── */

const ActiveDot = () => (
  <span
    aria-hidden="true"
    className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--sb-accent)]"
  />
);

/* ─── NavItem ───────────────────────────────────────────────────────────── */

export const NavItem = memo(function NavItem({
  item,
  level,
  isActive,
  isExpanded,
  hasActiveChild,
  checkActive,
  onToggle,
  onClose,
}: NavItemProps) {
  const hasChildren = !!item.children?.length;

  /* Parent group (has children) */
  if (hasChildren) {
    const parentActive = hasActiveChild;

    return (
      <li>
        <button
          type="button"
          onClick={() => onToggle(item.path)}
          aria-expanded={isExpanded}
          className={[
            baseRow,
            parentActive ? activeRow : "",
            level > 0 ? "pl-8" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Icon */}
          <span className={[iconBase, parentActive ? iconActive : iconInactive].join(" ")}>
            {item.icon}
          </span>

          {/* Label */}
          <span className="flex-1 truncate text-left">{item.label}</span>

          {/* Chevron */}
          <ChevronRight
            size={13}
            aria-hidden="true"
            className={[
              "flex-shrink-0 transition-transform duration-200",
              isExpanded ? "rotate-90" : "",
              parentActive
                ? "text-[var(--sb-text-primary)]"
                : "text-[var(--sb-text-muted)] group-hover:text-[var(--sb-text-secondary)]",
            ].join(" ")}
          />
        </button>

        {/* Children */}
        {isExpanded && (
          <ul className="mt-0.5 space-y-0.5" role="list">
            {item.children!.map((child) => (
              <NavItem
                key={child.path}
                item={child}
                level={level + 1}
                isActive={checkActive(child.path)}
                isExpanded={false}
                hasActiveChild={false}
                checkActive={checkActive}
                onToggle={onToggle}
                onClose={onClose}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  /* Leaf item (link) */
  return (
    <li>
      <Link
        to={item.path}
        onClick={onClose}
        aria-current={isActive ? "page" : undefined}
        className={[
          baseRow,
          isActive ? activeRow : "",
          level > 0 ? "pl-8 text-xs" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Icon */}
        <span className={[iconBase, isActive ? iconActive : iconInactive].join(" ")}>
          {item.icon}
        </span>

        {/* Label */}
        <span className="flex-1 truncate">{item.label}</span>

        {/* Active indicator */}
        {isActive && <ActiveDot />}
      </Link>
    </li>
  );
});