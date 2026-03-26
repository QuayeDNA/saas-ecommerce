/**
 * StorefrontSessionContext
 *
 * When a user lands on /store/:businessName we mark their browser session as
 * "storefront-only". Any attempt to navigate to a system route (/login,
 * /register, /agent/*, /admin/*, etc.) from within that session is intercepted
 * and redirected back to their storefront.
 *
 * This is purely client-side and is intentionally stored in sessionStorage
 * (cleared when the tab closes). It is NOT a security boundary for the backend
 * — it is a UX guard that prevents accidental / deliberate URL-bar exploits
 * from giving customers access to the agent registration flow.
 *
 * How it works:
 *   1. <StorefrontSessionProvider> wraps the whole app.
 *   2. StorefrontEntryMarker (rendered inside /store/:businessName routes) calls
 *      markStorefrontSession() on mount.
 *   3. StorefrontRouteGuard (rendered as a layout wrapper around all system
 *      routes) reads the session flag and redirects if set.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── Storage keys ─────────────────────────────────────────────────────────────

const SESSION_KEY = 'brytelinks_storefront_session';
const BUSINESS_KEY = 'brytelinks_storefront_business';

// ─── Context ──────────────────────────────────────────────────────────────────

interface StorefrontSessionContextValue {
  isStorefrontSession: boolean;
  storefrontBusiness: string | null;
  markStorefrontSession: (businessName: string) => void;
  clearStorefrontSession: () => void;
}

const StorefrontSessionContext = createContext<StorefrontSessionContextValue>({
  isStorefrontSession: false,
  storefrontBusiness: null,
  markStorefrontSession: () => {},
  clearStorefrontSession: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const StorefrontSessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isStorefrontSession, setIsStorefrontSession] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [storefrontBusiness, setStorefrontBusiness] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(BUSINESS_KEY);
    } catch {
      return null;
    }
  });

  const markStorefrontSession = useCallback((businessName: string) => {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
      sessionStorage.setItem(BUSINESS_KEY, businessName);
    } catch {
      // sessionStorage unavailable — degrade gracefully
    }
    setIsStorefrontSession(true);
    setStorefrontBusiness(businessName);
  }, []);

  const clearStorefrontSession = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(BUSINESS_KEY);
    } catch { /* */ }
    setIsStorefrontSession(false);
    setStorefrontBusiness(null);
  }, []);

  return (
    <StorefrontSessionContext.Provider
      value={{
        isStorefrontSession,
        storefrontBusiness,
        markStorefrontSession,
        clearStorefrontSession,
      }}
    >
      {children}
    </StorefrontSessionContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useStorefrontSession = () => useContext(StorefrontSessionContext);

// ─── StorefrontEntryMarker ────────────────────────────────────────────────────
// Drop this component anywhere inside the /store/:businessName page tree.
// It calls markStorefrontSession once on mount.

export const StorefrontEntryMarker: React.FC<{ businessName: string }> = ({
  businessName,
}) => {
  const { markStorefrontSession } = useStorefrontSession();

  useEffect(() => {
    if (businessName) {
      markStorefrontSession(businessName);
    }
  }, [businessName, markStorefrontSession]);

  return null;
};

// ─── StorefrontRouteGuard ─────────────────────────────────────────────────────
// Wrap this around any route subtree that should be inaccessible to storefront
// visitors. If a storefront session is detected, the user is silently bounced
// back to their store.

interface StorefrontRouteGuardProps {
  children: React.ReactNode;
  /** Routes that are safe even during a storefront session (e.g. /store/*) */
  allowedPrefixes?: string[];
}

export const StorefrontRouteGuard: React.FC<StorefrontRouteGuardProps> = ({
  children,
  allowedPrefixes = ['/store', '/privacy-policy'],
}) => {
  const { isStorefrontSession, storefrontBusiness } = useStorefrontSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isStorefrontSession) return;

    const isAllowed = allowedPrefixes.some((prefix) =>
      location.pathname.startsWith(prefix),
    );

    if (!isAllowed) {
      // Bounce back to their storefront — replace so Back button doesn't loop
      const dest = storefrontBusiness
        ? `/store/${storefrontBusiness}`
        : '/store';
      navigate(dest, { replace: true });
    }
  }, [isStorefrontSession, storefrontBusiness, location.pathname, navigate, allowedPrefixes]);

  // While in a storefront session and on a disallowed route, render nothing
  // (the useEffect above will redirect immediately, this avoids a flash)
  if (
    isStorefrontSession &&
    !allowedPrefixes.some((p) => location.pathname.startsWith(p))
  ) {
    return null;
  }

  return <>{children}</>;
};