const BRYTELINKS_META = {
  title: "BryteLinks - Telecom Solutions Platform",
  description:
    "BryteLinks provides modern telecom solutions for agents and dealers in Ghana. Manage your telecom business with our comprehensive platform.",
  image: "/logo-192.svg",
  siteName: "BryteLinks",
  type: "website",
};

const DIRECTDATA_DEFAULT_META = {
  title: "DirectData - Instant Data Bundles",
  description:
    "Get instant mobile data bundles from verified agents across Ghana. MTN, Vodafone, AirtelTigo and more. Fast, reliable, no hassle.",
  image: "/android-chrome-512x512.png",
  siteName: "DirectData",
  type: "website",
};

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toAbsoluteUrl(value, origin) {
  if (!value) return `${origin}/android-chrome-512x512.png`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`;
}

function upsertMetaTag(html, attr, key, content) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\s+[^>]*${attr}=["']${escapedKey}["'][^>]*>`,
    "i"
  );
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `  ${tag}\n</head>`);
}

function upsertTitle(html, title) {
  const safeTitle = escapeHtml(title);
  if (/<title>.*<\/title>/i.test(html)) {
    return html.replace(/<title>.*<\/title>/i, `<title>${safeTitle}</title>`);
  }
  return html.replace("</head>", `  <title>${safeTitle}</title>\n</head>`);
}

function upsertCanonical(html, canonicalUrl) {
  const tag = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, tag);
  }
  return html.replace("</head>", `  ${tag}\n</head>`);
}

async function resolveStoreMeta(apiBase, businessName, origin, fullUrl) {
  const fallbackTitle = `${businessName} | DirectData`;
  const fallback = {
    ...DIRECTDATA_DEFAULT_META,
    title: fallbackTitle,
    url: fullUrl,
  };

  if (!apiBase) return fallback;

  try {
    const endpoint = `${apiBase.replace(/\/$/, "")}/api/storefront/${encodeURIComponent(
      businessName
    )}`;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return fallback;

    const payload = await response.json();
    const store = payload?.data?.storefront ?? payload?.data ?? null;
    const bundles = payload?.data?.bundles ?? [];
    if (!store) return fallback;

    const storeTitle = store.displayName || store.businessName || fallbackTitle;
    const storeDesc =
      store.description ||
      "Instant data bundles from trusted agents across Ghana.";
    const networks = [
      ...new Set(
        bundles
          .map((bundle) => bundle?.provider)
          .filter((provider) => typeof provider === "string" && provider.trim())
      ),
    ];
    const summarySuffix = networks.length
      ? ` Available on ${networks.slice(0, 3).join(", ")}${networks.length > 3 ? " and more" : ""}.`
      : "";

    return {
      title: `${storeTitle} | DirectData`,
      description: `${storeDesc}${summarySuffix}`.trim(),
      image: toAbsoluteUrl(
        store?.branding?.logoUrl || DIRECTDATA_DEFAULT_META.image,
        origin
      ),
      siteName: "DirectData",
      type: "website",
      url: fullUrl,
    };
  } catch {
    return fallback;
  }
}

function getRequestContext(req) {
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  const protocol = String(req.headers["x-forwarded-proto"] || "https");
  const origin = `${protocol}://${host}`;
  const rawPath = String(req.query.path || "").replace(/^\/+/, "");
  const pathname = rawPath ? `/${rawPath}` : "/";
  const isStorefrontHost = /(^|\.)directdata\.shop$/i.test(host);
  const businessName = isStorefrontHost && rawPath && !rawPath.includes("/") ? rawPath : null;

  return {
    host,
    origin,
    pathname,
    fullUrl: `${origin}${pathname}`,
    isStorefrontHost,
    businessName,
  };
}

export default async function handler(req, res) {
  try {
    const context = getRequestContext(req);
    const apiBase =
      process.env.VITE_API_URL ||
      process.env.API_URL ||
      process.env.BACKEND_URL ||
      "";

    let meta;
    let ogContext = "platform";
    if (!context.isStorefrontHost) {
      meta = {
        ...BRYTELINKS_META,
        image: toAbsoluteUrl(BRYTELINKS_META.image, context.origin),
        url: context.fullUrl,
      };
    } else if (!context.businessName) {
      ogContext = "storefront-root";
      meta = {
        ...DIRECTDATA_DEFAULT_META,
        image: toAbsoluteUrl(DIRECTDATA_DEFAULT_META.image, context.origin),
        url: context.fullUrl,
      };
    } else {
      ogContext = "storefront-agent";
      meta = await resolveStoreMeta(
        apiBase,
        context.businessName,
        context.origin,
        context.fullUrl
      );
    }

    const indexUrl = `${context.origin}/index.html`;
    const indexResponse = await fetch(indexUrl, {
      headers: { "x-og-render": "1" },
    });
    if (!indexResponse.ok) {
      res.status(500).send("Unable to load app shell");
      return;
    }

    let html = await indexResponse.text();

    html = upsertTitle(html, meta.title);
    html = upsertCanonical(html, meta.url);
    html = upsertMetaTag(html, "name", "title", meta.title);
    html = upsertMetaTag(html, "name", "description", meta.description);

    html = upsertMetaTag(html, "property", "og:type", meta.type);
    html = upsertMetaTag(html, "property", "og:url", meta.url);
    html = upsertMetaTag(html, "property", "og:title", meta.title);
    html = upsertMetaTag(html, "property", "og:description", meta.description);
    html = upsertMetaTag(html, "property", "og:image", meta.image);
    html = upsertMetaTag(html, "property", "og:site_name", meta.siteName);

    html = upsertMetaTag(html, "name", "twitter:card", "summary_large_image");
    html = upsertMetaTag(html, "property", "twitter:card", "summary_large_image");
    html = upsertMetaTag(html, "name", "twitter:url", meta.url);
    html = upsertMetaTag(html, "property", "twitter:url", meta.url);
    html = upsertMetaTag(html, "name", "twitter:title", meta.title);
    html = upsertMetaTag(html, "property", "twitter:title", meta.title);
    html = upsertMetaTag(html, "name", "twitter:description", meta.description);
    html = upsertMetaTag(html, "property", "twitter:description", meta.description);
    html = upsertMetaTag(html, "name", "twitter:image", meta.image);
    html = upsertMetaTag(html, "property", "twitter:image", meta.image);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    res.setHeader("x-og-context", ogContext);
    res.status(200).send(html);
  } catch {
    res.status(500).send("Meta rendering failed");
  }
}