import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Smartphone, Check } from "lucide-react";
import { Card, CardBody, CardHeader, Container } from "../design-system";
import { BryteLinksSvgLogoCompact } from "../components/common/BryteLinksSvgLogo";
import { FaUsers, FaWhatsapp } from "react-icons/fa";

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
    src: "https://www.mtn.co.ug/wp-content/uploads/sites/7/2023/12/MTN_2022_Logo_SolidBG_Yellow_RGB.jpg?resize=1024,1024",
    position: "top-left",
  },
  {
    name: "Telecel",
    src: "https://tse2.mm.bing.net/th/id/OIP._V9CkKDi23oI4p9VRjvu9wHaHa?cb=thfvnextfalcon&rs=1&pid=ImgDetMain&o=7&rm=3",
    position: "top-right",
  },
  {
    name: "AT",
    src: "https://recharge-prd.asset.akeneo.cloud/product_assets/media/recharge_com_airteltigo_product_card.png",
    position: "bottom-center",
  },
];

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
];

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
  src,
  position,
}: {
  name: string;
  src: string;
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
      <div className="h-14 w-14 lg:h-16 lg:w-16 rounded-xl overflow-hidden border-2 border-white/10 shadow-xl shadow-black/40">
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <p className="mt-1.5 text-[10px] font-medium tracking-widest text-white/40 uppercase">
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
          <h2 className="text-xl lg:text-2xl font-semibold text-white leading-tight mb-1.5">
            {SLIDES[current].heading}
          </h2>
          <p className="text-sm text-white/50 leading-relaxed max-w-[240px] mx-auto">
            {SLIDES[current].sub}
          </p>
        </div>
      </div>

      {/* Dots */}
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
              background:
                i === current ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)",
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
    <div className="min-h-screen bg-slate-950/5 flex flex-col">
      {/* Inject float keyframes */}
      <style>{floatKeyframes}</style>

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100">
        <Container className="py-4 sm:py-6">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6">
            <Link
              to={backLink ?? "/home"}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-slate-100 transition hover:bg-white/10"
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
                <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.24em] text-[var(--text-primary)] font-medium">
                  BryteLinks
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                  Data Solutions
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10 sm:px-6">
        <div className="w-full max-w-6xl">
          <Card
            className="overflow-hidden shadow-2xl bg-slate-50 border-0 sm:border"
            variant="elevated"
            noPadding
          >
            <div className="grid gap-0 lg:gap-6 lg:grid-cols-[1.1fr_0.9fr] bg-white">

              {/* ── LEFT COLUMN ── */}
              <div className="hidden lg:flex items-center justify-center bg-slate-900 px-8 py-14 relative overflow-hidden">
                {/* Subtle radial glow behind the card */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                <div className="relative flex flex-col items-center max-w-xs w-full">
                  {/* Floating network logos */}
                  {NETWORKS.map((n) => (
                    <NetworkLogo key={n.name} {...n} />
                  ))}

                  {/* Central glass card */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: "20px",
                      padding: "2.5rem 2rem",
                      margin: "68px 0 84px",
                      width: "100%",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.25rem",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#facc15"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>

                    <p className="text-center text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mb-4">
                      All networks. One platform.
                    </p>

                    <PitchCarousel />
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN ── */}
              <div className="px-4 py-6 sm:px-10 sm:py-10">
                <CardHeader className="px-0 pb-4 border-b border-slate-200/70">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 text-slate-700">
                      <div className="flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-900 text-white">
                        <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.24em] text-[var(--text-muted)] font-medium">
                          User Portal
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
                          {title}
                        </h1>
                      </div>
                    </div>
                    {subtitle ? (
                      <p className="max-w-2xl text-xs sm:text-sm leading-relaxed sm:leading-6 text-slate-600">
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
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {isComplete ? (
                              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            ) : (
                              stepIndex
                            )}
                          </div>
                          {stepIndex < steps.length && (
                            <div
                              className={`flex-1 h-1 mx-2 sm:mx-3 rounded-full transition-all duration-300 ${
                                isComplete ? "bg-slate-900" : "bg-slate-100"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                    <div className="ml-3 sm:ml-4 flex-col hidden sm:flex">
                      <span className="text-[0.65rem] sm:text-[0.72rem] uppercase tracking-[0.2em] sm:tracking-[0.24em] text-slate-400">
                        Step {activeStep}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 whitespace-nowrap">
                        {steps[activeStep - 1]}
                      </span>
                    </div>
                  </div>
                ) : null}

                <CardBody className="px-0 pt-6 sm:pt-8 pb-0">
                  {children}
                </CardBody>

                {footer ? (
                  <div className="mt-5 sm:mt-6 border-t border-slate-200/80 pt-5 sm:pt-6">
                    {footer}
                  </div>
                ) : null}

                <div className="text-center pt-5 sm:pt-6 mt-6 sm:mt-8 border-t border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 flex items-center justify-center gap-1.5 font-medium">
                    Need help? Reach out to support.
                  </p>
                  <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                    <a
                      href="https://wa.me/233548983019?text=Hello%20support%2C%20I%20need%20help%20with%20my%20account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                    >
                      <FaWhatsapp className="text-green-600 text-base sm:text-lg" />
                      <span>Contact Support</span>
                    </a>
                    <a
                      href="https://chat.whatsapp.com/EstSwEm3q9Z4sS42Ed5N8u?mode=ac_t"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                    >
                      <FaUsers className="text-sky-500 text-base sm:text-lg" />
                      <span>Join Community</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};