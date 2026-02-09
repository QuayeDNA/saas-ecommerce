// src/hooks/use-debounce.ts
import { useCallback, useRef } from 'react';

type DebouncedFunction<T extends (...args: unknown[]) => unknown> = T & {
  cleanup: () => void;
};

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): DebouncedFunction<T> {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      cleanup();
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as DebouncedFunction<T>,
    [callback, delay, cleanup]
  );

  debouncedCallback.cleanup = cleanup;
  return debouncedCallback;
}