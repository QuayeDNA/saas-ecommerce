/**
 * StoreLandingPage — shown when a visitor lands on the storefront domain root
 * (e.g. https://www.directdata.shop/) without a specific /:businessName path.
 *
 * Modern ecommerce landing page with store discovery.
 * Users can browse featured stores, explore all stores, or search for a specific agent.
 * OG meta tags are updated for platform branding.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { storefrontService } from '../../services/storefront.service';
import { FaMagnifyingGlass, FaFire, FaArrowRight, FaStore } from 'react-icons/fa6';

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORM_NAME = 'DirectData';
const PLATFORM_TAGLINE = 'Instant data bundles from trusted agents — fast, reliable, no hassle.';
const OG_DESCRIPTION = 'Get instant mobile data bundles from verified agents across Ghana. MTN, Vodafone, AirtelTigo and more.';
const PLATFORM_BENEFITS = [
    { icon: '⚡', title: 'Instant Delivery', desc: 'Get bundles in seconds' },
    { icon: '🔒', title: 'Trusted Agents', desc: 'Verified & reliable sellers' },
    { icon: '💰', title: 'Best Prices', desc: 'Competitive rates guaranteed' },
    { icon: '📱', title: 'All Networks', desc: 'MTN, Vodafone, AirtelTigo & more' },
];

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
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

interface StorefrontPreview {
    businessName: string;
    displayName?: string;
    description?: string;
    agentName?: string;
}

// ─── Store Card ────────────────────────────────────────────────────────────────

function StoreCard({ store, onSelect }: { store: StorefrontPreview; onSelect: () => void }) {
    return (
        <button
            onClick={onSelect}
            className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 text-left p-5 hover:-translate-y-1"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 group-hover:from-blue-50 group-hover:to-blue-100/50 transition-colors duration-300" />
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                    <FaStore className="w-5 h-5 text-blue-600" />
                    <FaArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors duration-300 translate-x-2 group-hover:translate-x-0" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">
                    {store.displayName || store.businessName}
                </h3>
                {store.agentName && (
                    <p className="text-xs text-gray-500 mb-2">By {store.agentName}</p>
                )}
                <p className="text-xs text-gray-600 line-clamp-2">
                    {store.description || 'Premium data bundles at competitive prices'}
                </p>
            </div>
        </button>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StoreLandingPage() {
    const navigate = useNavigate();
    const [allStores, setAllStores] = useState<StorefrontPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Update OG meta tags for the platform
    useEffect(() => {
        const title = `${PLATFORM_NAME} — Buy Data Bundles Instantly`;
        document.title = title;
        setMetaTag('og:title', title);
        setMetaTag('og:description', OG_DESCRIPTION);
        setMetaTag('og:image', '/logo-192.svg');
        setMetaTag('og:url', window.location.href);
        setMetaTag('og:type', 'website');
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', title);
        setMetaTag('twitter:description', OG_DESCRIPTION);
        setMetaTag('twitter:image', '/logo-192.svg');
    }, []);

    // Load stores on mount
    const loadStores = useCallback(async () => {
        try {
            setLoading(true);
            const data = await storefrontService.getRandomStorefronts(50);
            setAllStores(data.map((s: any) => ({
                businessName: s.businessName,
                displayName: s.displayName || s.businessName,
                description: s.description,
                agentName: s.agentName,
            })));
        } catch (error) {
            console.error('Failed to load stores:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStores();
    }, [loadStores]);

    // Filter stores based on search term
    const filteredStores = useMemo(() => {
        if (!searchTerm.trim()) {
            return allStores.slice(0, 12); // Show first 12 if no search
        }
        const term = searchTerm.toLowerCase();
        return allStores.filter(s =>
            s.displayName?.toLowerCase().includes(term) ||
            s.businessName.toLowerCase().includes(term) ||
            s.agentName?.toLowerCase().includes(term)
        ).slice(0, 20);
    }, [searchTerm, allStores]);

    // Featured stores (first 6)

    const handleSelectStore = (businessName: string) => {
        setTimeout(() => navigate(`/${businessName}`), 150);
    };

    const handleRandomStore = () => {
        if (allStores.length === 0) return;
        const randomStore = allStores[Math.floor(Math.random() * allStores.length)];
        handleSelectStore(randomStore.businessName);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white overflow-x-hidden">

            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-gray-200/50 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 py-16 sm:py-24">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    {/* Logo / Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
                            <span className="text-2xl font-black bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">DD</span>
                        </div>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
                        {PLATFORM_NAME}
                    </h1>

                    <p className="text-lg sm:text-xl text-blue-50 max-w-2xl mx-auto mb-8 leading-relaxed">
                        {PLATFORM_TAGLINE}
                    </p>

                    {/* Search Bar */}
                    <div className="flex gap-2 max-w-xl mx-auto mb-8">
                        <div className="flex-1 relative">
                            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search stores or agents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-gray-900 placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={handleRandomStore}
                            disabled={loading || allStores.length === 0}
                            className="px-6 py-3 rounded-full bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Surprise Me
                        </button>
                    </div>

                    {/* Status message */}
                    {loading && (
                        <p className="text-sm text-blue-100 flex items-center justify-center gap-2">
                            <Spinner /> Loading stores...
                        </p>
                    )}
                </div>
            </div>

            {/* Benefits Grid */}
            <div className="px-6 py-16 sm:py-20 max-w-5xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    {PLATFORM_BENEFITS.map((benefit, idx) => (
                        <div key={idx} className="text-center">
                            <div className="text-3xl mb-2">{benefit.icon}</div>
                            <h3 className="font-bold text-gray-900 text-sm mb-1">{benefit.title}</h3>
                            <p className="text-xs text-gray-600 leading-tight">{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stores Section */}
            <div className="px-6 py-12 sm:py-16 max-w-5xl mx-auto">
                {/* Section header */}
                <div className="flex items-center gap-2 mb-8">
                    {searchTerm ? (
                        <>
                            <FaMagnifyingGlass className="w-5 h-5 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">
                                Search Results
                            </h2>
                            {filteredStores.length > 0 && (
                                <span className="ml-auto text-sm text-gray-500">
                                    {filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''} found
                                </span>
                            )}
                        </>
                    ) : (
                        <>
                            <FaFire className="w-5 h-5 text-orange-500" />
                            <h2 className="text-2xl font-bold text-gray-900">Featured Stores</h2>
                        </>
                    )}
                </div>

                {/* No results / No stores */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredStores.length === 0 ? (
                    <div className="text-center py-12">
                        {searchTerm ? (
                            <>
                                <FaMagnifyingGlass className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">No stores match "{searchTerm}"</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    View all stores
                                </button>
                            </>
                        ) : (
                            <>
                                <FaStore className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No stores available yet. Check back soon!</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Store grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {filteredStores.map((store) => (
                                <div key={store.businessName} className="cursor-pointer">
                                    <StoreCard
                                        store={store}
                                        onSelect={() => handleSelectStore(store.businessName)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* View more hint */}
                        {!searchTerm && allStores.length > 12 && (
                            <div className="text-center pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-4">
                                    {allStores.length} active stores available
                                </p>
                                <div className="flex items-center justify-center gap-1 text-blue-600 text-sm font-semibold">
                                    <FaMagnifyingGlass className="w-4 h-4" />
                                    Use search to discover more
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer CTA */}
            {!loading && allStores.length > 0 && (
                <div className="px-6 py-12 bg-gradient-to-t from-blue-50 to-transparent border-t border-gray-200/50">
                    <div className="max-w-2xl mx-auto text-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Ready to shop?</h3>
                        <p className="text-gray-600 mb-6">
                            Browse stores above or let us surprise you with a random selection
                        </p>
                        <button
                            onClick={handleRandomStore}
                            disabled={loading || allStores.length === 0}
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200/50"
                        >
                            <FaFire className="w-4 h-4" />
                            Explore Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
