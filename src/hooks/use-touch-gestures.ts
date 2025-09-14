import { useState, useEffect, useCallback, useRef } from "react";

type SwipeDirection = "left" | "right" | "up" | "down" | null;

interface TouchPosition {
  x: number;
  y: number;
}

interface SwipeConfig {
  threshold?: number; // Minimum distance for swipe detection
  velocity?: number; // Minimum velocity for swipe detection
  maxTime?: number; // Maximum time for swipe gesture
}

interface SwipeState {
  isSwiping: boolean;
  direction: SwipeDirection;
  distance: number;
  velocity: number;
}

export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  config: SwipeConfig = {}
) => {
  const { threshold = 50, velocity = 0.3, maxTime = 1000 } = config;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    distance: 0,
    velocity: 0,
  });

  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchStartTimeRef.current = Date.now();

    setSwipeState({
      isSwiping: true,
      direction: null,
      distance: 0,
      velocity: 0,
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const timeElapsed = Date.now() - touchStartTimeRef.current;
    const currentVelocity = distance / timeElapsed;

    let direction: "left" | "right" | "up" | "down" | null = null;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      direction = deltaX > 0 ? "right" : "left";
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? "down" : "up";
    }

    setSwipeState({
      isSwiping: true,
      direction,
      distance,
      velocity: currentVelocity,
    });
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || !swipeState.isSwiping) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const timeElapsed = Date.now() - touchStartTimeRef.current;
      const finalVelocity = distance / timeElapsed;

      // Check if swipe meets criteria
      if (
        distance >= threshold &&
        finalVelocity >= velocity &&
        timeElapsed <= maxTime
      ) {
        let direction: "left" | "right" | "up" | "down" | null = null;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? "right" : "left";
        } else {
          direction = deltaY > 0 ? "down" : "up";
        }

        // Trigger appropriate callback
        switch (direction) {
          case "left":
            onSwipeLeft?.();
            break;
          case "right":
            onSwipeRight?.();
            break;
          case "up":
            onSwipeUp?.();
            break;
          case "down":
            onSwipeDown?.();
            break;
        }
      }

      // Reset state
      setSwipeState({
        isSwiping: false,
        direction: null,
        distance: 0,
        velocity: 0,
      });

      touchStartRef.current = null;
      touchStartTimeRef.current = 0;
    },
    [
      swipeState.isSwiping,
      threshold,
      velocity,
      maxTime,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
    ]
  );

  const attachToElement = useCallback(
    (element: HTMLElement | null) => {
      // Remove listeners from previous element
      if (elementRef.current) {
        elementRef.current.removeEventListener("touchstart", handleTouchStart);
        elementRef.current.removeEventListener("touchmove", handleTouchMove);
        elementRef.current.removeEventListener("touchend", handleTouchEnd);
      }

      elementRef.current = element;

      // Add listeners to new element
      if (element) {
        element.addEventListener("touchstart", handleTouchStart, {
          passive: true,
        });
        element.addEventListener("touchmove", handleTouchMove, {
          passive: true,
        });
        element.addEventListener("touchend", handleTouchEnd, { passive: true });
      }
    },
    [handleTouchStart, handleTouchMove, handleTouchEnd]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener("touchstart", handleTouchStart);
        elementRef.current.removeEventListener("touchmove", handleTouchMove);
        elementRef.current.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ...swipeState,
    attachToElement,
  };
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (
  onRefresh: () => Promise<void>,
  config: { threshold?: number; maxPull?: number } = {}
) => {
  const { threshold = 80, maxPull = 120 } = config;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (isRefreshing) return;
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    },
    [isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || isRefreshing || startY === 0) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);

      // Only allow pull when at the top of the scrollable area
      const target = e.target as HTMLElement;
      const scrollableParent = target.closest("[data-pull-refresh]");
      if (scrollableParent && scrollableParent.scrollTop > 0) return;

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance * 0.5, maxPull));
      }
    },
    [isPulling, isRefreshing, startY, maxPull]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || isRefreshing) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setStartY(0);
  }, [isPulling, isRefreshing, pullDistance, threshold, onRefresh]);

  const attachToElement = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;

      element.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      element.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      element.addEventListener("touchend", handleTouchEnd, { passive: true });

      return () => {
        element.removeEventListener("touchstart", handleTouchStart);
        element.removeEventListener("touchmove", handleTouchMove);
        element.removeEventListener("touchend", handleTouchEnd);
      };
    },
    [handleTouchStart, handleTouchMove, handleTouchEnd]
  );

  return {
    isRefreshing,
    pullDistance,
    attachToElement,
  };
};
