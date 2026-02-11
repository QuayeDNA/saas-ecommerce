/**
 * Tutorial Auto-Trigger
 *
 * Automatically suggests relevant tutorials when a user first visits a page.
 * Renders a dismissible toast-style prompt at the bottom of the screen.
 */

import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { BookOpen, X, Play } from "lucide-react";
import { useTutorial } from "../../hooks/use-tutorial";
import { getTutorialsForRoute } from "../../constants/tutorials";
import type { Tutorial } from "../../constants/tutorials";

export const TutorialAutoTrigger: React.FC = () => {
  const location = useLocation();
  const {
    markPageVisited,
    hasVisitedPage,
    isCompleted,
    isDismissed,
    startTutorial,
    dismissTutorial,
    activeTutorial,
  } = useTutorial();

  const [suggestion, setSuggestion] = useState<Tutorial | null>(null);
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (suggestion) {
      dismissTutorial(suggestion.id);
    }
    setTimeout(() => setSuggestion(null), 300);
  }, [suggestion, dismissTutorial]);

  const accept = useCallback(() => {
    if (suggestion) {
      setVisible(false);
      setTimeout(() => {
        startTutorial(suggestion.id);
        setSuggestion(null);
      }, 200);
    }
  }, [suggestion, startTutorial]);

  useEffect(() => {
    // Don't trigger if there's already a tutorial playing
    if (activeTutorial) return;

    const path = location.pathname;

    // If the user has already visited this page, skip
    if (hasVisitedPage(path)) return;

    // Mark the page as visited
    markPageVisited(path);

    // Find tutorials relevant to this page
    const relevantTutorials = getTutorialsForRoute(path);

    // Find the first un-completed, un-dismissed tutorial
    const candidate = relevantTutorials.find(
      (t) => !isCompleted(t.id) && !isDismissed(t.id),
    );

    if (candidate) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setSuggestion(candidate);
        // Trigger entrance animation
        requestAnimationFrame(() => setVisible(true));
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [
    location.pathname,
    activeTutorial,
    hasVisitedPage,
    markPageVisited,
    isCompleted,
    isDismissed,
  ]);

  // Don't render if playing a tutorial or no suggestion
  if (activeTutorial || !suggestion) return null;

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 sm:left-auto sm:right-24 z-30 sm:w-80 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {suggestion.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {suggestion.description}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={accept}
                className="flex items-center gap-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition"
              >
                <Play className="w-3 h-3" />
                Start tutorial
              </button>
              <button
                onClick={dismiss}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 transition"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 text-gray-300 hover:text-gray-500 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialAutoTrigger;
