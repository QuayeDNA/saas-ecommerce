/**
 * Returns the public-facing URL for a storefront.
 *
 * When VITE_STORE_BASE_URL is set (i.e. a dedicated storefront domain has been
 * configured), links are built using that domain so customers always land on
 * the correct domain regardless of which app (main or store-only) generates
 * the link.
 *
 * Falls back to origin/store/:businessName on the current host so the main
 * app continues to work without any env var during development.
 */
export function getStoreUrl(businessName: string): string {
  const base = import.meta.env.VITE_STORE_BASE_URL?.replace(/\/$/, '')
    ?? `${window.location.origin}/store`;
  return `${base}/${businessName}`;
}
