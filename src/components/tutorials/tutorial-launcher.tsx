/**
 * Tutorial Launcher
 *
 * Floating help button + slide-out panel listing all available tutorials
 * grouped by category. Shows completion status and progress.
 */

import React from "react";
import {
  HelpCircle,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Badge } from "../../design-system";
import { useTutorial } from "../../hooks/use-tutorial";
import type { TutorialCategory } from "../../constants/tutorials";

// --- Category icons ---

const CATEGORY_ICONS: Record<TutorialCategory, React.ReactNode> = {
  "getting-started": <BookOpen className="w-4 h-4" />,
  ordering: <Play className="w-4 h-4" />,
  storefront: <BookOpen className="w-4 h-4" />,
  wallet: <BookOpen className="w-4 h-4" />,
  commissions: <BookOpen className="w-4 h-4" />,
  admin: <BookOpen className="w-4 h-4" />,
};

// --- Component ---

export const TutorialLauncher: React.FC = () => {
  const {
    isLauncherOpen,
    setLauncherOpen,
    tutorialsByCategory,
    categoryLabels,
    startTutorial,
    isCompleted,
    resetTutorial,
    completedCount,
    totalCount,
    activeTutorial,
    resetAllTutorials,
  } = useTutorial();

  // Don't show the FAB while a tutorial is playing
  if (activeTutorial) return null;

  return (
    <>
      {/* Floating help button */}
      <button
        onClick={() => setLauncherOpen(!isLauncherOpen)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
        aria-label="Open tutorials"
      >
        {isLauncherOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <>
            <HelpCircle className="w-5 h-5" />
            {completedCount < totalCount && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalCount - completedCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Slide-out panel */}
      {isLauncherOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 sm:bg-transparent"
            onClick={() => setLauncherOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-96 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">Tutorials</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    colorScheme={completedCount === totalCount ? "success" : "info"}
                    size="xs"
                    variant="subtle"
                  >
                    {completedCount}/{totalCount} done
                  </Badge>
                  {completedCount > 0 && (
                    <button
                      onClick={resetAllTutorials}
                      className="text-xs text-gray-400 hover:text-gray-600 transition"
                      title="Reset all tutorials"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{
                    width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%",
                  }}
                />
              </div>
            </div>

            {/* Tutorial list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {(Object.entries(tutorialsByCategory) as [TutorialCategory, typeof tutorialsByCategory[TutorialCategory]][]).map(
                ([category, tutorials]) => (
                  <div key={category}>
                    <div className="flex items-center gap-1.5 mb-2 px-1">
                      <span className="text-gray-400">
                        {CATEGORY_ICONS[category]}
                      </span>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {categoryLabels[category]}
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      {tutorials.map((tutorial) => {
                        const done = isCompleted(tutorial.id);
                        return (
                          <button
                            key={tutorial.id}
                            onClick={() => startTutorial(tutorial.id)}
                            className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition group"
                          >
                            <div
                              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                done
                                  ? "bg-green-50 text-green-600"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              {done ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${
                                  done ? "text-gray-500" : "text-gray-900"
                                }`}
                              >
                                {tutorial.title}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {tutorial.description}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-1.5">
                              {tutorial.estimatedMinutes && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                  <Clock className="w-3 h-3" />
                                  {tutorial.estimatedMinutes}m
                                </span>
                              )}
                              {done ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    resetTutorial(tutorial.id);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 p-1 transition opacity-0 group-hover:opacity-100"
                                  title="Reset this tutorial"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </button>
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 shrink-0">
              <p className="text-xs text-gray-400 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">?</kbd> anytime to open tutorials
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TutorialLauncher;
