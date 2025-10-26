// src/routes/index.tsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { DashboardLayout } from "../layouts/dashboard-layout";
import { PageLoader } from "../components/page-loader";
import { ProtectedRoute } from "../components/protected-route";
import superadminRoutes from "./superadmin-routes";

// =============================================================================
// LAZY LOADED COMPONENTS - PUBLIC PAGES
// =============================================================================
const LandingPage = lazy(() =>
  import("../pages/landing-page").then((module) => ({
    default: module.LandingPage,
  }))
);

const LogoPage = lazy(() =>
  import("../components/common/BryteLinksLogoShowcase").then((module) => ({
    default: module.BryteLinksLogoShowcase,
  }))
);
const LoginPage = lazy(() =>
  import("../pages/login-page").then((module) => ({
    default: module.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import("../pages/register-page").then((module) => ({
    default: module.RegisterPage,
  }))
);
const RegisterSuccessPage = lazy(() =>
  import("../pages/register-success-page").then((module) => ({
    default: module.RegisterSuccessPage,
  }))
);
const ForgotPasswordPage = lazy(() =>
  import("../pages/forgot-password-page").then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import("../pages/reset-password-page").then((module) => ({
    default: module.ResetPasswordPage,
  }))
);
const VerifyAccountPage = lazy(() =>
  import("../pages/verify-account-page").then((module) => ({
    default: module.VerifyAccountPage,
  }))
);
const PublicStorefrontPage = lazy(() =>
  import("../pages/PublicStorefrontPage").then((module) => ({
    default: module.PublicStorefrontPage,
  }))
);
const NotFoundPage = lazy(() =>
  import("../pages/not-found-page").then((module) => ({
    default: module.NotFoundPage,
  }))
);
const ForbiddenPage = lazy(() =>
  import("../pages/forbidden-page").then((module) => ({
    default: module.ForbiddenPage,
  }))
);
const PrivacyPolicyPage = lazy(() =>
  import("../pages/privacy-policy-page").then((module) => ({
    default: module.PrivacyPolicyPage,
  }))
);
// =============================================================================
// LAZY LOADED COMPONENTS - DASHBOARD PAGES
// =============================================================================
const DashboardPage = lazy(() =>
  import("../pages/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  }))
);
const ProfilePage = lazy(() =>
  import("../pages/profile-page").then((module) => ({
    default: module.ProfilePage,
  }))
);

// =============================================================================
// LAZY LOADED COMPONENTS - AGENT SPECIFIC PAGES
// =============================================================================
const PackageManagementPage = lazy(() =>
  import("../pages/packages-page").then((module) => ({
    default: module.default,
  }))
);
const OrderManagementPage = lazy(() =>
  import("../pages/orders-page").then((module) => ({
    default: module.OrderManagementPage,
  }))
);
const StorefrontManagementPage = lazy(() =>
  import("../pages/store-page").then((module) => ({
    default: module.StorefrontManagementPage,
  }))
);
const AfaRegistrationPage = lazy(() =>
  import("../pages/afa-registration-page").then((module) => ({
    default: module.AfaRegistrationPage,
  }))
);
const WalletPage = lazy(() =>
  import("../pages/wallet-page").then((module) => ({
    default: module.WalletPage,
  }))
);

// =============================================================================
// LAZY LOADED COMPONENTS - PACKAGE SPECIFIC PAGES
// =============================================================================
const MtnPackagesPage = lazy(() =>
  import("../pages/mtn-packages-page").then((module) => ({
    default: module.MtnPackagesPage,
  }))
);
const TelecelPackagesPage = lazy(() =>
  import("../pages/telecel-packages-page").then((module) => ({
    default: module.TelecelPackagesPage,
  }))
);
const AtBigTimePackagesPage = lazy(() =>
  import("../pages/at-bigtime-packages").then((module) => ({
    default: module.AtBigTimePackagesPage,
  }))
);
const AtISharePremiumPackagesPage = lazy(() =>
  import("../pages/at-ishare-packages").then((module) => ({
    default: module.AtISharePremiumPackagesPage,
  }))
);

// =============================================================================
// ROUTE CONFIGURATIONS
// =============================================================================

// Public routes configuration
const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/landing",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: "/register/success",
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterSuccessPage />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },
  {
    path: "/reset-password/:token",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: "/verify-account",
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyAccountPage />
      </Suspense>
    ),
  },
  {
    path: "/store/:slug",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PublicStorefrontPage />
      </Suspense>
    ),
  },
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

  {
    path: "/404",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
];

// Agent routes configuration
const agentRoutes: RouteObject[] = [
  {
    path: "/agent",
    element: (
      <ProtectedRoute
        allowedUserTypes={["agent", "super_agent", "dealer", "super_dealer"]}
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
            path: "packages/mtn",
            element: (
              <Suspense fallback={<PageLoader />}>
                <MtnPackagesPage />
              </Suspense>
            ),
          },
          {
            path: "packages/telecel",
            element: (
              <Suspense fallback={<PageLoader />}>
                <TelecelPackagesPage />
              </Suspense>
            ),
          },
          {
            path: "packages/at-big-time",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AtBigTimePackagesPage />
              </Suspense>
            ),
          },
          {
            path: "packages/at-ishare-premium",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AtISharePremiumPackagesPage />
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
            path: "store",
            element: (
              <Suspense fallback={<PageLoader />}>
                <StorefrontManagementPage />
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
            path: "privacy-policy",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PrivacyPolicyPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
];

// Admin routes configuration
const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <ProtectedRoute allowedUserTypes={["super_admin"]} />,
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
  // Public routes
  ...publicRoutes,

  // Protected routes by user type
  ...agentRoutes,
  ...adminRoutes,

  // Super admin routes (separate layout)
  superadminRoutes,

  // Catch all route - redirect to 404
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];
