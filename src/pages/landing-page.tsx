// src/pages/landing-page.tsx
// Creative brief: Technical editorial telecom platform — architectural typography,
// precise grids, brand-first presence. Trust and scale communicated through
// restraint and confident composition.

import { useState, useEffect, useRef, useCallback, type FC } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Container,
  Card,
  CardBody,
  Section,
  SectionHeader,
  Feature,
  FeatureGrid,
  Testimonial,
  Avatar,
  StatsGrid,
} from "../design-system";
import {
  BryteLinksSvgLogoCompact,
  BryteLinksSvgIcon,
} from "../components/common/BryteLinksSvgLogo";
import {
  ArrowRight,
  Check,
  Menu,
  X,
  Smartphone,
  Shield,
  Zap,
  Users,
  TrendingUp,
  BarChart3,
  Wallet,
  ShoppingCart,
  Globe,
  Star,
  Clock,
  Layers,
  RefreshCw,
  Bell,
  CreditCard,
  UserCheck,
  Building2,
  Wifi,
  ChevronDown,
  Activity,
  DollarSign,
  Target,
  MousePointerClick,
  Gauge,
} from "lucide-react";
import type { StatCardProps } from "../design-system/components/stats-card";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { id: "services", label: "Services" },
  { id: "features", label: "Features" },
  { id: "networks", label: "Networks" },
  { id: "testimonials", label: "Testimonials" },
] as const;

const HERO_STATS = [
  { value: "4+", label: "Networks", icon: Globe },
  { value: "50K+", label: "Transactions/mo", icon: TrendingUp },
  { value: "99.9%", label: "Uptime", icon: Shield },
  { value: "<2s", label: "API Response", icon: Gauge },
] as const;

const SERVICES = [
  {
    icon: Smartphone,
    title: "Airtime Top-Up",
    description:
      "Instantly recharge any Ghanaian mobile number across all major networks with competitive rates and real-time confirmation.",
  },
  {
    icon: Wifi,
    title: "Data Bundles",
    description:
      "Browse and sell a wide catalogue of data bundles — daily, weekly, monthly — with automatic fulfilment and tracking.",
  },
  {
    icon: Wallet,
    title: "Wallet System",
    description:
      "Manage funds with a secure digital wallet. Top up, transfer, and track every transaction in real time.",
  },
  {
    icon: ShoppingCart,
    title: "Agent Storefronts",
    description:
      "Launch your own branded online store, set custom prices, and let customers purchase directly from you.",
  },
  {
    icon: Bell,
    title: "Real-Time Notifications",
    description:
      "Stay informed with push notifications, WebSocket updates, and comprehensive in-app alerts for every transaction.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Revenue trends, order breakdowns, and performance charts help you make data-driven decisions.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Your Account",
    description:
      "Sign up in under a minute. Choose your role — agent, super-agent, or dealer — and get verified instantly.",
    icon: UserCheck,
  },
  {
    step: "02",
    title: "Fund Your Wallet",
    description:
      "Add funds through mobile money or bank transfer. Your balance is available immediately for transactions.",
    icon: Wallet,
  },
  {
    step: "03",
    title: "Start Selling",
    description:
      "Process airtime and data orders through the dashboard or share your storefront link with customers.",
    icon: MousePointerClick,
  },
  {
    step: "04",
    title: "Scale & Grow",
    description:
      "Track performance, recruit sub-agents, and unlock better margins as your transaction volume grows.",
    icon: TrendingUp,
  },
] as const;

const FEATURES = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description:
      "JWT authentication, encrypted wallets, and role-based access control protect every transaction.",
  },
  {
    icon: RefreshCw,
    title: "Live Sync",
    description:
      "WebSocket-powered updates ensure your dashboard, orders, and wallet balance are always current.",
  },
  {
    icon: Layers,
    title: "Multi-Tier Hierarchy",
    description:
      "Agents, super-agents, dealers, super-dealers — each tier with tailored dashboards and permissions.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description:
      "Mobile money integration, bank transfers, and in-platform wallet-to-wallet transfers.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First PWA",
    description:
      "Install on any device. Works offline, loads instantly, and delivers a native-app experience.",
  },
  {
    icon: Target,
    title: "Bulk Operations",
    description:
      "Process thousands of transactions simultaneously with our intelligent bulk operation engine.",
  },
] as const;

const NETWORKS = [
  {
    name: "MTN Ghana",
    brandColor: "var(--warning)",
    services: ["Airtime", "Data Bundles", "Flexi Bundles"],
  },
  {
    name: "Telecel Ghana",
    brandColor: "var(--error)",
    services: ["Airtime", "Data Bundles", "Unlimited Plans"],
  },
  {
    name: "AirtelTigo",
    brandColor: "var(--color-secondary)",
    services: ["Airtime", "iShare Bundles", "BigTime Bundles"],
  },
] as const;

const TIERS = [
  {
    icon: UserCheck,
    title: "Agents",
    description:
      "Sell airtime & data, manage your own storefront, and grow your business.",
  },
  {
    icon: Users,
    title: "Super Agents & Dealers",
    description:
      "Recruit and manage agents, track network performance, and access advanced reporting.",
  },
  {
    icon: Building2,
    title: "Enterprises",
    description:
      "Full platform control with user management, role configuration, and organisation-wide analytics.",
  },
] as const;

const TESTIMONIALS = [
  {
    name: "Kwame Asante",
    role: "Agent",
    company: "Kumasi",
    content:
      "BryteLinks changed the way I run my business. The wallet system is seamless and I can track every cedi.",
    rating: 5,
  },
  {
    name: "Abena Mensah",
    role: "Super Agent",
    company: "Accra",
    content:
      "Managing 30+ agents used to be chaos. Now I see real-time performance from one dashboard.",
    rating: 5,
  },
  {
    name: "Yaw Boateng",
    role: "Dealer",
    company: "Takoradi",
    content:
      "The storefront feature lets my agents sell online without any technical knowledge. Revenue is up 40%.",
    rating: 5,
  },
] as const;

const PLATFORM_STATS: StatCardProps[] = [
  {
    title: "Active Users",
    value: "650+",
    icon: <Users />,
    trend: "+80 this month",
    trendUp: true,
  },
  {
    title: "Monthly Transactions",
    value: "500K+",
    icon: <Activity />,
    trend: "+35% growth",
    trendUp: true,
  },
  {
    title: "Revenue Processed",
    value: "\u20B550M+",
    icon: <DollarSign />,
    trend: "+45% vs last quarter",
    trendUp: true,
  },
  {
    title: "Satisfaction Score",
    value: "4.9/5",
    icon: <Star />,
    trend: "98% would recommend",
    trendUp: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Re-usable sub-components                                           */
/* ------------------------------------------------------------------ */

const RevealOnScroll: FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */

export const LandingPage: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.title = "BryteLinks — Telecom Platform";
  }, []);

  const scrollTo = useCallback((id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  }, []);

  const assignRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] overflow-hidden">
      {/* Grain overlay for texture */}
      <div
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ================================================================ */}
      {/*  NAVIGATION                                                       */}
      {/* ================================================================ */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "backdrop-blur-xl border-b shadow-sm"
            : "bg-transparent"
        }`}
        style={{
          backgroundColor: isScrolled
            ? "color-mix(in srgb, var(--bg-page) 88%, transparent)"
            : "transparent",
          borderColor: "var(--border-color)",
        }}
      >
        <Container>
          <div className="flex justify-between items-center h-16 sm:h-[var(--header-height)]">
            <Link to="/home" className="flex-shrink-0">
              <BryteLinksSvgLogoCompact width={38} height={42} />
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="relative px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-[var(--bg-surface-alt)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {l.label}
                </button>
              ))}
              <div className="w-px h-6 mx-2" style={{ backgroundColor: "var(--border-color)" }} />
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-surface-alt)] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              style={{ color: "var(--text-secondary)" }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <div
              className="md:hidden pb-6 border-t backdrop-blur-xl"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor:
                  "color-mix(in srgb, var(--bg-page) 95%, transparent)",
              }}
            >
              <div className="flex flex-col gap-1 pt-4">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollTo(l.id)}
                    className="text-left py-2.5 px-3 rounded-lg font-medium transition-colors hover:bg-[var(--bg-surface-alt)]"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {l.label}
                  </button>
                ))}
                <hr
                  className="my-3"
                  style={{ borderColor: "var(--border-color)" }}
                />
                <Link
                  to="/login"
                  className="py-2.5 px-3 font-medium"
                  style={{ color: "var(--text-primary)" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button size="sm" fullWidth>
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Container>
      </nav>

      {/* ================================================================ */}
      {/*  HERO                                                             */}
      {/* ================================================================ */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-page)] via-[var(--bg-surface-alt)] to-[var(--bg-page)]" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-[0.08] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.05] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          }}
        />

        <Container className="relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <RevealOnScroll>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-8 border"
                style={{
                  color: "var(--color-secondary)",
                  borderColor:
                    "color-mix(in srgb, var(--color-secondary) 30%, transparent)",
                  backgroundColor:
                    "color-mix(in srgb, var(--color-secondary) 8%, transparent)",
                }}
              >
                <Zap className="w-3 h-3" />
                Ghana&rsquo;s Smart Telecom Platform
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <h1
                className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.03em] mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                Sell Airtime &amp; Data.{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                  }}
                >
                  Earn More.
                </span>
              </h1>
            </RevealOnScroll>

            <RevealOnScroll>
              <p
                className="text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto mb-10"
                style={{ color: "var(--text-secondary)" }}
              >
                BryteLinks is the all-in-one platform that lets agents, dealers,
                and enterprises sell mobile airtime &amp; data bundles across
                every Ghanaian network.
              </p>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="text-base px-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    Create Free Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <button
                  onClick={() => scrollTo("services")}
                  className="group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-[var(--bg-surface-alt)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Learn More
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {HERO_STATS.map((s) => (
                  <Card
                    key={s.label}
                    variant="outlined"
                    className="text-center border-0 shadow-sm"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--bg-surface) 75%, transparent)",
                      backdropFilter: "blur(8px)",
                    }}
                    noPadding
                  >
                    <CardBody className="p-4 sm:p-5">
                      <s.icon
                        className="w-5 h-5 mx-auto mb-2"
                        style={{ color: "var(--color-secondary)" }}
                      />
                      <div
                        className="text-2xl sm:text-3xl font-bold tracking-tight"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {s.value}
                      </div>
                      <div
                        className="text-xs sm:text-sm font-medium"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {s.label}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  STATS BAND                                                       */}
      {/* ================================================================ */}
      <Section background="dark" padding="lg">
        <Container>
          <StatsGrid stats={PLATFORM_STATS} columns={4} gap="lg" />
        </Container>
      </Section>

      {/* ================================================================ */}
      {/*  SERVICES                                                         */}
      {/* ================================================================ */}
      <Section
        background="gray"
        padding="lg"
        ref={assignRef("services")}
        id="services"
      >
        <Container>
          <SectionHeader
            title="Everything You Need"
            subtitle="From airtime top-ups to data bundles — BryteLinks handles it all so you can focus on growing."
          />

          <FeatureGrid columns={3} gap="lg">
            {SERVICES.map((svc) => (
              <Feature
                key={svc.title}
                icon={
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-[var(--color-secondary)]"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--color-secondary) 12%, transparent)",
                    }}
                  >
                    <svc.icon
                      className="w-5 h-5 transition-colors duration-300"
                      style={{ color: "var(--color-secondary)" }}
                    />
                  </div>
                }
                title={svc.title}
                description={svc.description}
                variant="default"
              />
            ))}
          </FeatureGrid>
        </Container>
      </Section>

      {/* ================================================================ */}
      {/*  HOW IT WORKS                                                     */}
      {/* ================================================================ */}
      <Section background="white" padding="lg">
        <Container>
          <SectionHeader
            title="Get Started in Minutes"
            subtitle="Four steps to start earning with BryteLinks."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <RevealOnScroll key={item.step}>
                <div className="relative text-center group">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-8 left-[60%] w-[60%] border-t-2 border-dashed transition-colors duration-300"
                      style={{
                        borderColor: "var(--border-color)",
                      }}
                    />
                  )}
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white text-xl font-bold mb-5 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                    style={{
                      background: "var(--gradient-primary)",
                    }}
                  >
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span
                    className="block text-xs font-semibold tracking-widest uppercase mb-2"
                    style={{ color: "var(--color-secondary)" }}
                  >
                    Step {item.step}
                  </span>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-xs mx-auto"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.description}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </Section>

      {/* ================================================================ */}
      {/*  FEATURES                                                         */}
      {/* ================================================================ */}
      <Section
        background="gray"
        padding="lg"
        ref={assignRef("features")}
        id="features"
      >
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2
                className="text-3xl sm:text-4xl font-bold mb-6 leading-tight tracking-[-0.02em]"
                style={{ color: "var(--text-primary)" }}
              >
                Built for Reliability.{" "}
                <span style={{ color: "var(--color-secondary)" }}>
                  Designed for Growth.
                </span>
              </h2>
              <p
                className="text-lg mb-10 leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Every feature in BryteLinks is purpose-built for Ghana&rsquo;s
                telecom market — from the security layer to the analytics
                engine.
              </p>

              <div className="space-y-5">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex gap-4 group">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--color-secondary) 12%, transparent)",
                      }}
                    >
                      <f.icon
                        className="w-5 h-5"
                        style={{ color: "var(--color-secondary)" }}
                      />
                    </div>
                    <div>
                      <h4
                        className="font-semibold mb-1"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {f.title}
                      </h4>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {f.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="overflow-hidden shadow-2xl border-0 p-0">
                <div
                  className="p-6 sm:p-8"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 60%, var(--color-secondary)) 100%)",
                  }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BryteLinksSvgIcon width={32} height={32} />
                      <div>
                        <div
                          className="font-bold text-sm"
                          style={{ color: "var(--text-inverse)" }}
                        >
                          BryteLinks Dashboard
                        </div>
                        <div
                          className="text-xs"
                          style={{
                            color: "color-mix(in srgb, var(--text-inverse) 60%, transparent)",
                          }}
                        >
                          Real-time overview
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full animate-pulse"
                        style={{ backgroundColor: "var(--success)" }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "var(--warning)" }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "var(--error)" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--text-inverse) 10%, transparent)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <div
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: "var(--text-inverse)" }}
                      >
                        {'\u20B5'}12,450
                      </div>
                      <div
                        className="text-xs flex items-center gap-1 mt-1"
                        style={{
                          color:
                            "color-mix(in srgb, var(--text-inverse) 70%, transparent)",
                        }}
                      >
                        <TrendingUp
                          className="w-3 h-3"
                          style={{ color: "var(--success)" }}
                        />
                        Wallet Balance
                      </div>
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{
                        backgroundColor:
                          "color-mix(in srgb, var(--text-inverse) 10%, transparent)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <div
                        className="text-2xl sm:text-3xl font-bold"
                        style={{ color: "var(--text-inverse)" }}
                      >
                        327
                      </div>
                      <div
                        className="text-xs flex items-center gap-1 mt-1"
                        style={{
                          color:
                            "color-mix(in srgb, var(--text-inverse) 70%, transparent)",
                        }}
                      >
                        <ShoppingCart className="w-3 h-3" style={{ color: "var(--color-secondary)" }} />
                        Orders Today
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-xl p-4"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--text-inverse) 10%, transparent)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div
                      className="text-xs font-medium mb-3"
                      style={{
                        color:
                          "color-mix(in srgb, var(--text-inverse) 80%, transparent)",
                      }}
                    >
                      Weekly Revenue
                    </div>
                    <div className="flex items-end gap-2 h-20">
                      {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-md transition-all hover:opacity-80"
                          style={{
                            height: `${h}%`,
                            backgroundColor:
                              "color-mix(in srgb, var(--text-inverse) 20%, transparent)",
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] mt-2" style={{ color: "color-mix(in srgb, var(--text-inverse) 50%, transparent)" }}>
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (d) => (
                          <span key={d}>{d}</span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <div
                className="absolute -top-4 -right-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                style={{
                  background: "var(--success)",
                  color: "var(--text-inverse)",
                }}
              >
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ================================================================ */}
      {/*  NETWORKS                                                         */}
      {/* ================================================================ */}
      <Section
        background="white"
        padding="lg"
        ref={assignRef("networks")}
        id="networks"
      >
        <Container>
          <SectionHeader
            title="All Major Ghanaian Networks"
            subtitle="One platform, complete coverage. Sell across every network your customers use."
          />

          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {NETWORKS.map((net) => (
              <Card
                key={net.name}
                variant="interactive"
                className="text-center border-0 hover:shadow-xl transition-all duration-300"
                style={{
                  backgroundColor: `color-mix(in srgb, ${net.brandColor} 6%, var(--bg-surface))`,
                }}
              >
                <CardBody className="py-8">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-xl text-white mb-5 shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${net.brandColor}, color-mix(in srgb, ${net.brandColor} 60%, black))`,
                    }}
                  >
                    <Globe className="w-7 h-7" />
                  </div>
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{ color: net.brandColor }}
                  >
                    {net.name}
                  </h3>
                  <ul className="space-y-2">
                    {net.services.map((s) => (
                      <li
                        key={s}
                        className="flex items-center justify-center gap-2 text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        <Check
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: "var(--success)" }}
                        />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ================================================================ */}
      {/*  WHO IT'S FOR                                                     */}
      {/* ================================================================ */}
      <Section
        background="gray"
        padding="lg"
        ref={assignRef("about")}
        id="about"
      >
        <Container>
          <SectionHeader
            title="Built for Every Level"
            subtitle="Whether you're a solo agent or managing an entire distribution network — BryteLinks scales with you."
          />

          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {TIERS.map((t) => (
              <Card
                key={t.title}
                variant="interactive"
                className="text-center border-0 hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: "var(--bg-surface)" }}
              >
                <CardBody className="py-10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--color-secondary) 12%, transparent)",
                    }}
                  >
                    <t.icon
                      className="w-7 h-7"
                      style={{ color: "var(--color-secondary)" }}
                    />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {t.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {t.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ================================================================ */}
      {/*  TESTIMONIALS                                                     */}
      {/* ================================================================ */}
      <Section
        background="gray"
        padding="lg"
        ref={assignRef("testimonials")}
        id="testimonials"
      >
        <Container>
          <SectionHeader
            title="Loved by Agents Across Ghana"
            subtitle="Real stories from real people building real businesses on BryteLinks."
          />

          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {TESTIMONIALS.map((t) => (
              <Testimonial
                key={t.name}
                content={t.content}
                author={t.name}
                role={t.role}
                company={t.company}
                rating={t.rating}
                avatar={
                  <Avatar
                    name={t.name}
                    size="md"
                  />
                }
                variant="card"
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* ================================================================ */}
      {/*  CTA                                                              */}
      {/* ================================================================ */}
      <Section padding="lg" className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-navy-dark) 0%, var(--color-primary) 50%, color-mix(in srgb, var(--color-primary) 70%, var(--color-secondary)) 100%)",
          }}
        />
        <div
          className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
          }}
        />

        <Container className="relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <RevealOnScroll>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight tracking-[-0.02em]"
                style={{ color: "var(--text-inverse)" }}
              >
                Ready to Grow Your Telecom Business?
              </h2>
            </RevealOnScroll>

            <RevealOnScroll>
              <p
                className="text-lg sm:text-xl mb-10 leading-relaxed"
                style={{
                  color:
                    "color-mix(in srgb, var(--text-inverse) 80%, transparent)",
                }}
              >
                Join hundreds of agents and dealers already earning more with
                BryteLinks. No setup fees — start selling today.
              </p>
            </RevealOnScroll>

            <RevealOnScroll>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-base px-8 shadow-xl hover:shadow-2xl transition-all duration-300"
                    style={{
                      background: "var(--text-inverse)",
                      color: "var(--color-primary)",
                    }}
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 border-2 transition-all duration-300 hover:bg-white/10"
                    style={{
                      borderColor: "var(--text-inverse)",
                      color: "var(--text-inverse)",
                    }}
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </RevealOnScroll>

            <RevealOnScroll>
              <div
                className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm"
                style={{
                  color:
                    "color-mix(in srgb, var(--text-inverse) 80%, transparent)",
                }}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Secure &amp; Encrypted
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Free Forever Plan
                </span>
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Cancel Anytime
                </span>
              </div>
            </RevealOnScroll>
          </div>
        </Container>
      </Section>

      {/* ================================================================ */}
      {/*  FOOTER                                                           */}
      {/* ================================================================ */}
      <footer
        style={{
          backgroundColor: "var(--color-navy-dark)",
          color: "var(--text-inverse)",
        }}
      >
        <Container>
          <div className="py-12 lg:py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <BryteLinksSvgIcon width={32} height={32} />
                <span className="text-xl font-bold">BryteLinks</span>
              </div>
              <p
                className="text-sm leading-relaxed max-w-xs"
                style={{
                  color:
                    "color-mix(in srgb, var(--text-inverse) 60%, transparent)",
                }}
              >
                Ghana&rsquo;s smart telecom platform for agents, dealers, and
                enterprises. Sell airtime &amp; data, and grow your business.
              </p>
            </div>

            <div>
              <h4
                className="font-semibold text-xs uppercase tracking-widest mb-4"
                style={{
                  color:
                    "color-mix(in srgb, var(--text-inverse) 50%, transparent)",
                }}
              >
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "Sign In", to: "/login" },
                  { label: "Create Account", to: "/register" },
                  { label: "Privacy Policy", to: "/privacy-policy" },
                ].map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="transition-colors hover:opacity-80"
                      style={{
                        color:
                          "color-mix(in srgb, var(--text-inverse) 70%, transparent)",
                      }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4
                className="font-semibold text-xs uppercase tracking-widest mb-4"
                style={{
                  color:
                    "color-mix(in srgb, var(--text-inverse) 50%, transparent)",
                }}
              >
                Services
              </h4>
              <ul
                className="space-y-2.5 text-sm"
                style={{
                  color:
                    "color-mix(in srgb, var(--text-inverse) 70%, transparent)",
                }}
              >
                <li>Airtime Top-Up</li>
                <li>Data Bundles</li>
                <li>Agent Storefronts</li>
              </ul>
            </div>

            <div>
              <h4
                className="font-semibold text-xs uppercase tracking-widest mb-4"
                style={{
                  color:
                    "color-mix(in srgb, var(--text-inverse) 50%, transparent)",
                }}
              >
                Supported Networks
              </h4>
              <ul
                className="space-y-2.5 text-sm"
                style={{
                  color:
                    "color-mix(in srgb, var(--text-inverse) 70%, transparent)",
                }}
              >
                <li>MTN Ghana</li>
                <li>Telecel Ghana</li>
                <li>AirtelTigo</li>
              </ul>
            </div>
          </div>

          <div
            className="py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              borderColor:
                "color-mix(in srgb, var(--text-inverse) 15%, transparent)",
            }}
          >
            <p
              className="text-xs"
              style={{
                color:
                  "color-mix(in srgb, var(--text-inverse) 50%, transparent)",
              }}
            >
              &copy; {new Date().getFullYear()} BryteLinks. All rights reserved.
            </p>
            <div
              className="flex items-center gap-1 text-xs"
              style={{
                color:
                  "color-mix(in srgb, var(--text-inverse) 50%, transparent)",
              }}
            >
              <span>Designed &amp; Developed with</span>
              <Star
                className="w-3 h-3"
                style={{ color: "var(--warning)", fill: "var(--warning)" }}
              />
              <span>
                by{" "}
                <a
                  href="https://github.com/QuayeDNA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors font-medium hover:opacity-80"
                  style={{
                    color:
                      "color-mix(in srgb, var(--text-inverse) 70%, transparent)",
                  }}
                >
                  Dave
                </a>
              </span>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};
