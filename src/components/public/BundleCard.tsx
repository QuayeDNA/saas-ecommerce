import { memo } from "react";
import {
  FaWifi,
  FaBagShopping,
  FaCircleCheck,
  FaBuilding,
  FaIdCard,
} from "react-icons/fa6";
import { getProviderColors } from "../../utils/provider-colors";
import type { PublicBundle } from "../../services/storefront.service";
import { fmt, fmtValidity } from "./utils";

// =============================================================================
// Bundle Card — provider-color gradient, card-only layout
// =============================================================================

export const BundleCard = memo(
  ({
    bundle,
    selected,
    onBuy,
    disabled,
    logoUrl,
  }: {
    bundle: PublicBundle;
    selected: boolean;
    onBuy: (b: PublicBundle) => void;
    disabled?: boolean;
    logoUrl?: string;
  }) => {
    const pc = getProviderColors(bundle.provider);
    const isAfa = bundle.provider?.toUpperCase() === "AFA";
    const hasData = bundle.dataVolume != null && bundle.dataVolume > 0;

    return (
      <article
        onClick={disabled ? undefined : () => onBuy(bundle)}
        className={`group relative rounded-2xl overflow-hidden transition-all duration-300 select-none ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:scale-[1.04] hover:-translate-y-1 active:scale-[0.97]"}`}
        style={{
          backgroundColor: pc.primary,
          color: pc.text,
          boxShadow: selected
            ? `0 0 0 3px #fff, 0 0 0 5px ${pc.primary}, 0 16px 40px ${pc.primary}55`
            : `0 6px 20px ${pc.primary}40`,
          border: `1px solid ${pc.secondary}33`,
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => !disabled && e.key === "Enter" && onBuy(bundle)}
        aria-label={`${disabled ? "Orders paused" : `Buy ${bundle.name} — ${fmt(bundle.price)}`}`}
        aria-disabled={disabled}
      >
        {/* Top shimmer edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
        {/* Selected indicator */}
        {selected && (
          <div
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full shadow-md flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-surface)" }}
          >
            <FaCircleCheck className="w-4 h-4" style={{ color: pc.primary }} />
          </div>
        )}

        <div className="relative p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={`${bundle.providerName || bundle.provider} logo`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaBuilding className="w-5 h-5 text-white/85" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black uppercase tracking-[0.2em] opacity-80 truncate">
                  {bundle.providerName || bundle.provider}
                </div>
                {bundle.packageName && (
                  <div className="text-xs opacity-80 truncate">
                    {bundle.packageName}
                  </div>
                )}
              </div>
            </div>
            {isAfa && bundle.requiresGhanaCard && (
              <span className="text-[9px] bg-white/20 rounded-full px-1.5 py-0.5 font-semibold flex items-center gap-0.5">
                <FaIdCard className="w-2 h-2" /> ID
              </span>
            )}
          </div>

          {/* Data volume — hero */}
          <div>
            {hasData ? (
              <>
                <div className="leading-none">
                  <span className="text-4xl font-black tracking-tight">
                    {bundle.dataVolume}
                  </span>
                  <span className="text-xl font-bold ml-1 opacity-90">
                    {bundle.dataUnit}
                  </span>
                </div>
                <div className="text-xs opacity-80 mt-1 font-medium line-clamp-2">
                  {bundle.name}
                </div>
              </>
            ) : (
              <div className="text-base font-black leading-snug line-clamp-2">
                {bundle.name}
              </div>
            )}
          </div>

          {/* Validity pill */}
          <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-[11px] font-semibold">
            <FaWifi className="w-2.5 h-2.5 opacity-80" />
            {fmtValidity(bundle.validity, bundle.validityUnit)}
          </div>
        </div>

        {/* Bottom: price + buy CTA — full width, outside padding */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-500 border-t border-white/15">
          <span className="text-xl font-extrabold">{fmt(bundle.price)}</span>
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-white font-black shadow transition-all group-hover:shadow-lg">
            <FaBagShopping className="w-5 h-5" /> Buy
          </div>
        </div>
      </article>
    );
  },
);
