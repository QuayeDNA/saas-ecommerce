/**
 * StoreOnlyApp — rendered when VITE_STORE_ONLY=true (dedicated storefront domain).
 *
 * This strips out every admin/agent provider and exposes a single route:
 *   /:businessName  →  PublicStorePage
 *
 * The second Vercel project that points to the custom domain builds with
 * VITE_STORE_ONLY=true set in its environment variables. No code is duplicated.
 */

import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./design-system/components/toast";
import { PageLoader } from "./components/page-loader";

const PublicStorePage = lazy(() =>
    import("./pages/public/public-store").then((m) => ({
        default: m.PublicStorePage,
    }))
);

const NotFoundPage = lazy(() =>
    import("./pages/not-found-page").then((m) => ({ default: m.NotFoundPage }))
);

export default function StoreOnlyApp() {
    return (
        <ThemeProvider initialTheme="default">
            <ToastProvider>
                <Routes>
                    {/* Primary route: customdomain.com/:businessName */}
                    <Route
                        path="/:businessName"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <PublicStorePage />
                            </Suspense>
                        }
                    />
                    {/* Fallback for root and unrecognised paths */}
                    <Route
                        path="*"
                        element={
                            <Suspense fallback={<PageLoader />}>
                                <NotFoundPage />
                            </Suspense>
                        }
                    />
                </Routes>
            </ToastProvider>
        </ThemeProvider>
    );
}
