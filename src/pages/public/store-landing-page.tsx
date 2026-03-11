/**
 * StoreLandingPage — shown when a visitor lands on the storefront domain root
 * (e.g. https://store.yourplatform.com/) without a specific /:businessName path.
 *
 * Features:
 *  - Hero with platform branding & CTA
 *  - "Shop Now" → picks a random active store and navigates to it
 *  - Featured stores grid for discovery
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storefrontService } from '../../services/storefront.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoreCard {
    businessName: string;
    displayName: string;
    description?: string;
    branding?: { logoUrl?: string; tagline?: string };
    settings?: { theme?: string };
}

// ─── Theme colour map (mirrors public-store.tsx) ──────────────────────────────

const THEME_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
    blue: { bg: '#EFF6FF', text: '#1E3A5F', accent: '#2563EB' },
    green: { bg: '#F0FDF4', text: '#14532D', accent: '#16A34A' },
    purple: { bg: '#FAF5FF', text: '#3B0764', accent: '#7C3AED' },
    orange: { bg: '#FFF7ED', text: '#7C2D12', accent: '#EA580C' },
    red: { bg: '#FEF2F2', text: '#7F1D1D', accent: '#DC2626' },
    teal: { bg: '#F0FDFA', text: '#134E4A', accent: '#0D9488' },
    indigo: { bg: '#EEF2FF', text: '#312E81', accent: '#4F46E5' },
    pink: { bg: '#FFF1F2', text: '#881337', accent: '#E11D48' },
};

const defaultTheme = THEME_COLORS.blue;

const getTheme = (t?: string) => THEME_COLORS[t ?? ''] ?? defaultTheme;

// ─── Platform config (overridable via env) ────────────────────────────────────

const PLATFORM_NAME = import.meta.env.VITE_STORE_PLATFORM_NAME ?? 'BryteLink';
const PLATFORM_TAGLINE = 'Instant data bundles from trusted agents — at your fingertips.';

// ─── Store card ───────────────────────────────────────────────────────────────

function FeaturedStoreCard({ store, onClick }: { store: StoreCard; onClick: () => void }) {
    const tc = getTheme(store.settings?.theme);
    return (
        <button
            onClick={onClick}
            className="group w-full text-left rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: tc.bg, borderColor: tc.accent + '40', border: '1px solid' }}
        >
            {/* Colour bar */}
            <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${tc.accent}, ${tc.accent}99)` }} />

            <div className="p-4 sm:p-5 flex items-start gap-3">
                {/* Logo or initial */}
                <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: tc.accent }}
                >
                    {store.branding?.logoUrl ? (
                        <img
                            src={store.branding.logoUrl}
                            alt={store.displayName}
                            className="w-11 h-11 rounded-xl object-cover"
                        />
                    ) : (
                        store.displayName.charAt(0).toUpperCase()
                    )}
                </div>

                <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: tc.text }}>
                        {store.displayName}
                    </p>
                    {(store.branding?.tagline || store.description) && (
                        <p className="text-xs mt-0.5 line-clamp-2 opacity-70" style={{ color: tc.text }}>
                            {store.branding?.tagline || store.description}
                        </p>
                    )}
                    <p
                        className="text-xs mt-2 font-medium group-hover:underline"
                        style={{ color: tc.accent }}
                    >
                        Shop now →
                    </p>
                </div>
            </div>
        </button>
    );
}

// ─── Hero spinner ─────────────────────────────────────────────────────────────

function Spinner({ color = '#2563EB' }: { color?: string }) {
    return (
        <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
        >
            <circle cx="12" cy="12" r="10" stroke={color + '33'} strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StoreLandingPage() {
    const navigate = useNavigate();
    const [stores, setStores] = useState<StoreCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const [noStores, setNoStores] = useState(false);

    const loadStores = useCallback(async () => {
        try {
            const data = await storefrontService.getRandomStorefronts(6);
            setStores(data);
            setNoStores(data.length === 0);
        } catch {
            setNoStores(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStores();
    }, [loadStores]);

    const handleShopNow = () => {
        if (stores.length === 0) return;
        setRedirecting(true);
        const pick = stores[Math.floor(Math.random() * stores.length)];
        // Small delay so the button spinner is visible
        setTimeout(() => navigate(`/${pick.businessName}`), 300);
    };

    const goTo = (businessName: string) => navigate(`/${businessName}`);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 sm:py-28">
                {/* Logo mark */}
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                    {PLATFORM_NAME}
                </h1>

                <p className="mt-4 text-lg text-gray-500 max-w-md">
                    {PLATFORM_TAGLINE}
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center">
                    <button
                        onClick={handleShopNow}
                        disabled={redirecting || loading || noStores}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {redirecting ? (
                            <>
                                <Spinner color="#fff" />
                                Finding a store…
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                                Shop Now
                            </>
                        )}
                    </button>

                    {noStores && (
                        <p className="text-sm text-gray-400">No stores available yet — check back soon.</p>
                    )}
                </div>

                {/* If agent has a link they want to share but typed the root by mistake */}
                <p className="mt-6 text-xs text-gray-400">
                    Already have a store link? Add the store name to the URL:&nbsp;
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        {window.location.host}/<em>storename</em>
                    </span>
                </p>
            </main>

            {/* ── Featured stores ───────────────────────────────────────────────── */}
            {!loading && stores.length > 0 && (
                <section className="w-full bg-white/70 backdrop-blur border-t border-gray-100 px-6 py-10">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-5 text-center">
                            Browse stores
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {stores.map((store) => (
                                <FeaturedStoreCard
                                    key={store.businessName}
                                    store={store}
                                    onClick={() => goTo(store.businessName)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Loading shimmer for featured section */}
            {loading && (
                <section className="w-full bg-white/70 border-t border-gray-100 px-6 py-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="h-4 w-28 bg-gray-100 rounded mx-auto mb-5 animate-pulse" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Footer ────────────────────────────────────────────────────────── */}
            <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 bg-white/60">
                © {new Date().getFullYear()} {PLATFORM_NAME}. Powered by trusted agents across Ghana.
            </footer>
        </div>
    );
}
