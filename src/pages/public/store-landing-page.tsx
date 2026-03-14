/**
 * StoreLandingPage — Modern ecommerce landing page for DirectData
 * Mobile-first, responsive design with engaging visuals and clear CTAs
 * Showcases the DirectData platform for instant data bundle purchases
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

// ─── Components ──────────────────────────────────────────────────────────────

function LoadingSpinner() {
    return (
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

function FeatureBadge({ icon, text }: { icon: string; text: string }) {
    return (
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-medium text-white">{text}</span>
        </div>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-300 rounded-full blur-3xl"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-16 left-8 animate-bounce" style={{ animationDelay: '0s' }}>
                📱
            </div>
            <div className="absolute top-32 right-12 animate-bounce" style={{ animationDelay: '1s' }}>
                📶
            </div>
            <div className="absolute bottom-24 left-16 animate-bounce" style={{ animationDelay: '2s' }}>
                ⚡
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
                        <span className="text-4xl font-black text-blue-600">DD</span>
                    </div>

                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-4 tracking-tight">
                        {PLATFORM_NAME}
                    </h1>

                    <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
                        {PLATFORM_TAGLINE}
                    </p>
                </div>

                {/* Feature Badges */}
                <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-md sm:max-w-lg">
                    <FeatureBadge icon="🚀" text="Instant Delivery" />
                    <FeatureBadge icon="🛡️" text="Trusted Agents" />
                    <FeatureBadge icon="💰" text="Best Prices" />
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <button
                        onClick={handleShopNow}
                        disabled={redirecting || loading || noStores}
                        className="group relative inline-flex items-center gap-3 px-8 py-5 bg-white text-blue-600 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6"
                    >
                        <span className="relative z-10">
                            {redirecting ? (
                                <>Finding your store...</>
                            ) : loading ? (
                                <>Loading stores...</>
                            ) : noStores ? (
                                'No stores available yet'
                            ) : (
                                'Shop Data Bundles Now'
                            )}
                        </span>

                        {redirecting || loading ? (
                            <LoadingSpinner />
                        ) : (
                            <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        )}
                    </button>

                    <p className="text-blue-200 text-sm max-w-sm mx-auto">
                        Join thousands of customers getting instant data bundles from verified Ghanaian agents
                    </p>
                </div>

                {/* Stats Section */}
                <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="text-2xl font-bold text-white">10K+</div>
                        <div className="text-blue-200 text-sm">Happy Customers</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="text-2xl font-bold text-white">500+</div>
                        <div className="text-blue-200 text-sm">Active Agents</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="text-2xl font-bold text-white">24/7</div>
                        <div className="text-blue-200 text-sm">Support</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="text-2xl font-bold text-white">MTN</div>
                        <div className="text-blue-200 text-sm">Vodafone & More</div>
                    </div>
                </div>

                {noStores && (
                    <div className="mt-8 text-center">
                        <p className="text-blue-200 text-sm bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-block border border-white/20">
                            Check back soon — amazing stores are coming!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
