import { memo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Check } from "lucide-react";
import type { NavItem as NavItemConfig } from "./nav-config";

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
  const active = isActive || hasActiveChild;

  const sharedClasses =
    `flex items-center px-3 py-3 rounded-md text-sm transition-all duration-200 ` +
    `${active ? "text-white shadow-md" : "text-white/60 hover:text-white"} ` +
    `hover:bg-[var(--color-primary-hover)] ${level > 0 ? "ml-6" : ""}`;

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => onToggle(item.path)}
          className={sharedClasses}
          style={{
            backgroundColor: hasActiveChild
              ? "var(--color-secondary-500)"
              : "transparent",
          }}
        >
          <div className="flex items-center min-w-0 flex-1">
            <span
              className={`mr-3 flex-shrink-0 text-white ${level > 0 ? "text-xs" : ""}`}
            >
              {item.icon}
            </span>
            <span className="font-medium truncate">{item.label}</span>
          </div>
          <span
            className={`flex-shrink-0 transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            <ChevronRight size={12} />
          </span>
        </button>
        {isExpanded && (
          <ul className="mt-1 space-y-1">
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

  return (
    <li>
      <Link
        to={item.path}
        onClick={onClose}
        className={sharedClasses}
        style={{
          backgroundColor: isActive
            ? "var(--color-secondary-700)"
            : "transparent",
        }}
      >
        <span
          className={`mr-3 flex-shrink-0 ${
            isActive ? "text-white" : "text-white/90"
          } ${level > 0 ? "text-xs" : ""}`}
        >
          {item.icon}
        </span>
        <span className={`font-medium truncate ${level > 0 ? "text-sm" : ""}`}>
          {item.label}
        </span>
        {isActive && (
          <span className="ml-auto flex-shrink-0">
            <Check className="w-5 h-5" />
          </span>
        )}
      </Link>
    </li>
  );
});
