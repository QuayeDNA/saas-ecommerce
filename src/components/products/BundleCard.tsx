import { memo, type ReactNode } from "react";
import { getProviderColors } from "../../utils/provider-colors";
import type { PublicBundle } from "../../services/storefront.service";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface BundleCardPropsBase {
  /** Highlight with brand-colored border + checkmark */
  selected?: boolean;
  /** Reduced opacity + no pointer events */
  disabled?: boolean;
  /** Shows "Inactive" badge + dims card */
  inactive?: boolean;

  /** Whole-card click handler */
  onClick?: () => void;

  /** Content rendered inside the top (brand-colored) deck */
  children?: ReactNode;
  /** Content rendered in the gray bottom deck (actions, info, OutOfStock) */
  actions?: ReactNode;

  className?: string;
}

export type BundleCardLegacyProps = BundleCardPropsBase & {
  /** Provider brand hex for the top deck background */
  brandColor: string;
  /** Text color for top deck content (defaults to white) */
  brandTextColor?: string;
  /** Small provider label, e.g. "MTN" */
  providerBadge?: string;
  /** Large data volume display, e.g. "2GB" */
  dataVolume?: string;
  /** Smaller text below data volume (e.g. bundle name) */
  subtitle?: string;
  bundle?: never;
  onBuy?: never;
};

export type BundleCardBundleProps = BundleCardPropsBase & {
  bundle: PublicBundle;
  onBuy?: (bundle: PublicBundle) => void;
  brandColor?: string;
  brandTextColor?: string;
  providerBadge?: string;
  dataVolume?: string;
  subtitle?: string;
};

export type BundleCardProps = BundleCardLegacyProps | BundleCardBundleProps;

/* ─── Main component ─────────────────────────────────────────────────────── */

type BundleCardComponent = React.NamedExoticComponent<BundleCardProps> & {
  DiscountBadge: React.NamedExoticComponent<{
    percent: number;
    originalPrice: string;
  }>;
  OutOfStock: React.NamedExoticComponent<object>;
  InfoColumn: React.NamedExoticComponent<{
    value: string;
    label: string;
  }>;
  Actions: React.NamedExoticComponent<{
    children?: ReactNode;
    className?: string;
  }>;
  Skeleton: React.NamedExoticComponent<object>;
};

function BundleCardBase({
  brandColor,
  brandTextColor = "#fff",
  providerBadge,
  dataVolume,
  subtitle,
  selected = false,
  disabled = false,
  inactive = false,
  onClick,
  bundle,
  onBuy,
  children,
  actions,
  className = "",
}: BundleCardProps) {
  const providerColors = getProviderColors(bundle?.provider);
  const resolvedBrandColor = brandColor ?? providerColors.primary;
  const resolvedBrandTextColor = brandTextColor ?? providerColors.text;
  const resolvedProviderBadge =
    providerBadge ?? bundle?.providerName ?? bundle?.provider;
  const resolvedDataVolume =
    dataVolume ??
    (bundle ? `${bundle.dataVolume ?? ""}${bundle.dataUnit ?? ""}` : undefined);
  const resolvedSubtitle = subtitle ?? bundle?.name;
  const isClickable = !!(onClick || (bundle && onBuy)) && !disabled;

  const handleClick = () => {
    if (disabled) return;
    if (onClick) return onClick();
    if (bundle && onBuy) return onBuy(bundle);
  };

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick();
              }
            }
          : undefined
      }
      aria-disabled={disabled || undefined}
      className={[
        "relative flex flex-col overflow-hidden rounded-xl bg-white",
        "transition-all duration-200",
        isClickable ? "cursor-pointer" : "",
        disabled ? "opacity-60" : "",
        inactive ? "opacity-60" : "",
        selected
          ? "shadow-[0_0_0_2px_white,_0_0_0_4px_var(--brand-border)]"
          : "",
        className,
      ].join(" ")}
      style={
        selected
          ? ({ "--brand-border": brandColor } as React.CSSProperties)
          : undefined
      }
    >
      {/* ── Top deck: brand color ───────────────────────────────────────── */}
      <div
        className="flex flex-col gap-1.5 p-4"
        style={{
          backgroundColor: resolvedBrandColor,
          color: resolvedBrandTextColor,
        }}
      >
        {/* Provider badge + data volume */}
        {(resolvedProviderBadge || resolvedDataVolume) && (
          <div className="flex items-center justify-between">
            {resolvedProviderBadge && (
              <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">
                {resolvedProviderBadge}
              </span>
            )}
            {resolvedDataVolume && (
              <span className="text-2xl font-extrabold leading-none tracking-tight">
                {resolvedDataVolume}
              </span>
            )}
          </div>
        )}

        {/* Subtitle */}
        {resolvedSubtitle && (
          <span
            className="text-sm leading-snug opacity-90"
            style={{ color: resolvedBrandTextColor }}
          >
            {resolvedSubtitle}
          </span>
        )}

        {/* Inactive badge */}
        {inactive && (
          <span
            className="self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              color: brandTextColor,
            }}
          >
            Inactive
          </span>
        )}

        {/* Children (name, price, description, discount, category, etc.) */}
        {children && <div className="flex flex-col gap-1">{children}</div>}
      </div>

      {/* ── Bottom deck: gray ──────────────────────────────────────────── */}
      {actions && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-2.5"
          style={{ backgroundColor: "#535c68", color: "#fff" }}
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </div>
  );
}

export const BundleCard = memo(
  BundleCardBase,
) as unknown as BundleCardComponent;

/* ─── Sub-components ─────────────────────────────────────────────────────── */

BundleCard.DiscountBadge = memo(function DiscountBadge({
  percent,
  originalPrice,
}: {
  percent: number;
  originalPrice: string;
}) {
  if (percent <= 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold"
        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
      >
        {percent}% OFF
      </span>
      <span className="text-sm opacity-60 line-through">{originalPrice}</span>
    </div>
  );
});

BundleCard.OutOfStock = memo(function OutOfStock() {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
      Out of Stock
    </span>
  );
});

BundleCard.InfoColumn = memo(function InfoColumn({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center">
      <span className="text-xs font-bold whitespace-nowrap">{value}</span>
      <span className="text-[9px] opacity-70 mt-px">{label}</span>
    </div>
  );
});

BundleCard.Actions = memo(function BundleCardActions({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={["flex flex-wrap gap-2 px-4 py-2.5", className].join(" ")}>
      {children}
    </div>
  );
});

BundleCard.Skeleton = memo(function BundleCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white">
      <div className="h-20 animate-pulse rounded-t-xl bg-gray-200" />
      <div
        className="h-10 animate-pulse rounded-b-xl"
        style={{ backgroundColor: "#535c68" }}
      />
    </div>
  );
});
