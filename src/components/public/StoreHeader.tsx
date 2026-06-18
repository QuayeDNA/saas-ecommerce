import { memo } from "react";

interface StoreHeaderProps {
  storefront: {
    displayName?: string;
    businessName?: string;
  };
  branding: {
    logoUrl?: string;
    tagline?: string;
  };
}

const TAGLINES = [
  "Fast data, great prices — always.",
  "Your trusted data partner in Ghana.",
  "Affordable bundles, delivered instantly.",
  "Stay connected without breaking the bank.",
  "Top-up in seconds. Browse all day.",
  "Ghana's most reliable data deals.",
  "Smart data for smart people.",
  "Always online, always affordable.",
  "Power up your connection today.",
  "Bundle up and save more.",
  "Reliable data at unbeatable prices.",
  "Your go-to stop for data bundles.",
  "Connecting Ghana, one bundle at a time.",
  "Fastest top-ups, happiest customers.",
  "Data deals that make sense.",
  "Browse more, pay less.",
  "Your network. Your savings. Our service.",
  "Quality bundles from a trusted source.",
  "Instant top-up, zero hassle.",
  "Because staying connected matters.",
];

function pickTagline(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TAGLINES[hash % TAGLINES.length];
}

export const StoreHeader = memo(
  ({ storefront, branding }: StoreHeaderProps) => {
    const displayName = storefront.displayName || storefront.businessName || "";
    const tagline =
      branding.tagline || pickTagline(storefront.businessName || displayName);
    const logoSrc = branding.logoUrl || "/icons/store-icon.png";

    return (
      <div className="flex flex-col items-center gap-5 py-14 sm:py-16 px-4">
        <img
          src={logoSrc}
          alt={displayName}
          className="h-24 w-24 rounded-2xl object-cover shrink-0"
        />
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
          {displayName}
        </h1>
        {tagline && (
          <p className="text-sm sm:text-base max-w-md">
            {tagline}
          </p>
        )}
      </div>
    );
  },
);
