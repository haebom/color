// Reason: Debounce helper to avoid excessive state updates while typing/sliding.
import { useEffect, useRef } from "react";

/**
 * useDebounce calls fn after delay when deps change.
 */
export function useDebounce(fn: () => void, delay: number, deps: ReadonlyArray<unknown>): void {
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      fn();
    }, delay);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}