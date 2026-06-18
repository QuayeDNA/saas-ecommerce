// ─── Creative Brief ──────────────────────────────────────────────────────────
// Editorial typographic monument — the store name as an architectural letterform.
// Dramatic Fraunces weight contrast (300 ↔ 900), staggered cinematic reveal,
// pure type-as-layout with zero decoration. No background, no images, no colors.
// Signature moment: each letter rises into place with a subtle rotation, and
// the first letter stands permanently enlarged like a fine-press drop cap.
// ─────────────────────────────────────────────────────────────────────────────

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chars = displayName.split("");

  return (
    <header className="sh-header">
      <div className="sh-header__inner">
        <h1 className="sh-header__name">
          {chars.map((char, i) => (
            <span
              key={i}
              className="sh-header__char"
              aria-hidden={char === " " ? undefined : undefined}
              style={{
                "--i": i,
                animationPlayState: mounted ? "running" : "paused",
              } as React.CSSProperties}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
        {tagline && <p className="sh-header__tagline">{tagline}</p>}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300,50,1;9..144,900,50,1&display=swap');

        .sh-header {
          --sh-font: 'Fraunces', Georgia, serif;
          --sh-ease: cubic-bezier(0.19, 1, 0.22, 1);

          display: flex;
          justify-content: center;
          padding: clamp(56px, 12vw, 120px) clamp(20px, 5vw, 64px);
        }

        .sh-header__inner {
          max-width: 800px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* ── Name ─────────────────────────────────────── */

        .sh-header__name {
          font-family: var(--sh-font);
          font-weight: 900;
          font-size: clamp(34px, 9vw, 88px);
          line-height: 0.9;
          letter-spacing: -0.04em;
          font-variation-settings: 'SOFT' 60, 'WONK' 1;
          margin: 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        .sh-header__char {
          display: inline-block;
          position: relative;
          opacity: 0;
          transform: translateY(28px) rotateX(-30deg);
          animation: sh-char-in 650ms var(--sh-ease) forwards;
          animation-delay: calc(var(--i, 0) * 45ms);
          transform-origin: bottom center;
          perspective: 600px;
          transition: letter-spacing 300ms var(--sh-ease);
        }

        /* First letter — monumental drop cap */
        .sh-header__char:first-child {
          font-size: 1.2em;
          letter-spacing: -0.06em;
          margin-right: 0.02em;
        }

        /* On hover over the name, letters fan apart subtly */
        .sh-header__name:hover .sh-header__char {
          letter-spacing: 0.02em;
        }
        .sh-header__name:hover .sh-header__char:first-child {
          letter-spacing: -0.02em;
        }

        /* ── Tagline ───────────────────────────────────── */

        .sh-header__tagline {
          font-family: var(--sh-font);
          font-weight: 300;
          font-size: clamp(15px, 2.4vw, 21px);
          line-height: 1.7;
          letter-spacing: -0.005em;
          font-variation-settings: 'SOFT' 50, 'WONK' 0;
          margin: clamp(20px, 4vw, 40px) 0 0;
          max-width: 32em;
          opacity: 0;
          animation: sh-tagline-in 700ms var(--sh-ease) forwards;
          animation-delay: calc(0.4s + ${chars.length * 45}ms);
        }

        /* ── Animations ────────────────────────────────── */

        @keyframes sh-char-in {
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
          }
        }

        @keyframes sh-tagline-in {
          to {
            opacity: 0.72;
          }
        }

        /* ── Motion safety ─────────────────────────────── */

        @media (prefers-reduced-motion: reduce) {
          .sh-header__char {
            opacity: 1;
            transform: none;
            animation: none;
            transition: none;
          }
          .sh-header__tagline {
            opacity: 0.72;
            animation: none;
          }
          .sh-header__name:hover .sh-header__char {
            letter-spacing: inherit;
          }
        }

        /* ── Empty / edge state ────────────────────────── */

        .sh-header__name:empty::before {
          content: "Your Store";
          opacity: 0.35;
        }
      `}</style>
    </header>
  );
});
