// =============================================================================
// Pure Helpers (no hooks — safe to call anywhere)
// =============================================================================

export const fmt = (n: number) => `GH₵ ${n.toFixed(2)}`;

export const normalizePhone = (p: string) => {
  const c = p.replace(/\s+/g, "");
  if (c.startsWith("+233")) return "0" + c.slice(4);
  if (c.startsWith("233")) return "0" + c.slice(3);
  return c;
};

export const normalizeWhatsappNumber = (value?: string) => {
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0")) return `233${digits.slice(1)}`;
  return digits;
};

export const isValidPhone = (p: string) => /^0\d{9}$/.test(normalizePhone(p));
export const fmtValidity = (v: number | string, u: string) =>
  v === "unlimited" || u === "unlimited" ? "Unlimited" : `${v} ${u}`;

export const getLogoUrl = (logo?: { url?: string; alt?: string } | string) =>
  !logo ? undefined : typeof logo === "string" ? logo : logo.url;

// ─── Paystack Inline Helper ───────────────────────────────────────────────────

export async function loadPaystackScript(): Promise<void> {
  if ((window as any).PaystackPop) return;
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v2/inline.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(s);
  });
}

// ─── OG Meta Helpers (store-level sharing) ───────────────────────────────────

function setOGMetaTag(attr: string, content: string) {
  let el = document.querySelector(
    `meta[property="${attr}"]`,
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.querySelector(
      `meta[name="${attr}"]`,
    ) as HTMLMetaElement | null;
  }
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", attr);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function updateStorefrontOGTags(
  storefront: { displayName?: string; businessName?: string; description?: string; branding?: { logoUrl?: string } },
  bundles: Array<{ provider?: string }>,
) {
  const storeTitle =
    storefront.displayName || storefront.businessName || "DirectData";
  const storeDesc =
    storefront.description || "Instant data bundles from trusted agents";
  const bundleCount = bundles.length;
  const networks =
    [...new Set(bundles.map((b) => b.provider).filter(Boolean))].join(", ") ||
    "multiple networks";

  const ogTitle = `${storeTitle} | DirectData`;
  const ogDesc = `${storeDesc} · ${bundleCount} bundles available on ${networks}`;
  const imageUrl = storefront.branding?.logoUrl || "/icons/store-icon.png";

  document.title = ogTitle;
  setOGMetaTag("og:title", ogTitle);
  setOGMetaTag("og:description", ogDesc);
  setOGMetaTag("og:image", imageUrl);
  setOGMetaTag("og:url", window.location.href);
  setOGMetaTag("og:type", "website");
  setOGMetaTag("twitter:card", "summary_large_image");
  setOGMetaTag("twitter:title", ogTitle);
  setOGMetaTag("twitter:description", ogDesc);
  setOGMetaTag("twitter:image", imageUrl);
}
