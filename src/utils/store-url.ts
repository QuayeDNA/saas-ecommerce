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

  if (isStoreOnly) {
    // Standalone storefront domain: customdomain.com/:businessName
    return `${window.location.origin}/${businessName}`;
  }

  // Consolidated domain: brytelinks.com/store/:businessName
  return `${window.location.origin}/store/${businessName}`;
}