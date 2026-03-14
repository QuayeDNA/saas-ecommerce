/**
 * StoreLandingPage — DirectData public root experience.
 * Mobile-first ecommerce hero with strong branding and quick access to stores.
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ShieldCheck,
    Smartphone,
    Wifi,
    Zap,
    Store,
    Users,
    Clock3,
} from "lucide-react";
import { Badge, Button, Card, Container } from "../../design-system";
import { storefrontService } from "../../services/storefront.service";

const PLATFORM_NAME = "DirectData";
const PLATFORM_TAGLINE =
    "Instant data bundles from trusted agents across Ghana.";
const OG_DESCRIPTION =
    "Get instant mobile data bundles from verified agents across Ghana. MTN, Vodafone, AirtelTigo and more. Fast, reliable, no hassle.";

function setMetaTag(attribute: "name" | "property", key: string, content: string) {
    const selector = `meta[${attribute}="${key}"]`;
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attribute, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

const highlights = [
    { icon: Zap, label: "Instant Delivery" },
    { icon: ShieldCheck, label: "Trusted Agents" },
    { icon: Wifi, label: "All Networks" },
    { icon: Smartphone, label: "Mobile First" },
] as const;

const proofStats = [
    { icon: Users, value: "10K+", label: "Happy Customers" },
    { icon: Store, value: "500+", label: "Active Stores" },
    { icon: Clock3, value: "24/7", label: "Fast Service" },
] as const;

export default function StoreLandingPage() {
    const navigate = useNavigate();
    const [storeNames, setStoreNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        const title = `${PLATFORM_NAME} - Buy Data Bundles Instantly`;
        document.title = title;

        setMetaTag("property", "og:title", title);
        setMetaTag("property", "og:description", OG_DESCRIPTION);
        setMetaTag("property", "og:image", "/android-chrome-512x512.png");
        setMetaTag("property", "og:url", window.location.href);
        setMetaTag("property", "og:type", "website");

        setMetaTag("name", "twitter:card", "summary_large_image");
        setMetaTag("name", "twitter:title", title);
        setMetaTag("name", "twitter:description", OG_DESCRIPTION);
        setMetaTag("name", "twitter:image", "/android-chrome-512x512.png");
    }, []);

    const loadStores = useCallback(async () => {
        try {
            const data = await storefrontService.getRandomStorefronts(8);
            setStoreNames(data.map((item: { businessName: string }) => item.businessName));
        } catch {
            setStoreNames([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStores();
    }, [loadStores]);

    const handleShopNow = () => {
        if (!storeNames.length) return;
        setRedirecting(true);
        const random = storeNames[Math.floor(Math.random() * storeNames.length)];
        setTimeout(() => navigate(`/${random}`), 260);
    };

    const noStores = !loading && storeNames.length === 0;

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
            <style>{`
                @keyframes directdataGradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/25 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />

            <Container size="lg" padding="md" className="relative z-10 py-8 sm:py-12 lg:py-16">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center">
                        <Badge
                            variant="subtle"
                            colorScheme="info"
                            className="mb-4 border border-cyan-200/40 bg-cyan-300/20 text-cyan-100"
                        >
                            Public Storefront
                        </Badge>

                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur">
                            <span className="text-3xl font-black tracking-tight">DD</span>
                        </div>

                        <h1
                            className="mx-auto mb-3 max-w-3xl text-5xl font-black tracking-tight text-transparent sm:text-6xl lg:text-7xl [background-size:200%_200%] bg-gradient-to-r from-cyan-300 via-emerald-300 to-sky-300 bg-clip-text [animation:directdataGradientShift_6s_ease_infinite]"
                        >
                            DirectData
                        </h1>

                        <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
                            {PLATFORM_TAGLINE}
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {highlights.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Card
                                    key={item.label}
                                    variant="outlined"
                                    className="border-white/20 bg-white/10 p-3 text-center backdrop-blur-sm"
                                >
                                    <Icon className="mx-auto mb-2 h-5 w-5 text-cyan-200" aria-hidden="true" />
                                    <p className="text-xs font-medium text-slate-100 sm:text-sm">{item.label}</p>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mt-7 text-center">
                        <Button
                            onClick={handleShopNow}
                            disabled={redirecting || loading || noStores}
                            size="lg"
                            rounded
                            className="w-full max-w-xs border-0 bg-cyan-400 text-slate-900 shadow-xl shadow-cyan-500/30 hover:bg-cyan-300 sm:w-auto"
                            leftIcon={<Store className="h-4 w-4" />}
                            rightIcon={!loading && !redirecting ? <ArrowRight className="h-4 w-4" /> : undefined}
                        >
                            {redirecting
                                ? "Finding a Store..."
                                : loading
                                    ? "Loading Stores..."
                                    : noStores
                                        ? "No Stores Available"
                                        : "Shop Data Bundles"}
                        </Button>

                        <p className="mx-auto mt-3 max-w-sm text-sm text-slate-300">
                            Tap once and jump straight into a live agent store.
                        </p>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                        {proofStats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <Card
                                    key={stat.label}
                                    variant="outlined"
                                    className="border-white/20 bg-white/10 p-3 text-center backdrop-blur-sm sm:p-4"
                                >
                                    <Icon className="mx-auto mb-1.5 h-4 w-4 text-emerald-300 sm:h-5 sm:w-5" aria-hidden="true" />
                                    <p className="text-lg font-bold text-white sm:text-2xl">{stat.value}</p>
                                    <p className="text-[11px] text-slate-300 sm:text-xs">{stat.label}</p>
                                </Card>
                            );
                        })}
                    </div>

                    {noStores && (
                        <p className="mt-5 text-center text-sm text-amber-200">
                            Stores are being added now. Check back shortly.
                        </p>
                    )}
                </div>
            </Container>
        </div>
    );
}
