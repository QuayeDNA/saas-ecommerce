// src/pages/landing-page.tsx
/**
 * BryteLinks Landing Page
 *
 * A modern, mobile-first, fully self-contained landing page for the
 * BryteLinks platform — no external data context required.
 *
 * Sections:
 *  1. Navigation (fixed, scroll-aware)
 *  2. Hero
 *  3. Services
 *  4. How It Works
 *  5. Features grid
 *  6. Networks we support
 *  7. Who it's for (user tiers)
 *  8. Testimonials
 *  9. CTA
 * 10. Footer with developer credit
 */

import { useState, useEffect, useRef, type FC } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Card, CardBody } from "../design-system";
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
  ChevronDown,
  Heart,
  Wifi,
  CreditCard,
  UserCheck,
  Building2,
  Headphones,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data — no context dependency                                */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { id: "services", label: "Services" },
  { id: "features", label: "Features" },
  { id: "networks", label: "Networks" },
  { id: "about", label: "About" },
] as const;

const HERO_STATS = [
  { value: "4+", label: "Networks", icon: Globe },
  { value: "50K+", label: "Transactions", icon: TrendingUp },
  { value: "99.9%", label: "Uptime", icon: Zap },
  { value: "24/7", label: "Support", icon: Headphones },
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
      "Manage your funds with a secure digital wallet. Top up, transfer, and track every transaction in real time.",
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
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Your Account",
    description:
      "Sign up in under a minute. Choose your role — agent, super-agent, or dealer — and get verified instantly.",
  },
  {
    step: "02",
    title: "Fund Your Wallet",
    description:
      "Add funds through mobile money or bank transfer. Your balance is available immediately for transactions.",
  },
  {
    step: "03",
    title: "Start Selling",
    description:
      "Process airtime and data orders through the dashboard or share your storefront link with customers.",
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
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Revenue trends, order breakdowns, and performance charts help you make data-driven decisions.",
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
    brandColor: "var(--color-primary)",
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
    role: "Agent — Kumasi",
    content:
      "BryteLinks changed the way I run my business. The wallet system is seamless and I can track every cedi.",
    rating: 5,
  },
  {
    name: "Abena Mensah",
    role: "Super Agent — Accra",
    content:
      "Managing 30+ agents used to be chaos. Now I see real-time performance from one dashboard.",
    rating: 5,
  },
  {
    name: "Yaw Boateng",
    role: "Dealer — Takoradi",
    content:
      "The storefront feature lets my agents sell online without any technical knowledge. Revenue is up 40%.",
    rating: 5,
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const LandingPage: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  /* ----- scroll spy ----- */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

   // Set page title
    useEffect(() => {
      document.title = "BryteLinks - Home";
    }, []);

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const assignRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-surface)' }}>
      {/* ================================================================ */}
      {/*  NAVIGATION                                                       */}
      {/* ================================================================ */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "backdrop-blur-xl shadow-lg border-b" : "bg-transparent"
        }`}
        style={isScrolled ? { backgroundColor: 'color-mix(in srgb, var(--bg-surface) 95%, transparent)', borderColor: 'var(--border-color)' } : undefined}
      >
        <Container>
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/home" className="flex-shrink-0">
              <BryteLinksSvgLogoCompact width={130} height={36} />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {l.label}
                </button>
              ))}
              <Link
                to="/login"
                className="text-sm font-medium transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile drawer */}
          {isMenuOpen && (
            <div
              className="md:hidden pb-6 border-t backdrop-blur-xl"
              style={{ borderColor: 'var(--border-color)', backgroundColor: 'color-mix(in srgb, var(--bg-surface) 95%, transparent)' }}
            >
              <div className="flex flex-col gap-2 pt-4">
                {NAV_LINKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollTo(l.id)}
                    className="text-left py-2 px-2 rounded-lg font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {l.label}
                  </button>
                ))}
                <hr className="my-2" style={{ borderColor: 'var(--border-color)' }} />
                <Link
                  to="/login"
                  className="py-2 px-2 font-medium"
                  style={{ color: 'var(--text-primary)' }}
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
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)] via-white to-[var(--color-secondary-50)]" />
        <div className="absolute top-20 -left-20 w-80 h-80 bg-[var(--color-primary-100)] rounded-full mix-blend-multiply blur-3xl opacity-40" />
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-[var(--color-secondary-100)] rounded-full mix-blend-multiply blur-3xl opacity-30" />

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 bg-[var(--color-primary-50)] text-[var(--color-primary-600)] px-5 py-2 rounded-full text-sm font-semibold mb-8 border border-[var(--color-primary-100)]">
              <Zap className="w-4 h-4" />
              Ghana&rsquo;s Smart Telecom Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Sell Airtime &amp; Data.{" "}
              <span className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)] bg-clip-text text-transparent">
                Earn More.
              </span>
            </h1>

            <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
              BryteLinks is the all-in-one platform that lets agents, dealers,
and enterprises sell mobile airtime &amp; data bundles across every
Ghanaian network.
            </p>

            {/* CTA row */}
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
                className="group inline-flex items-center gap-2 font-medium transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                Learn More
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </div>

            {/* Hero stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {HERO_STATS.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/80 backdrop-blur rounded-2xl p-4 sm:p-5 shadow-md border"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <s.icon className="w-5 h-5 text-[var(--color-primary-500)] mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {s.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  SERVICES                                                         */}
      {/* ================================================================ */}
      <section
        id="services"
        ref={assignRef("services")}
        className="py-20 lg:py-28"
        style={{ backgroundColor: 'var(--bg-muted)' }}
      >
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything You Need to Run a Telecom Business
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              From airtime top-ups to data bundles — BryteLinks handles
              it all so you can focus on growing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {SERVICES.map((svc) => (
              <Card
                key={svc.title}
                variant="interactive"
                className="group border-0 hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <CardBody>
                  <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-50)] flex items-center justify-center mb-5 group-hover:bg-[var(--color-primary-500)] transition-colors duration-300">
                    <svc.icon className="w-6 h-6 text-[var(--color-primary-500)] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {svc.title}
                  </h3>
                  <p className="leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {svc.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  HOW IT WORKS                                                     */}
      {/* ================================================================ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Get Started in Minutes
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Four simple steps to start earning with BryteLinks.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line (desktop) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed" style={{ borderColor: 'var(--border-color)' }} />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary-500)] text-white text-xl font-bold mb-5 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  FEATURES                                                         */}
      {/* ================================================================ */}
      <section
        id="features"
        ref={assignRef("features")}
        className="py-20 lg:py-28 bg-gradient-to-br from-[var(--bg-muted)] via-[var(--bg-surface)] to-[var(--bg-muted)]"
      >
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — copy */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
                Built for Reliability.{" "}
                <span className="text-[var(--color-primary-500)]">
                  Designed for Growth.
                </span>
              </h2>
              <p className="text-lg mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Every feature in BryteLinks is purpose-built for Ghana&rsquo;s
                telecom market — from the security layer to the analytics
                engine.
              </p>

              <div className="space-y-5">
                {FEATURES.map((f) => (
                  <div key={f.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--color-primary-50)] flex items-center justify-center">
                      <f.icon className="w-5 h-5 text-[var(--color-primary-500)]" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {f.title}
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {f.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dashboard mockup */}
            <div className="relative">
              <Card className="overflow-hidden shadow-2xl border-0 p-0">
                <div className="bg-gradient-to-br from-[var(--color-primary-600)] via-[var(--color-primary-500)] to-[var(--color-secondary-600)] p-6 sm:p-8">
                  {/* Mock header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BryteLinksSvgIcon width={32} height={32} />
                      <div>
                        <div className="text-white font-bold text-sm">
                          BryteLinks Dashboard
                        </div>
                        <div className="text-white/60 text-xs">
                          Real-time overview
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--success)' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--error)' }} />
                    </div>
                  </div>

                  {/* Mock stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                      <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-inverse)' }}>
                        &#8373;12,450
                      </div>
                      <div className="text-white/70 text-xs flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" style={{ color: 'var(--success)' }} />
                        Wallet Balance
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                      <div className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-inverse)' }}>
                        327
                      </div>
                      <div className="text-white/70 text-xs flex items-center gap-1 mt-1">
                        <ShoppingCart className="w-3 h-3" style={{ color: 'var(--color-primary)' }} />
                        Orders Today
                      </div>
                    </div>
                  </div>

                  {/* Mock chart bars */}
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                    <div className="text-white/80 text-xs font-medium mb-3">
                      Weekly Revenue
                    </div>
                    <div className="flex items-end gap-2 h-20">
                      {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-white/20 rounded-t-md transition-all hover:bg-white/30"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-white/50 mt-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (d) => (
                          <span key={d}>{d}</span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Floating accent */}
              <div className="absolute -top-4 -right-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                style={{
                  backgroundImage: 'linear-gradient(to bottom right, var(--success), color-mix(in srgb, var(--success) 70%, black))',
                  color: 'var(--text-inverse)'
                }}
              >
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  NETWORKS                                                         */}
      {/* ================================================================ */}
      <section
        id="networks"
        ref={assignRef("networks")}
        className="py-20 lg:py-28"
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              All Major Ghanaian Networks
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              One platform, complete coverage. Sell across every network your
              customers use.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {NETWORKS.map((net) => (
              <div
                key={net.name}
                className="rounded-2xl p-6 sm:p-8 text-center hover:shadow-lg transition-shadow duration-300"
                style={{
                  backgroundColor: `color-mix(in srgb, ${net.brandColor} 8%, transparent)`,
                  borderColor: `color-mix(in srgb, ${net.brandColor} 30%, transparent)`,
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-xl text-white mb-5 shadow-md"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${net.brandColor}, color-mix(in srgb, ${net.brandColor} 60%, black))`,
                  }}
                >
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-4" style={{ color: net.brandColor }}>
                  {net.name}
                </h3>
                <ul className="space-y-2">
                  {net.services.map((s) => (
                    <li
                      key={s}
                      className="flex items-center justify-center gap-2 text-sm"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--success)' }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  WHO IT'S FOR                                                     */}
      {/* ================================================================ */}
      <section
        id="about"
        ref={assignRef("about")}
        className="py-20 lg:py-28"
        style={{ backgroundColor: 'var(--bg-muted)' }}
      >
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Built for Every Level
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Whether you&rsquo;re a solo agent or managing an entire
              distribution network — BryteLinks scales with you.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {TIERS.map((t) => (
              <Card
                key={t.title}
                variant="interactive"
                className="text-center border-0 hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                <CardBody className="py-10">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-50)] flex items-center justify-center mx-auto mb-5">
                    <t.icon className="w-7 h-7 text-[var(--color-primary-500)]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {t.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {t.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  TESTIMONIALS                                                     */}
      {/* ================================================================ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Loved by Agents Across Ghana
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Real stories from real people building real businesses on
              BryteLinks.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
            {TESTIMONIALS.map((t) => (
              <Card
                key={t.name}
                className="border-0 hover:shadow-lg transition-shadow duration-300"
                style={{ backgroundColor: 'var(--bg-muted)' }}
              >
                <CardBody>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        style={{ color: 'var(--warning)', fill: 'var(--warning)' }}
                      />
                    ))}
                  </div>
                  <p className="leading-relaxed mb-6 italic text-sm" style={{ color: 'var(--text-primary)' }}>
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {t.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {t.role}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  CTA                                                              */}
      {/* ================================================================ */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[var(--color-primary-600)] via-[var(--color-primary-500)] to-[var(--color-secondary-600)] relative overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <Container className="relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-inverse)' }}>
              Ready to Grow Your Telecom Business?
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed">
              Join hundreds of agents and dealers already earning more with
              BryteLinks. No setup fees — start selling today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-8 shadow-xl hover:shadow-2xl"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 border-2 transition-colors"
                  style={{
                    borderColor: 'var(--text-inverse)',
                    color: 'var(--text-inverse)',
                  }}
                >
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/80 text-sm">
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
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  FOOTER                                                           */}
      {/* ================================================================ */}
      <footer style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>
        <Container>
          <div className="py-12 lg:py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <BryteLinksSvgIcon width={32} height={32} />
                <span className="text-xl font-bold">BryteLinks</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--text-tertiary)' }}>
                Ghana&rsquo;s smart telecom platform for agents, dealers, and
                enterprises. Sell airtime &amp; data, and grow
                your business.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Platform
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Sign In", to: "/login" },
                  { label: "Create Account", to: "/register" },
                  { label: "Privacy Policy", to: "/privacy-policy" },
                ].map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Services
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                <li>Airtime Top-Up</li>
                <li>Data Bundles</li>
                <li>Agent Storefronts</li>
              </ul>
            </div>

            {/* Networks */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)' }}>
                Supported Networks
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                <li>MTN Ghana</li>
                <li>Telecel Ghana</li>
                <li>AirtelTigo</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              &copy; {new Date().getFullYear()} BryteLinks. All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>Designed &amp; Developed with</span>
              <Heart className="w-3 h-3" style={{ color: 'var(--error)', fill: 'var(--error)' }} />
              <span>
                by{" "}
                <a
                  href="https://github.com/QuayeDNA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
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
