// src/routes/index.tsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { DashboardLayout } from "../layouts/dashboard-layout";
import { PageLoader } from "../components/page-loader";
import { ProtectedRoute } from "../components/protected-route";
import { ButtonExamples } from '../components/examples/button-examples';
import { WalletPage } from "../pages/wallet-page";
import { AdminWalletPage } from "../pages/admin-wallet-page";

// Lazy load pages for better performance
const LandingPage = lazy(() =>
  import("../pages/landing-page").then((module) => ({
    default: module.LandingPage,
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
const DashboardPage = lazy(() =>
  import("../pages/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  }))
);
const HistoryPage = lazy(() =>
  import("../pages/history-page").then((module) => ({
    default: module.HistoryPage,
  }))
);
const ProfilePage = lazy(() =>
  import("../pages/profile-page").then((module) => ({
    default: module.ProfilePage,
  }))
);
const PackageManagementPage = lazy(() =>
  import("../pages/packages-page").then((module) => ({
    default: module.PackageManagementPage,
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
const PublicStorefrontPage = lazy(() =>
  import("../pages/PublicStorefrontPage").then((module) => ({
    default: module.PublicStorefrontPage,
  }))
);
const AfaRegistrationPage = lazy(() =>
  import("../pages/afa-registration-page").then((module) => ({
    default: module.AfaRegistrationPage,
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
const SupportPage = lazy(() =>
  import("../pages/support-page").then((module) => ({
    default: module.SupportPage,
  }))
);
const UserManagementPage = lazy(() =>
  import("../pages/user-management-page").then((module) => ({
    default: module.UserManagementPage,
  }))
);
const PackageList = lazy(() =>
  import("../components/products/PackageList").then((module) => ({
    default: module.PackageList,
  }))
);
// const ProviderList = lazy(() =>
//   import("../components/products/ProviderList").then((module) => ({
//     default: module.ProviderList,
//   }))
// );
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
// const GloPackagesPage = lazy(() =>
//   import("../pages/glo-packages-page").then((module) => ({
//     default: module.GloPackagesPage,
//   }))
// );

// Define routes
export const routes: RouteObject[] = [
  {
    path: "/",
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
  // Public Storefront Routes (No authentication required)
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
  // Protected Agent Routes
  {
    path: "/agent",
    element: <ProtectedRoute allowedUserTypes={["agent"]} />,
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
            )
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
            )
          },
          {
            path: "history",
            element: (
              <Suspense fallback={<PageLoader />}>
                <HistoryPage />
              </Suspense>
            ),
          },
          {
            path: "packages",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PackageList />
              </Suspense>
            )
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
            path: "support",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SupportPage />
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
          {
            path: "users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserManagementPage />
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
        ],
      },
    ],
  },
  {
    path: "/customer",
    element: <ProtectedRoute allowedUserTypes={["customer"]} />,
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
            path: "profile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            ),
          },
          {
            path: "history",
            element: (
              <Suspense fallback={<PageLoader />}>
                <HistoryPage />
              </Suspense>
            ),
          },
          {
            path: "support",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SupportPage />
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
  {
    path: "/button-examples",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ButtonExamples />
      </Suspense>
    ),
  },
  // Privacy Policy Page
  {
    path: "/privacy-policy",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivacyPolicyPage />
      </Suspense>
    ),
  },
  // Support Page
  {
    path: "/support",
    element: (
      <Suspense fallback={<PageLoader />}>
        <SupportPage />
      </Suspense>
    ),
  },
  // 404 Page
  {
    path: "/404",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
  // Protected Super Admin Routes
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
            path: "users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserManagementPage />
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
            path: "support",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SupportPage />
              </Suspense>
            ),
          },
          {
            path: "wallet",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminWalletPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  // Catch all route - redirect to 404
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];
