// Reason: Accessible toast component to announce copy actions via screen readers.
"use client";
import { useEffect, useState } from "react";

import type { JSX } from "react";

export interface ToastProps {
  /** Message to display. */
  message: string;
  /** Time in ms the toast stays visible. */
  duration?: number;
}

/**
 * Toast renders a polite ARIA live region for transient notifications.
 */
export default function Toast({ message, duration = 2000 }: ToastProps): JSX.Element | null {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!message) return;
    const showId = window.setTimeout(() => setVisible(true), 0);
    const hideId = window.setTimeout(() => setVisible(false), duration);
    return () => {
      window.clearTimeout(showId);
      window.clearTimeout(hideId);
    };
  }, [message, duration]);

  if (!visible) return null;
  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-2xl border bg-white/90 px-3 py-2 text-sm shadow">
      {message}
    </div>
  );
}