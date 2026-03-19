/**
 * StoreOnlyApp — rendered when VITE_STORE_ONLY=true (dedicated storefront domain).
 *
 * Routes:
 *   /                →  StoreLandingPage  (discovery / platform homepage)
 *   /:businessName   →  PublicStorePage   (individual agent store)
 *
 * The second Vercel project that points to the custom domain builds with
 * VITE_STORE_ONLY=true set in its environment variables.
 * Dedicated to DirectData brand — no code duplication needed.
 */

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./design-system/components/toast";
import { PageLoader } from "./components/page-loader";
import { SiteStatusProvider } from "./contexts/site-status-context";
import { AnnouncementProvider } from "./contexts/AnnouncementContext";
import { MaintenanceBanner } from "./components/maintenance-banner";

const StoreLandingPage = lazy(() => import("./pages/public/store-landing-page"));

const PublicStorePage = lazy(() =>
    import("./pages/public/public-store").then((m) => ({
        default: m.PublicStorePage,
    }))
);

export default function StoreOnlyApp() {
    return (
        <ThemeProvider initialTheme="default">
            <ToastProvider>
                <SiteStatusProvider>
                    <AnnouncementProvider isPublic={true}>
                        <MaintenanceBanner />
                        <Routes>
                            {/* Root: customdomain.com/ → landing + discovery page */}
                            <Route
                                path="/"
                                element={
                                    <Suspense fallback={<PageLoader />}>
                                        <StoreLandingPage />
                                    </Suspense>
                                }
                            />
                            {/* Store: customdomain.com/:businessName */}
                            <Route
                                path="/:businessName"
                                element={
                                    <Suspense fallback={<PageLoader />}>
                                        <PublicStorePage />
                                    </Suspense>
                                }
                            />
                            {/* Any unrecognised path falls back to the landing page */}
                            <Route
                                path="*"
                                element={
                                    <Suspense fallback={<PageLoader />}>
                                        <StoreLandingPage />
                                    </Suspense>
                                }
                            />
                        </Routes>
                    </AnnouncementProvider>
                </SiteStatusProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
