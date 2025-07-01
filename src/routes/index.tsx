// src/routes/index.tsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { DashboardLayout } from "../layouts/dashboard-layout";
import { PageLoader } from "../components/page-loader";
import { ProtectedRoute } from "../components/protected-route";

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
const ProductManagementPage = lazy(() =>
  import("../pages/products-page").then((module) => ({
    default: module.ProductManagementPage,
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
            path: "products",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProductManagementPage />
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
        ],
      },
    ],
  },
  // Protected Customer Routes
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
          // Add customer-specific routes here
        ],
      },
    ],
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
  // Catch all route - redirect to 404
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];
