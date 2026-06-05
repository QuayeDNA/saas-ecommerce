import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Check, Zap, Globe } from "lucide-react";
import { Card, CardBody, CardHeader, Container } from "../design-system";
import { BryteLinksSvgLogoCompact } from "../components/common/BryteLinksSvgLogo";
import { GlobalFab } from "../components/common/GlobalFab";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backLink?: string;
  backLabel?: string;
  steps?: string[];
  activeStep?: number;
  footer?: ReactNode;
}

const NETWORKS = [
  {
    name: "MTN",
    color: "var(--warning)",
    position: "top-left",
  },
  {
    name: "Telecel",
    color: "var(--error)",
    position: "top-right",
  },
  {
    name: "AirtelTigo",
    color: "var(--color-secondary)",
    position: "bottom-center",
  },
] as const;

const SLIDES = [
  {
    heading: "Cheap Mobile Data",
    sub: "Bundles at prices your customers will love, across every major network.",
  },
  {
    heading: "Your Own Storefront",
    sub: "A branded shop that's yours — share it, sell from it, grow with it.",
  },
  {
    heading: "Instant Topups",
    sub: "Airtime delivered in seconds. No delays, no excuses.",
  },
  {
    heading: "Real Commissions",
    sub: "Earn on every transaction. More sales, more in your pocket.",
  },
  {
    heading: "Grow Your Business",
    sub: "Tools built for agents ready to scale beyond their first sale.",
  },
] as const;

const floatKeyframes = `
@keyframes floatA {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-14px); }
}
@keyframes floatB {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes floatC {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-16px); }
}
`;

function NetworkLogo({
  name,
  color,
  position,
}: {
  name: string;
  color: string;
  position: string;
}) {
  const positionClasses: Record<string, string> = {
    "top-left": "absolute -top-12 -left-6 lg:-top-14 lg:-left-8",
    "top-right": "absolute -top-14 -right-6 lg:-top-16 lg:-right-8",
    "bottom-center":
      "absolute -bottom-12 left-1/2 -translate-x-1/2 lg:-bottom-14",
  };

  const animationStyle: Record<string, React.CSSProperties> = {
    "top-left": {
      animation: "floatA 3.8s ease-in-out infinite",
    },
    "top-right": {
      animation: "floatB 4.4s ease-in-out infinite 0.6s",
    },
    "bottom-center": {
      animation: "floatC 3.2s ease-in-out infinite 1.1s",
    },
  };

  return (
    <div
      className={`${positionClasses[position]} z-10 flex flex-col items-center`}
      style={animationStyle[position]}
    >
      <div
        className="h-14 w-14 lg:h-16 lg:w-16 rounded-xl flex items-center justify-center font-bold text-sm lg:text-base shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 60%, black))`,
          color: "var(--text-inverse)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <Globe className="w-6 h-6 lg:w-7 lg:h-7" />
      </div>
      <p
        className="mt-1.5 text-[10px] font-semibold tracking-widest uppercase"
        style={{
          color:
            "color-mix(in srgb, var(--text-inverse) 50%, transparent)",
        }}
      >
        {name}
      </p>
    </div>
  );
}

function PitchCarousel() {
  const [current, setCurrent] = useState(0);
  const [animState, setAnimState] = useState<"idle" | "out" | "in">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(advance, 3400);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current]);

  function advance() {
    setAnimState("out");
    setTimeout(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
      setAnimState("in");
      setTimeout(() => setAnimState("idle"), 450);
    }, 350);
  }

  const slideStyle: React.CSSProperties = {
    transition: "opacity 0.35s ease-in-out, transform 0.35s ease-in-out",
    opacity: animState === "out" ? 0 : 1,
    transform:
      animState === "out"
        ? "translateY(-24px)"
        : animState === "in"
        ? "translateY(6px)"
        : "translateY(0)",
  };

  return (
    <div className="text-center">
      <div className="h-full flex flex-col items-center justify-center overflow-hidden">
        <div style={slideStyle}>
          <h2
            className="text-xl lg:text-2xl font-semibold leading-tight mb-1.5"
            style={{ color: "var(--text-inverse)" }}
          >
            {SLIDES[current].heading}
          </h2>
          <p
            className="text-sm leading-relaxed max-w-[240px] mx-auto"
            style={{
              color:
                "color-mix(in srgb, var(--text-inverse) 55%, transparent)",
            }}
          >
            {SLIDES[current].sub}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setCurrent(i);
            }}
            className="rounded-full transition-all duration-300"
            style={{
              height: "4px",
              width: i === current ? "20px" : "6px",
              backgroundColor:
                i === current
                  ? "var(--text-inverse)"
                  : "color-mix(in srgb, var(--text-inverse) 25%, transparent)",
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export const AuthLayout = ({
  title,
  subtitle,
  children,
  backLink,
  backLabel = "Back",
  steps,
  activeStep = 1,
  footer,
}: AuthLayoutProps) => {
  return (
    <div className="h-screen bg-[var(--bg-page)] flex flex-col overflow-hidden">
      <style>{floatKeyframes}</style>

      {/* ── FIXED HEADER ── */}
      <header
        className="flex-shrink-0"
        style={{
          background: "var(--gradient-brand-dark)",
          color: "var(--text-inverse)",
        }}
      >
        <Container className="py-4 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6">
            <Link
              to={backLink ?? "/home"}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold transition-all duration-200 hover:bg-white/10"
              style={{
                color: "var(--text-inverse)",
                border: "1px solid color-mix(in srgb, var(--text-inverse) 15%, transparent)",
                backgroundColor:
                  "color-mix(in srgb, var(--text-inverse) 5%, transparent)",
              }}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{backLabel}</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 flex items-center justify-center">
                <BryteLinksSvgLogoCompact width="100%" height="100%" />
              </div>
              <div className="text-left">
                <p
                  className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.24em] font-medium"
                  style={{ color: "var(--text-inverse)" }}
                >
                  BryteLinks
                </p>
                <p
                  className="text-xs sm:text-sm"
                  style={{
                    color:
                      "color-mix(in srgb, var(--text-inverse) 55%, transparent)",
                  }}
                >
                  Data Solutions
                </p>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* ── CENTERED CONTENT ── */}
      <main className="flex-1 min-h-0 flex items-center justify-center px-4 py-6 sm:py-10 sm:px-6">
        <div className="w-full max-w-6xl max-h-full flex flex-col">
          <Card
            className="rounded-xl flex flex-col min-h-0 overflow-hidden [&>div]:flex [&>div]:flex-col [&>div]:min-h-0 [&>div]:overflow-hidden"
            variant="elevated"
            noPadding
            style={{
              boxShadow:
                "0 8px 32px color-mix(in srgb, var(--color-navy-dark) 15%, transparent), 0 2px 8px color-mix(in srgb, var(--color-navy-dark) 8%, transparent)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[1.1fr_0.9fr]">

              {/* ── LEFT COLUMN (desktop only) ── */}
              <div
                className="hidden lg:flex items-center justify-center relative overflow-hidden"
                style={{
                  background: "var(--gradient-brand-dark)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 70%)",
                  }}
                />

                <div className="relative flex flex-col items-center max-w-xs w-full px-8 py-14">
                  {NETWORKS.map((n) => (
                    <NetworkLogo key={n.name} {...n} />
                  ))}

                  <div
                    className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, var(--text-inverse) 10%, transparent)",
                    }}
                  >
                    <Zap
                      size={20}
                      style={{ color: "var(--warning)" }}
                    />
                  </div>

                  <p
                    className="text-center text-[10px] uppercase tracking-[0.2em] font-medium mb-4"
                    style={{
                      color:
                        "color-mix(in srgb, var(--text-inverse) 45%, transparent)",
                    }}
                  >
                    All networks. One platform.
                  </p>

                  <PitchCarousel />
                </div>
              </div>

              {/* ── RIGHT COLUMN (scrollable) ── */}
              <div className="overflow-y-auto px-4 py-6 sm:px-10 sm:py-10">
                <CardHeader className="px-0 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 text-[var(--text-secondary)]">
                      <div>
                        <p className="text-[10px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.24em] text-[var(--text-muted)] font-medium">
                          User Portal
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] leading-tight">
                          {title}
                        </h1>
                      </div>
                    </div>
                    {subtitle ? (
                      <p className="max-w-2xl text-xs sm:text-sm leading-relaxed sm:leading-6 text-[var(--text-secondary)]">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                </CardHeader>

                {steps && steps.length > 0 ? (
                  <div className="mt-5 sm:mt-6 mb-2 flex items-center w-full">
                    {steps.map((stepLabel, index) => {
                      const stepIndex = index + 1;
                      const isComplete = stepIndex < activeStep;
                      const isActive = stepIndex <= activeStep;
                      return (
                        <div
                          key={stepLabel}
                          className="flex items-center flex-1 last:flex-none"
                        >
                          <div
                            className={`flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                              isActive
                                ? "text-[var(--text-inverse)]"
                                : "text-[var(--text-muted)]"
                            }`}
                            style={{
                              backgroundColor: isActive
                                ? "var(--color-navy-dark)"
                                : "var(--bg-surface-alt)",
                            }}
                          >
                            {isComplete ? (
                              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            ) : (
                              stepIndex
                            )}
                          </div>
                          {stepIndex < steps.length && (
                            <div
                              className={`flex-1 h-1 mx-2 sm:mx-3 rounded-full transition-all duration-300`}
                              style={{
                                backgroundColor: isComplete
                                  ? "var(--color-navy-dark)"
                                  : "var(--bg-surface-alt)",
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                    <div className="ml-3 sm:ml-4 flex-col hidden sm:flex">
                      <span className="text-[0.65rem] sm:text-[0.72rem] uppercase tracking-[0.2em] sm:tracking-[0.24em] text-[var(--text-muted)]">
                        Step {activeStep}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        {steps[activeStep - 1]}
                      </span>
                    </div>
                  </div>
                ) : null}

                <CardBody className="px-0 pt-6 sm:pt-8 pb-0">
                  {children}
                </CardBody>

                {footer ? (
                  <div className="mt-5 sm:mt-6 border-t border-[var(--border-color)] pt-5 sm:pt-6">
                    {footer}
                  </div>
                ) : null}

              </div>
            </div>
          </Card>
        </div>
      </main>

      <GlobalFab />
    </div>
  );
};
