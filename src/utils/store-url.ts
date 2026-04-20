/**
 * getStoreUrl — returns the public-facing URL for a storefront.
 *
 * On the consolidated domain (brytelinks.com) stores live at:
 *   brytelinks.com/store/:businessName
 *
 * VITE_STORE_ONLY is kept for any legacy standalone deployments but
 * is no longer used in the main production build.
 */
export function getStoreUrl(businessName: string): string {
  const isStoreOnly = import.meta.env.VITE_STORE_ONLY === 'true';
  const storeBaseUrl = import.meta.env.VITE_STORE_BASE_URL?.replace(/\/$/, "");

  if (isStoreOnly) {
    // Dedicated storefront domain: customdomain.com/:businessName
    const baseUrl = storeBaseUrl || window.location.origin;
    return `${baseUrl}/${businessName}`;
  }

  // Consolidated domain: brytelinks.com/store/:businessName
  return `${window.location.origin}/store/${businessName}`;
}