import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Smartphone, Zap, Check } from "lucide-react";
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
              <div className="text-right sm:text-left">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.24em] text-slate-400">
                  BryteLinks
                </p>
                <p className="text-xs sm:text-sm text-slate-300">
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
              <div className="hidden lg:flex items-center justify-center bg-slate-900 px-8 py-10">
                <div className="max-w-xs text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-slate-100">
                    <Smartphone size={34} />
                  </div>
                  <h2 className="text-3xl font-semibold text-white mb-3">
                    Sell Data & Airtime
                  </h2>
                  <p className="text-sm leading-6 text-slate-300">
                    Start vending cheap data bundles and airtime across all
                    networks. Fast, reliable, and instant.
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                    <Zap size={16} />
                    Instant Topups
                  </div>
                </div>
              </div>

              <div className="px-4 py-6 sm:px-10 sm:py-10">
                <CardHeader className="px-0 pb-4 border-b border-slate-200/70">
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 text-slate-700">
                      <div className="flex h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-900 text-white">
                        <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.24em] text-slate-500 font-medium">
                          Agent Portal
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
