import { memo, useEffect, useState } from "react";

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

export const StoreHeader = memo(function StoreHeader({
  storefront,
  branding,
}: StoreHeaderProps) {
  const displayName = storefront.displayName || storefront.businessName || "";
  const tagline =
    branding.tagline || pickTagline(storefront.businessName || displayName);
  const logoSrc = branding.logoUrl || "/icons/store-icon.png";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className={`sh-header ${mounted ? "is-mounted" : ""}`}>
      <div className="sh-header__inner">
        <div className="sh-header__logo-wrap">
          <img src={logoSrc} alt={displayName} className="sh-header__logo" />
        </div>
        <h1 className="sh-header__name">{displayName}</h1>
        <div className="sh-header__rule" />
        {tagline && <p className="sh-header__tagline">{tagline}</p>}
      </div>

      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@1,700,800&f[]=satoshi@1,300,400&display=swap');

        .sh-header {
          display: flex;
          justify-content: center;
          padding: clamp(48px, 10vw, 100px) clamp(20px, 5vw, 64px) clamp(40px, 6vw, 72px);
        }

        .sh-header__inner {
          max-width: 640px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 700ms cubic-bezier(0.19, 1, 0.22, 1),
                      transform 700ms cubic-bezier(0.19, 1, 0.22, 1);
        }

        .sh-header.is-mounted .sh-header__inner {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Logo ──────────────────────────────────────── */

        .sh-header__logo-wrap {
          margin-bottom: clamp(20px, 3.5vw, 36px);
          opacity: 0;
          transform: scale(0.92);
          transition: opacity 500ms ease-out, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
          transition-delay: 150ms;
        }

        .sh-header.is-mounted .sh-header__logo-wrap {
          opacity: 1;
          transform: scale(1);
        }

        .sh-header__logo {
          display: block;
          height: clamp(72px, 11vw, 104px);
          width: clamp(72px, 11vw, 104px);
          border-radius: 24px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        /* ── Name ──────────────────────────────────────── */

        .sh-header__name {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 800;
          font-size: clamp(32px, 8.5vw, 80px);
          line-height: 0.92;
          letter-spacing: -0.045em;
          margin: 0;
          color: #fff;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 600ms ease-out, transform 600ms cubic-bezier(0.19, 1, 0.22, 1);
          transition-delay: 300ms;
        }

        .sh-header.is-mounted .sh-header__name {
          opacity: 1;
          transform: translateY(0);
        }

        .sh-header__name:empty::before {
          content: "Your Store";
          opacity: 0.35;
          color: #fff;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-weight: 800;
        }

        /* ── Decorative rule ───────────────────────────── */

        .sh-header__rule {
          margin-top: clamp(16px, 2.5vw, 28px);
          width: 0;
          height: 2px;
          border-radius: 1px;
          background: #fff;
          opacity: 0.25;
          transition: width 800ms cubic-bezier(0.19, 1, 0.22, 1);
          transition-delay: 500ms;
        }

        .sh-header.is-mounted .sh-header__rule {
          width: clamp(48px, 8vw, 96px);
        }

        /* ── Tagline ───────────────────────────────────── */

        .sh-header__tagline {
          font-family: 'Satoshi', sans-serif;
          font-weight: 300;
          font-size: clamp(14px, 2.2vw, 19px);
          line-height: 1.65;
          letter-spacing: 0.01em;
          color: rgba(255, 255, 255, 0.75);
          margin: clamp(16px, 2.5vw, 28px) 0 0;
          max-width: 32em;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 600ms ease-out, transform 600ms cubic-bezier(0.19, 1, 0.22, 1);
          transition-delay: 650ms;
        }

        .sh-header.is-mounted .sh-header__tagline {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Motion safety ─────────────────────────────── */

        @media (prefers-reduced-motion: reduce) {
          .sh-header__inner,
          .sh-header__logo-wrap,
          .sh-header__name,
          .sh-header__rule,
          .sh-header__tagline {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
            width: clamp(48px, 8vw, 96px);
          }
        }
      `}</style>
    </header>
  );
});
