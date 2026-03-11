/**
 * StoreLandingPage — shown when a visitor lands on the storefront domain root
 * (e.g. https://www.directdata.shop/) without a specific /:businessName path.
 *
 * Single-screen, non-scrollable layout. One CTA button that navigates to a
 * random active store. OG meta tags are updated at runtime for this domain.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storefrontService } from '../../services/storefront.service';

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORM_NAME = import.meta.env.VITE_STORE_PLATFORM_NAME ?? 'DirectData';
const PLATFORM_TAGLINE = 'Instant data bundles from trusted agents — at your fingertips.';
const OG_DESCRIPTION = 'Get instant mobile data bundles from verified agents across Ghana. MTN, Vodafone, AirtelTigo and more. Fast, reliable, no hassle.';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setMetaTag(property: string, content: string) {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function Spinner() {
    return (
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StoreLandingPage() {
    const navigate = useNavigate();
    const [storeNames, setStoreNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);

    // Update OG meta tags for the store domain
    useEffect(() => {
        const title = `${PLATFORM_NAME} — Buy Data Bundles Instantly`;
        document.title = title;
        setMetaTag('og:title', title);
        setMetaTag('og:description', OG_DESCRIPTION);
        setMetaTag('og:image', '/android-chrome-512x512.png');
        setMetaTag('og:url', window.location.href);
        setMetaTag('og:type', 'website');
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', title);
        setMetaTag('twitter:description', OG_DESCRIPTION);
        setMetaTag('twitter:image', '/android-chrome-512x512.png');
    }, []);

    const loadStores = useCallback(async () => {
        try {
            const data = await storefrontService.getRandomStorefronts(6);
            setStoreNames(data.map((s: { businessName: string }) => s.businessName));
        } catch {
            // keep storeNames empty — button will be disabled
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStores();
    }, [loadStores]);

    const handleShopNow = () => {
        if (storeNames.length === 0) return;
        setRedirecting(true);
        const pick = storeNames[Math.floor(Math.random() * storeNames.length)];
        setTimeout(() => navigate(`/${pick}`), 300);
    };

    const noStores = !loading && storeNames.length === 0;

    return (
        <div className="h-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6">

            {/* Logo */}
            <img
                src="/logo-192.svg"
                alt={PLATFORM_NAME}
                className="w-20 h-20 mb-6 select-none"
                draggable={false}
            />

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight text-center">
                {PLATFORM_NAME}
            </h1>

            <p className="mt-3 text-base sm:text-lg text-gray-500 max-w-sm text-center leading-relaxed">
                {PLATFORM_TAGLINE}
            </p>

            <div className="mt-10">
                <button
                    onClick={handleShopNow}
                    disabled={redirecting || loading || noStores}
                    className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full bg-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-200/60 hover:bg-blue-700 active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {redirecting ? (
                        <><Spinner /> Finding a store…</>
                    ) : loading ? (
                        <><Spinner /> Loading…</>
                    ) : noStores ? (
                        'No stores available yet'
                    ) : (
                        'Shop Now'
                    )}
                </button>
            </div>

            {noStores && (
                <p className="mt-4 text-sm text-gray-400">Check back soon — stores are coming!</p>
            )}
        </div>
    );
}
