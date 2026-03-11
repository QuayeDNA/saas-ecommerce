/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_VERSION?: string;
  /** When "true", this build serves only the public storefront (no admin UI) */
  readonly VITE_STORE_ONLY?: string;
  /** Optional: base URL of the dedicated storefront domain, used to build share links */
  readonly VITE_STORE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
