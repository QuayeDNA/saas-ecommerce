/**
 * Tutorial Context
 *
 * Manages tutorial state: active tutorial, completion tracking, per-page
 * first-visit auto-triggering, and progress persistence via localStorage.
 */

import React, {
    createContext,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";
import {
    TUTORIALS,
    getTutorialsForRole,
    type Tutorial,
    type TutorialCategory,
    CATEGORY_LABELS,
    groupTutorialsByCategory,
} from "../constants/tutorials";

// --- Storage keys ---

const STORAGE_KEY_COMPLETED = "tutorials_completed";
const STORAGE_KEY_VISITED = "tutorials_visited_pages";
const STORAGE_KEY_DISMISSED = "tutorials_dismissed";

// --- Helpers ---

const loadSet = (key: string): Set<string> => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
};

const saveSet = (key: string, set: Set<string>) => {
    localStorage.setItem(key, JSON.stringify([...set]));
};

// --- Context value ---

export interface TutorialContextValue {
    /** Currently active tutorial (null = none playing) */
    activeTutorial: Tutorial | null;
    /** Current step index within the active tutorial */
    activeStep: number;
    /** Start a tutorial by its id */
    startTutorial: (id: string) => void;
    /** Advance to next step (or complete if last) */
    nextStep: () => void;
    /** Go back one step */
    prevStep: () => void;
    /** Skip / close the active tutorial */
    closeTutorial: () => void;
    /** Mark a tutorial as completed */
    completeTutorial: (id: string) => void;
    /** Check if a tutorial has been completed */
    isCompleted: (id: string) => boolean;
    /** Reset a tutorial (un-complete it) */
    resetTutorial: (id: string) => void;
    /** Reset all tutorials */
    resetAllTutorials: () => void;
    /** Mark a page as visited (for auto-trigger tracking) */
    markPageVisited: (path: string) => void;
    /** Check if a page has been visited before */
    hasVisitedPage: (path: string) => boolean;
    /** Dismiss auto-show for a tutorial */
    dismissTutorial: (id: string) => void;
    /** Check if auto-show was dismissed */
    isDismissed: (id: string) => boolean;
    /** All tutorials available for the current role */
    availableTutorials: Tutorial[];
    /** Tutorials grouped by category */
    tutorialsByCategory: Record<TutorialCategory, Tutorial[]>;
    /** Category display labels */
    categoryLabels: Record<TutorialCategory, string>;
    /** Completion count */
    completedCount: number;
    /** Total available count */
    totalCount: number;
    /** Whether the launcher menu is open */
    isLauncherOpen: boolean;
    /** Toggle the launcher menu */
    setLauncherOpen: (open: boolean) => void;
}

export const TutorialContext = createContext<TutorialContextValue | undefined>(
    undefined,
);

// --- Provider ---

interface TutorialProviderProps {
    children: ReactNode;
    /** Current user's role (for filtering tutorials by role) */
    userRole?: string;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({
    children,
    userRole = "agent",
}) => {
    const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [completedIds, setCompletedIds] = useState<Set<string>>(
        () => loadSet(STORAGE_KEY_COMPLETED),
    );
    const [visitedPages, setVisitedPages] = useState<Set<string>>(
        () => loadSet(STORAGE_KEY_VISITED),
    );
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(
        () => loadSet(STORAGE_KEY_DISMISSED),
    );
    const [isLauncherOpen, setLauncherOpen] = useState(false);

    // Tutorials available for the current user role
    const availableTutorials = useMemo(
        () => getTutorialsForRole(userRole, TUTORIALS),
        [userRole],
    );

    const tutorialsByCategory = useMemo(
        () => groupTutorialsByCategory(availableTutorials),
        [availableTutorials],
    );

    const completedCount = useMemo(
        () => availableTutorials.filter((t) => completedIds.has(t.id)).length,
        [availableTutorials, completedIds],
    );

    // --- Actions ---

    const startTutorial = useCallback(
        (id: string) => {
            const tutorial = availableTutorials.find((t) => t.id === id);
            if (!tutorial) return;
            setActiveTutorial(tutorial);
            setActiveStep(0);
            setLauncherOpen(false);
        },
        [availableTutorials],
    );

    const nextStep = useCallback(() => {
        if (!activeTutorial) return;
        if (activeStep < activeTutorial.steps.length - 1) {
            setActiveStep((s) => s + 1);
        } else {
            // Complete
            completeTutorialInner(activeTutorial.id);
            setActiveTutorial(null);
            setActiveStep(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTutorial, activeStep]);

    const prevStep = useCallback(() => {
        setActiveStep((s) => Math.max(0, s - 1));
    }, []);

    const closeTutorial = useCallback(() => {
        setActiveTutorial(null);
        setActiveStep(0);
    }, []);

    const completeTutorialInner = useCallback((id: string) => {
        setCompletedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            saveSet(STORAGE_KEY_COMPLETED, next);
            return next;
        });
    }, []);

    const completeTutorial = completeTutorialInner;

    const isCompleted = useCallback(
        (id: string) => completedIds.has(id),
        [completedIds],
    );

    const resetTutorial = useCallback((id: string) => {
        setCompletedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            saveSet(STORAGE_KEY_COMPLETED, next);
            return next;
        });
        setDismissedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            saveSet(STORAGE_KEY_DISMISSED, next);
            return next;
        });
    }, []);

    const resetAllTutorials = useCallback(() => {
        setCompletedIds(new Set());
        setDismissedIds(new Set());
        setVisitedPages(new Set());
        localStorage.removeItem(STORAGE_KEY_COMPLETED);
        localStorage.removeItem(STORAGE_KEY_DISMISSED);
        localStorage.removeItem(STORAGE_KEY_VISITED);
    }, []);

    const markPageVisited = useCallback((path: string) => {
        setVisitedPages((prev) => {
            const next = new Set(prev);
            next.add(path);
            saveSet(STORAGE_KEY_VISITED, next);
            return next;
        });
    }, []);

    const hasVisitedPage = useCallback(
        (path: string) => visitedPages.has(path),
        [visitedPages],
    );

    const dismissTutorial = useCallback((id: string) => {
        setDismissedIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            saveSet(STORAGE_KEY_DISMISSED, next);
            return next;
        });
    }, []);

    const isDismissed = useCallback(
        (id: string) => dismissedIds.has(id),
        [dismissedIds],
    );

    const value = useMemo<TutorialContextValue>(
        () => ({
            activeTutorial,
            activeStep,
            startTutorial,
            nextStep,
            prevStep,
            closeTutorial,
            completeTutorial,
            isCompleted,
            resetTutorial,
            resetAllTutorials,
            markPageVisited,
            hasVisitedPage,
            dismissTutorial,
            isDismissed,
            availableTutorials,
            tutorialsByCategory,
            categoryLabels: CATEGORY_LABELS,
            completedCount,
            totalCount: availableTutorials.length,
            isLauncherOpen,
            setLauncherOpen,
        }),
        [
            activeTutorial,
            activeStep,
            startTutorial,
            nextStep,
            prevStep,
            closeTutorial,
            completeTutorial,
            isCompleted,
            resetTutorial,
            resetAllTutorials,
            markPageVisited,
            hasVisitedPage,
            dismissTutorial,
            isDismissed,
            availableTutorials,
            tutorialsByCategory,
            completedCount,
            isLauncherOpen,
            setLauncherOpen,
        ],
    );

    return (
        <TutorialContext.Provider value={value}>
            {children}
        </TutorialContext.Provider>
    );
};
