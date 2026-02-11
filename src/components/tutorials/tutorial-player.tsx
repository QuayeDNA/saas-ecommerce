/**
 * Tutorial Player
 *
 * Full-screen overlay component that plays through tutorial steps.
 * Features: element spotlight, tooltip positioning, step progress,
 * task checkmarks, keyboard navigation, mobile-friendly.
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
    X,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Circle,
    Lightbulb,
    SkipForward,
} from "lucide-react";
import { Button } from "../../design-system";
import { useTutorial } from "../../hooks/use-tutorial";

// --- Helpers ---

function clamp(val: number, min: number, max: number) {
    return Math.min(Math.max(val, min), max);
}

// --- Component ---

export const TutorialPlayer: React.FC = () => {
    const {
        activeTutorial,
        activeStep,
        nextStep,
        prevStep,
        closeTutorial,
    } = useTutorial();

    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
        top: 0,
        left: 0,
    });
    const [visible, setVisible] = useState(false);

    const step = activeTutorial?.steps[activeStep];
    const totalSteps = activeTutorial?.steps.length ?? 0;
    const isFirst = activeStep === 0;
    const isLast = activeStep === totalSteps - 1;
    const progress = totalSteps > 0 ? ((activeStep + 1) / totalSteps) * 100 : 0;

    // --- Position the spotlight and tooltip ---

    const updatePosition = useCallback(() => {
        if (!step) return;

        if (step.target) {
            const el = document.querySelector(step.target);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect(rect);

                // Scroll into view if off-screen
                if (
                    rect.top < 0 ||
                    rect.bottom > window.innerHeight ||
                    rect.left < 0 ||
                    rect.right > window.innerWidth
                ) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }

                // Position tooltip
                const pos = step.position || "bottom";
                const pad = 16;
                const ttW = 340;
                const ttH = 220;

                let top = 0;
                let left = 0;

                switch (pos) {
                    case "top":
                        top = rect.top - ttH - pad;
                        left = rect.left + rect.width / 2 - ttW / 2;
                        break;
                    case "right":
                        top = rect.top + rect.height / 2 - ttH / 2;
                        left = rect.right + pad;
                        break;
                    case "left":
                        top = rect.top + rect.height / 2 - ttH / 2;
                        left = rect.left - ttW - pad;
                        break;
                    case "bottom":
                    default:
                        top = rect.bottom + pad;
                        left = rect.left + rect.width / 2 - ttW / 2;
                }

                setTooltipPos({
                    top: clamp(top, 16, window.innerHeight - ttH - 16),
                    left: clamp(left, 16, window.innerWidth - ttW - 16),
                });
            } else {
                // Target not found — center
                setTargetRect(null);
                centerTooltip();
            }
        } else {
            // No target — center modal-style
            setTargetRect(null);
            centerTooltip();
        }
    }, [step]);

    const centerTooltip = () => {
        setTooltipPos({
            top: Math.max(window.innerHeight / 2 - 130, 16),
            left: Math.max(window.innerWidth / 2 - 170, 16),
        });
    };

    // Update position on step change and resize
    useEffect(() => {
        if (!activeTutorial) {
            setVisible(false);
            return;
        }

        // Small delay to allow DOM to settle
        const t = setTimeout(() => {
            updatePosition();
            setVisible(true);
        }, 100);

        const handleResize = () => updatePosition();
        window.addEventListener("resize", handleResize);

        // Fire onEnter
        step?.onEnter?.();

        return () => {
            clearTimeout(t);
            window.removeEventListener("resize", handleResize);
        };
    }, [activeTutorial, activeStep, updatePosition, step]);

    // Keyboard navigation
    useEffect(() => {
        if (!activeTutorial) return;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeTutorial();
            if (e.key === "ArrowRight" || e.key === "Enter") nextStep();
            if (e.key === "ArrowLeft") prevStep();
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [activeTutorial, closeTutorial, nextStep, prevStep]);

    if (!activeTutorial || !step) return null;

    const spotlightPad = 8;

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"
                }`}
            role="dialog"
            aria-modal="true"
            aria-label={`Tutorial: ${activeTutorial.title}`}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={closeTutorial} />

            {/* Spotlight cutout */}
            {targetRect && (
                <div
                    className="absolute rounded-lg ring-4 ring-blue-400/60 pointer-events-none"
                    style={{
                        top: targetRect.top - spotlightPad,
                        left: targetRect.left - spotlightPad,
                        width: targetRect.width + spotlightPad * 2,
                        height: targetRect.height + spotlightPad * 2,
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.50)",
                        zIndex: 10000,
                    }}
                />
            )}

            {/* Tooltip card */}
            <div
                ref={tooltipRef}
                className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 w-[340px] max-w-[calc(100vw-32px)] pointer-events-auto"
                style={{
                    top: tooltipPos.top,
                    left: tooltipPos.left,
                    zIndex: 10001,
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                            {step.icon || (
                                step.isTask ? (
                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                ) : (
                                    <Lightbulb className="w-4 h-4 text-blue-600" />
                                )
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                                {step.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Step {activeStep + 1} of {totalSteps}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={closeTutorial}
                        className="text-gray-400 hover:text-gray-600 p-1 -m-1 shrink-0 transition"
                        aria-label="Close tutorial"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 pb-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {step.content}
                    </p>
                </div>

                {/* Step dots */}
                {totalSteps > 1 && (
                    <div className="px-4 pb-2 flex items-center gap-1 flex-wrap">
                        {activeTutorial.steps.map((s, i) => (
                            <div key={i} className="flex items-center">
                                {s.isTask ? (
                                    i < activeStep ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    ) : i === activeStep ? (
                                        <Circle className="w-3.5 h-3.5 text-blue-500 fill-blue-100" />
                                    ) : (
                                        <Circle className="w-3.5 h-3.5 text-gray-300" />
                                    )
                                ) : (
                                    <div
                                        className={`w-2 h-2 rounded-full transition-colors ${i <= activeStep ? "bg-blue-500" : "bg-gray-200"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress bar */}
                <div className="mx-4 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs text-gray-400">{Math.round(progress)}%</span>

                    <div className="flex items-center gap-2">
                        {!isFirst && (
                            <Button variant="ghost" size="sm" onClick={prevStep}>
                                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                            </Button>
                        )}
                        {isFirst && (
                            <Button variant="ghost" size="sm" onClick={closeTutorial}>
                                <SkipForward className="w-3.5 h-3.5 mr-1" /> Skip
                            </Button>
                        )}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={nextStep}
                        >
                            {step.ctaText ?? (isLast ? "Finish" : "Next")}
                            {!isLast && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default TutorialPlayer;
