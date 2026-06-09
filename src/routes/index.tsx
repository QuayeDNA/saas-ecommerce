// src/routes/index.tsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { DashboardLayout } from "../layouts/dashboard-layout";
import { PageLoader } from "../components/page-loader";
import { ProtectedRoute } from "../components/protected-route";
import { StorefrontRouteGuard } from "../contexts/storefront-session-context";
import superadminRoutes from "./superadmin-routes";
import { BUSINESS_USER_TYPES } from "../utils/userTypeHelpers";

// =============================================================================
// LAZY LOADED COMPONENTS - PUBLIC PAGES
// =============================================================================
const LandingPage = lazy(() =>
  import("../pages/landing-page").then((module) => ({
    default: module.LandingPage,
  })),
);

const LogoPage = lazy(() =>
  import("../components/common/BryteLinksLogoShowcase").then((module) => ({
    default: module.BryteLinksLogoShowcase,
  })),
);
const LoginPage = lazy(() =>
  import("../pages/auth/login-page").then((module) => ({
    default: module.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("../pages/auth/register-page").then((module) => ({
    default: module.RegisterPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("../pages/auth/forgot-password-page").then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("../pages/auth/reset-password-page").then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const VerifyAccountPage = lazy(() =>
  import("../pages/auth/verify-account-page").then((module) => ({
    default: module.VerifyAccountPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("../pages/not-found-page").then((module) => ({
    default: module.NotFoundPage,
  })),
);
const ForbiddenPage = lazy(() =>
  import("../pages/forbidden-page").then((module) => ({
    default: module.ForbiddenPage,
  })),
);
const PrivacyPolicyPage = lazy(() =>
  import("../pages/privacy-policy-page").then((module) => ({
    default: module.PrivacyPolicyPage,
  })),
);
const PublicStorePage = lazy(() =>
  import("../pages/public/public-store").then((module) => ({
    default: module.PublicStorePage,
  })),
);
const StoreLandingPage = lazy(
  () => import("../pages/public/store-landing-page"),
);

// =============================================================================
// LAZY LOADED COMPONENTS - DASHBOARD PAGES
// =============================================================================
const DashboardPage = lazy(() =>
  import("../pages/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  })),
);
const ProfilePage = lazy(() =>
  import("../pages/profile-page").then((module) => ({
    default: module.ProfilePage,
  })),
);

// =============================================================================
// LAZY LOADED COMPONENTS - AGENT SPECIFIC PAGES
// =============================================================================
const PackageManagementPage = lazy(() =>
  import("../pages/packages-page").then((module) => ({
    default: module.default,
  })),
);
const OrderManagementPage = lazy(() => import("../pages/orders"));
const AfaRegistrationPage = lazy(() =>
  import("../pages/afa-registration-page").then((module) => ({
    default: module.AfaRegistrationPage,
  })),
);
const WalletPage = lazy(() =>
  import("../pages/wallet-page").then((module) => ({
    default: module.WalletPage,
  })),
);
const WalletTopupCallbackPage = lazy(() =>
  import("../pages/wallet-topup-callback").then((module) => ({
    default: module.WalletTopupCallbackPage,
  })),
);
const StorefrontCallbackPage = lazy(() =>
  import("../pages/storefront-callback").then((m) => ({
    default: m.StorefrontCallbackPage,
  })),
);
const StorefrontDashboardPage = lazy(() =>
  import("../pages/agent/storefront-dashboard").then((module) => ({
    default: module.StorefrontDashboardPage,
  })),
);
const ApiMarketplacePage = lazy(() =>
  import("../pages/agent/api-marketplace").then((module) => ({
    default: module.ApiMarketplacePage,
  })),
);

// =============================================================================
// LAZY LOADED COMPONENTS - COMMISSION & REFERRAL PAGES
// =============================================================================
const CommissionPage = lazy(() => import("../pages/agent/commissions"));

// =============================================================================
// LAZY LOADED COMPONENTS - PACKAGE SPECIFIC PAGES
// =============================================================================
const PackageDetailPage = lazy(() =>
  import("../pages/package-detail-page").then((module) => ({
    default: module.PackageDetailPage,
  })),
);

// =============================================================================
// ROUTE GUARD WRAPPER
// Renders children only if the visitor is NOT in a storefront session.
// Storefront visitors who manually type /login, /register, etc. are redirected
// back to their store. This is the security guard the client requested.
// =============================================================================

function SystemRouteElement({ element }: { element: React.ReactNode }) {
  return (
    <StorefrontRouteGuard allowedPrefixes={["/store", "/privacy-policy"]}>
      {element}
    </StorefrontRouteGuard>
  );
}

// =============================================================================
// PUBLIC ROUTES
// Routes under /store/* are NOT wrapped in SystemRouteElement — they are the
// storefront and must always be accessible.
// Everything else (/, /login, /register, /forgot-password …) IS wrapped so a
// storefront visitor can't sneak into the agent registration flow.
// =============================================================================

const publicRoutes: RouteObject[] = [
  // ── Root: redirect to login (wrapped — storefront visitors bounce back) ──
  {
    path: "/",
    element: (
      <SystemRouteElement
        element={
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        }
      />
    ),
  },

  // ── Wallet / storefront callbacks (not system-access-sensitive) ───────────
  {
    path: "/wallet/topup/callback",
    element: (
      <Suspense fallback={<PageLoader />}>
        <WalletTopupCallbackPage />
      </Suspense>
    ),
  },
  {
    path: "/storefront/:storefrontId/callback",
    element: (
      <Suspense fallback={<PageLoader />}>
        <StorefrontCallbackPage />
      </Suspense>
    ),
  },

  // ── Marketing landing page ────────────────────────────────────────────────
  {
    path: "/home",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },

  // ── Auth routes — ALL wrapped with SystemRouteElement ────────────────────
  {
    path: "/login",
    element: (
      <SystemRouteElement
        element={
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        }
      />
    ),
  },
  {
    path: "/register",
    element: (
      <SystemRouteElement
        element={
          <Suspense fallback={<PageLoader />}>
            <RegisterPage />
          </Suspense>
        }
      />
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <SystemRouteElement
        element={
          <Suspense fallback={<PageLoader />}>
            <ForgotPasswordPage />
          </Suspense>
        }
      />
    ),
  },
  {
    path: "/reset-password/:token",
    element: (
      <SystemRouteElement
        element={
          <Suspense fallback={<PageLoader />}>
            <ResetPasswordPage />
          </Suspense>
        }
      />
    ),
  },
  {
    path: "/verify-account",
    element: (
      <SystemRouteElement
        element={
          <Suspense fallback={<PageLoader />}>
            <VerifyAccountPage />
          </Suspense>
        }
      />
    ),
  },

  // ── Misc public pages ─────────────────────────────────────────────────────
  {
    path: "/forbidden",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForbiddenPage />
      </Suspense>
    ),
  },
  {
    path: "/privacy-policy",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivacyPolicyPage />
      </Suspense>
    ),
  },
  {
    path: "/logo",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LogoPage />
      </Suspense>
    ),
  },

  // ── STOREFRONT ROUTES — never wrapped in SystemRouteElement ───────────────
  // brytelinks.com/store           → discovery / landing page
  // brytelinks.com/store/:name     → individual agent store
  {
    path: "/store",
    element: (
      <Suspense fallback={<PageLoader />}>
        <StoreLandingPage />
      </Suspense>
    ),
  },
  {
    path: "/store/:businessName",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicStorePage />
      </Suspense>
    ),
  },

  // Dev-only convenience route
  ...(import.meta.env.DEV
    ? ([
        {
          path: "/dev/store-landing",
          element: (
            <Suspense fallback={<PageLoader />}>
              <StoreLandingPage />
            </Suspense>
          ),
        },
      ] as RouteObject[])
    : []),

  {
    path: "/404",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];

// =============================================================================
// AGENT ROUTES — also wrapped so storefront visitors can't reach them
// =============================================================================

const agentRoutes: RouteObject[] = [
  {
    path: "/agent",
    element: (
      <SystemRouteElement
        element={
          <ProtectedRoute
            allowedUserTypes={BUSINESS_USER_TYPES}
          />
        }
      />
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "packages",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PackageManagementPage />
              </Suspense>
            ),
          },
          {
            path: "packages/:packageId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PackageDetailPage />
              </Suspense>
            ),
          },
          {
            path: "orders",
            element: (
              <Suspense fallback={<PageLoader />}>
                <OrderManagementPage />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: "afa-registration",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AfaRegistrationPage />
              </Suspense>
            ),
          },
          {
            path: "wallet",
            element: (
              <Suspense fallback={<PageLoader />}>
                <WalletPage />
              </Suspense>
            ),
          },
          {
            path: "commissions",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CommissionPage />
              </Suspense>
            ),
          },
          {
            path: "storefront",
            element: (
              <Suspense fallback={<PageLoader />}>
                <StorefrontDashboardPage />
              </Suspense>
            ),
          },
          {
            path: "api-marketplace",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ApiMarketplacePage />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: "api-marketplace",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ApiMarketplacePage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];

// =============================================================================
// ADMIN ROUTES — also guarded
// =============================================================================

const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: (
      <SystemRouteElement
        element={<ProtectedRoute allowedUserTypes={["super_admin"]} />}
      />
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "packages",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PackageManagementPage />
              </Suspense>
            ),
          },
          {
            path: "profile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];

// =============================================================================
// MAIN ROUTES CONFIGURATION
// =============================================================================
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...agentRoutes,
  ...adminRoutes,
  superadminRoutes,
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];
